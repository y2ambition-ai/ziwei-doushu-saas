/**
 * OpenAI-compatible LLM integration.
 */

import fs from 'node:fs';
import path from 'node:path';

import { formatAstrolabeForLLM } from '../ziwei/wrapper';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LLMConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface GenerateReportInput {
  email: string;
  gender: string;
  locale?: 'en';
  country?: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  mingGong: string;
  wuXingJu: string;
  chineseZodiac: string;
  zodiac: string;
  siZhu: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  palaces: Array<{
    name: string;
    majorStars: string[];
    minorStars: string[];
  }>;
  rawAstrolabe?: unknown;
}

export interface GenerateReportOutput {
  coreIdentity: string;
  report: string;
}

// ─── Configuration ─────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://ai.gs88.shop/v1';
const DEFAULT_MODEL = 'gpt-5.2';
let cachedProjectEnv: Record<string, string> | null = null;

function loadProjectEnv(): Record<string, string> {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return {};
  }

  if (cachedProjectEnv) {
    return cachedProjectEnv;
  }

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    cachedProjectEnv = {};
    return cachedProjectEnv;
  }

  const values: Record<string, string> = {};
  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    values[key] = value;
  }

  cachedProjectEnv = values;
  return values;
}

function readEnvValue(...names: string[]): string | undefined {
  const projectEnv = loadProjectEnv();

  for (const name of names) {
    const localValue = projectEnv[name]?.trim();
    if (localValue) {
      return localValue;
    }

    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function normalizeBaseURL(baseURL: string): string {
  const trimmed = baseURL.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return DEFAULT_BASE_URL;
  }

  if (/\/responses$/i.test(trimmed)) {
    return trimmed.replace(/\/responses$/i, '');
  }

  if (/\/chat\/completions$/i.test(trimmed)) {
    return trimmed.replace(/\/chat\/completions$/i, '');
  }

  try {
    const url = new URL(trimmed);

    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/v1';
    }

    return url.toString().replace(/\/+$/, '');
  } catch {
    return trimmed;
  }
}

export function resolveLLMConfig(config: LLMConfig = {}) {
  return {
    apiKey: config.apiKey || readEnvValue('OPENAI_API_KEY', 'DOUBAO_API_KEY') || '',
    baseURL: normalizeBaseURL(
      config.baseURL || readEnvValue('OPENAI_BASE_URL', 'DOUBAO_BASE_URL') || DEFAULT_BASE_URL
    ),
    model: config.model || readEnvValue('OPENAI_MODEL', 'DOUBAO_MODEL') || DEFAULT_MODEL,
  };
}

export function hasLLMConfig(config: LLMConfig = {}): boolean {
  return Boolean(resolveLLMConfig(config).apiKey);
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const ENGLISH_SECTION_HEADINGS = [
  '## Core Chart Identity',
  '## Main Life Directions',
  '## Current Major Cycle',
  '## Annual Timing',
  '## Family, Partnership, and Health',
  '## Lucky Elements and Practical Guidance',
] as const;

const ENGLISH_SYSTEM_PROMPT = `You are an expert Zi Wei Dou Shu analyst.

You must reply in English only. Do not add Chinese headings, opening notes, disclaimers, word counts, self-corrections, or meta commentary.
Write like a seasoned master who has reviewed many charts: calm, authoritative, precise, and never alarmist.
You are writing for a global audience. Keep the language region-neutral and do not assume the person belongs to any specific country, school system, legal system, or social structure.
You must follow this exact output contract. Do not rename the summary label or the section headings:

Core Identity: <1-2 sentences summarizing temperament, strengths, and the current life direction>

## Core Chart Identity
## Main Life Directions
## Current Major Cycle
## Annual Timing
## Family, Partnership, and Health
## Lucky Elements and Practical Guidance

Requirements:
- Lead with judgment, then evidence, then practical guidance. It should read like a final reading, not a generic article.
- Explain traditional terms immediately in plain English.
- Adjust the emphasis by life stage:
  ages 0-12 focus on temperament, nurturing style, health rhythm, family environment, and learning tendencies;
  ages 13-22 focus on growth, study, identity, friendships, boundaries, and family communication;
  ages 23-59 may fully cover career, wealth, and relationships;
  ages 60+ focus on health, daily rhythm, family bonds, emotional steadiness, and preservation rather than expansion.
- For ages 0-22, do not treat career, romance, or wealth as current core themes; mention them only as future tendencies if truly needed.
- For ages 60+, avoid aggressive expansion, high-risk competition, or restart narratives.
- Keep the overall tone reassuring. If you mention obstacles, frame them as temporary timing issues and explain how to handle them.
- If the next year contains friction, explicitly say what to stabilize first, what to avoid, and what to pursue next.
- Include 2-3 concrete Gregorian dates or time windows in Annual Timing.
- Keep the advice specific, practical, and globally understandable.
- Do not produce contradictory conclusions or hedge back and forth.
- Do not mention country-specific exams, school systems, welfare programs, immigration rules, property rules, healthcare systems, or legal institutions.
- Do not start with phrases like "Below is the report" or "Based on the chart provided".`;

type ReportLocale = 'en';
type LifeStage = 'child' | 'youth' | 'adult' | 'midlife' | 'senior';

function normalizeReportLocale(): ReportLocale {
  return 'en';
}

function containsChinese(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}

function getAgeFromBirthDate(birthDate: string, referenceDate: Date = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return 30;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  const dayDiff = referenceDate.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return Math.max(0, age);
}

function getLifeStage(age: number): LifeStage {
  if (age <= 12) {
    return 'child';
  }

  if (age <= 22) {
    return 'youth';
  }

  if (age <= 39) {
    return 'adult';
  }

  if (age <= 59) {
    return 'midlife';
  }

  return 'senior';
}

function getLifeStageLabel(stage: LifeStage): string {
  const labels: Record<LifeStage, string> = {
    child: 'Childhood',
    youth: 'Youth and Development',
    adult: 'Early Adulthood',
    midlife: 'Maturity and Responsibility',
    senior: 'Senior Years',
  };

  return labels[stage];
}

function getLifeStagePromptGuidance(stage: LifeStage): string {
  const guidance: Record<LifeStage, string> = {
    child: `- This is a child chart. Focus on temperament, nurturing style, health rhythm, family environment, learning curiosity, and the support the caregivers should provide.
- Do not treat career, romance, or wealth as current themes; mention them only as distant future tendencies if truly needed.`,
    youth: `- This is a youth chart. Focus on study rhythm, identity formation, boundaries, friendships, family communication, emotional stability, and talent development.
- Do not use region-specific education or exam terms.`,
    adult: `- This is an early-adult chart. Fully cover career, wealth, relationships, collaboration, and life direction.
- Keep every recommendation globally understandable rather than tied to one country or culture.`,
    midlife: `- This is a mature-adult chart. Focus on career consolidation, assets, family responsibility, relationship repair, and health warnings.
- Recommendations should favor steady upgrades rather than generic motivation.`,
    senior: `- This is a senior chart. Focus on health, daily rhythm, family bonds, emotional steadiness, late-life blessings, and preserving resources.
- Avoid expansionist, high-risk, or restart-heavy advice.`,
  };

  return guidance[stage];
}

function getSectionHeadings(): readonly string[] {
  return ENGLISH_SECTION_HEADINGS;
}

function unwrapMarkdownFence(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```(?:markdown|md|text)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function normalizeReportContent(content: string): string {
  return unwrapMarkdownFence(content).replace(/\r\n/g, '\n').trim();
}

function buildFallbackCoreIdentity(input: GenerateReportInput): string {
  return `Life palace ${input.mingGong}; five-element pattern ${input.wuXingJu}; born under ${input.siZhu.year} ${input.siZhu.month} ${input.siZhu.day} ${input.siZhu.hour}.`;
}

export function extractCoreIdentity(content: string): string | null {
  const normalized = normalizeReportContent(content);
  const patterns = [
    /^Core Identity:\s*(.+)$/im,
    /^\*\*Core Identity:\*\*\s*(.+)$/im,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const value = match?.[1]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function validateReportOutput(content: string): string[] {
  const normalized = normalizeReportContent(content);
  const errors: string[] = [];
  const coreIdentity = extractCoreIdentity(normalized);

  if (!coreIdentity) {
    errors.push('missing core identity');
  }

  const missingHeadings = getSectionHeadings().filter((heading) => !normalized.includes(heading));
  if (missingHeadings.length > 0) {
    errors.push(`missing headings: ${missingHeadings.join(', ')}`);
  }

  const regionSpecificPatterns = [
    /\bgaokao\b/i,
    /\bSAT\b/i,
    /\bACT\b/i,
    /\bA-?Level\b/i,
    /\bGCSE\b/i,
    /\bUCAS\b/i,
  ];

  if (regionSpecificPatterns.some((pattern) => pattern.test(normalized))) {
    errors.push('contains region-specific references');
  }

  if (containsChinese(normalized)) {
    errors.push('contains chinese characters');
  }

  return errors;
}

function getPromptBirthTimeLabel(hour: number): string {
  const englishMap: Record<number, string> = {
    0: '11 PM-1 AM',
    1: '1 AM-3 AM',
    2: '3 AM-5 AM',
    3: '5 AM-7 AM',
    4: '7 AM-9 AM',
    5: '9 AM-11 AM',
    6: '11 AM-1 PM',
    7: '1 PM-3 PM',
    8: '3 PM-5 PM',
    9: '5 PM-7 PM',
    10: '7 PM-9 PM',
    11: '9 PM-11 PM',
  };

  return englishMap[hour] || 'Unknown birth-time block';
}

// ─── User Prompt Template ─────────────────────────────────────────────────────

function buildUserPrompt(input: GenerateReportInput): string {
  normalizeReportLocale();
  const shichenName = getPromptBirthTimeLabel(input.birthTime);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const halfYearEn = currentMonth <= 6 ? 'first half' : 'second half';
  const age = getAgeFromBirthDate(input.birthDate);
  const lifeStage = getLifeStage(age);
  const lifeStageLabel = getLifeStageLabel(lifeStage);
  const lifeStageGuidance = getLifeStagePromptGuidance(lifeStage);

  let astrolabeData = '';
  if (input.rawAstrolabe) {
    astrolabeData = formatAstrolabeForLLM(input.rawAstrolabe);
  } else {
    astrolabeData = `## Chart Core
- Life palace stars: ${input.mingGong}
- Five-element pattern: ${input.wuXingJu}
- Chinese zodiac: ${input.chineseZodiac}

## Palace Stars
${formatPalaces(input.palaces)}`;
  }

  const genderEn = input.gender === 'male' ? 'Male' : 'Female';

  return `Write the final report in English only.

## Basic profile
- Gender: ${genderEn}
- Birth date: ${input.birthDate}
- Current age: ${age}
- Life stage: ${lifeStageLabel}
- Birth time block: ${shichenName}
- Birthplace reference: ${input.birthCity}
- Current timing context: ${currentYear}-${String(currentMonth).padStart(2, '0')} (${halfYearEn})

## Four pillars
- Year pillar: ${input.siZhu.year}
- Month pillar: ${input.siZhu.month}
- Day pillar: ${input.siZhu.day}
- Hour pillar: ${input.siZhu.hour}

## Chart highlights
- Life palace stars: ${input.mingGong}
- Five-element pattern: ${input.wuXingJu}
- Chinese zodiac: ${input.chineseZodiac}
- Western zodiac: ${input.zodiac}

## Full chart data
${astrolabeData}

## Life-stage emphasis
${lifeStageGuidance}

## Global wording rules
- Do not assume a specific country, city, exam system, welfare system, legal system, or migration context.
- Keep examples universal and metaphysical rather than institutional.

The raw chart data may contain non-English palace or star names. Interpret them, but keep the final answer fully in English.

Use this exact markdown structure:

Core Identity: <1-2 sentences summarizing temperament, strengths, and the current life direction>

## Core Chart Identity
- Explain the life palace pattern, major stars, and five-element pattern in plain English.

## Main Life Directions
- Follow the life-stage emphasis above.
- When the native is 23-59, cover career, wealth, and relationships separately.
- When the native is 0-22 or 60+, rewrite this section around age-appropriate themes instead of forcing adult topics.

## Current Major Cycle
- Explain the current ten-year cycle, the main opportunities, and the main risks.

## Annual Timing
- Focus on ${currentYear}.
- Mention 2-3 concrete Gregorian dates or time windows.
- Current context: ${halfYearEn}.

## Family, Partnership, and Health
- Keep the life-stage emphasis above.
- For minors, focus on caregivers, family environment, boundaries, and health rhythm.
- For seniors, prioritize health, family bonds, routine, and emotional steadiness.

## Lucky Elements and Practical Guidance
- Include lucky colors, lucky numbers, lucky directions, and 2-3 practical actions.

Output rules:
- Keep "Core Identity:" as the first line, not a heading.
- Use the exact section headings above.
- Do not number sections.
- Do not start with an introduction or end with a disclaimer.`;
}

function formatPalaces(palaces: GenerateReportInput['palaces']): string {
  return palaces
    .map((p) => {
      const stars = [...p.majorStars, ...p.minorStars];
      return `- ${p.name}: ${stars.join(', ') || 'No major stars'}`;
    })
    .join('\n');
}

// ─── Main Function ─────────────────────────────────────────────────────────────

export async function generateReport(
  input: GenerateReportInput,
  config: LLMConfig = {}
): Promise<GenerateReportOutput> {
  const { apiKey, baseURL, model } = resolveLLMConfig(config);

  const userPrompt = buildUserPrompt(input);
  const systemPrompt = ENGLISH_SYSTEM_PROMPT;

  try {
    console.log('Calling LLM API with model:', model);
    console.log('API Key exists:', !!apiKey);
    console.log('Base URL:', baseURL);
    let content = await requestReportCompletion({
      apiKey,
      baseURL,
      model,
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });

    let normalizedContent = normalizeReportContent(content);
    let validationErrors = validateReportOutput(normalizedContent);

    if (validationErrors.length > 0) {
      console.warn('LLM report failed validation, retrying once:', validationErrors.join('; '));

      content = await requestReportCompletion({
        apiKey,
        baseURL,
        model,
        systemPrompt,
        userPrompt: `${userPrompt}\n\nPrevious output failed the format check. Rewrite the entire report from scratch and follow the summary label and section headings exactly.`,
        temperature: 0.2,
      });

      normalizedContent = normalizeReportContent(content);
      validationErrors = validateReportOutput(normalizedContent);
    }

    if (validationErrors.length > 0) {
      throw new Error(`Report validation failed: ${validationErrors.join('; ')}`);
    }

    const coreIdentity = extractCoreIdentity(normalizedContent) || buildFallbackCoreIdentity(input);

    return {
      coreIdentity,
      report: normalizedContent,
    };
  } catch (error) {
    console.error('LLM API Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`AI report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface ReportCompletionRequest {
  apiKey: string;
  baseURL: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}

function extractResponseText(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const directText = Reflect.get(data, 'output_text');
  if (typeof directText === 'string' && directText.trim()) {
    return directText.trim();
  }

  const output = Reflect.get(data, 'output');
  if (!Array.isArray(output)) {
    return '';
  }

  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const content = Reflect.get(item, 'content');
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }

      const type = Reflect.get(part, 'type');
      const text = Reflect.get(part, 'text');

      if ((type === 'output_text' || type === 'text') && typeof text === 'string' && text.trim()) {
        chunks.push(text.trim());
      }
    }
  }

  return chunks.join('\n').trim();
}

async function requestReportCompletion({
  apiKey,
  baseURL,
  model,
  systemPrompt,
  userPrompt,
  temperature,
}: ReportCompletionRequest): Promise<string> {
  const response = await fetch(`${baseURL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: 6144,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Response Error:', response.status, errorText);
    throw new Error(`API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = extractResponseText(data);

  if (!content) {
    console.error('Empty response from API:', JSON.stringify(data));
    throw new Error('API returned empty content');
  }

  return content;
}

// ─── Mock Function for Development ─────────────────────────────────────────────

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function buildEnglishMockMainDirections(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- Growth focus: this stage is about temperament, learning rhythm, curiosity, and the home environment that helps the child feel safe enough to explore.
- Caregiver guidance: teach through routine, encouragement, and patient repetition; harsh pressure works against this chart.
- Future tendency: later in life, the chart is capable of steady professional progress, but right now the priority is healthy development rather than adult success metrics.`,
    youth: `- Growth focus: this stage favors identity-building, study rhythm, friendships, emotional boundaries, and choosing environments that support confidence rather than comparison.
- Family guidance: the chart responds better to calm structure and clear expectations than to constant control or criticism.
- Future tendency: long-term career and wealth potential are present, but the present task is skill-building, stability, and self-trust.`,
    adult: `- Career: ${baseAdultEnglishCareer}
- Wealth: ${baseAdultEnglishWealth}
- Relationships: ${baseAdultEnglishRelationships}`,
    midlife: `- Career and responsibility: this stage is best used to consolidate reputation, deepen authority, and simplify scattered obligations.
- Wealth and assets: the chart favors steadier allocation, cleaner boundaries, and protecting what already works before chasing unnecessary expansion.
- Relationships and family: this phase improves when expectations are spoken early and family roles are handled with fairness rather than silent pressure.`,
    senior: `- Life focus: the main theme now is health rhythm, emotional steadiness, family closeness, and preserving dignity, energy, and peace of mind.
- Resources: wealth at this stage should be framed as protection, order, and ease of living rather than expansion or risk-taking.
- Relationships: companionship, dependable family bonds, and a calm daily routine matter more than dramatic change.`,
  };

  return content[stage];
}

function buildEnglishMockFamilyHealth(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- Family dynamics: caregivers set the emotional weather, so a stable rhythm and calm tone help this child open up and learn faster.
- Development and wellbeing: watch sleep, digestion, overstimulation, and transitions between environments.
- Guidance: praise effort, not only outcomes, and keep routines predictable.`,
    youth: `- Family dynamics: the chart benefits from respectful guidance rather than heavy control; trust grows when communication stays specific and calm.
- Friendships and boundaries: this stage needs steady peers, not dramatic social circles.
- Health rhythm: protect sleep, screen balance, and emotional recovery during stressful periods.`,
    adult: `- Family dynamics improve when expectations are stated early, because this chart handles responsibility well but loses patience with ambiguity.
- Partnership rhythm favors steadiness over drama, and attraction grows through trust, competence, and reliability.
- Health guidance: protect sleep, digestion, and stress recovery, especially during periods of heavy mental load or schedule compression.`,
    midlife: `- Family dynamics: responsibility is high in this phase, so clear roles and practical communication reduce pressure for everyone.
- Relationship rhythm: maturity, consistency, and shared routines bring better results than emotional guessing.
- Health guidance: watch chronic stress, inflammation, sleep depth, and recovery after overwork.`,
    senior: `- Family dynamics: warm, regular contact and clear practical arrangements create peace of mind.
- Emotional wellbeing: this chart does better with steadiness, sunlight, movement, and a familiar daily rhythm than with disruption.
- Health guidance: focus on sleep, circulation, digestion, mobility, and timely checkups.`,
  };

  return content[stage];
}

const baseAdultEnglishCareer = 'the chart favors roles that mix strategy, coordination, and visible responsibility.';
const baseAdultEnglishWealth = 'measured accumulation beats emotional risk-taking, especially when decisions are backed by structure.';
const baseAdultEnglishRelationships = 'the chart responds well to honest pacing, direct communication, and partners who respect independence without emotional distance.';

export function generateMockReport(input: GenerateReportInput): GenerateReportOutput {
  const currentYear = getCurrentYear();
  const age = getAgeFromBirthDate(input.birthDate);
  const stage = getLifeStage(age);
  const coreIdentity = buildFallbackCoreIdentity(input);

  return {
    coreIdentity,
    report: `Core Identity: ${coreIdentity}

## Core Chart Identity
- Life palace pattern: ${input.mingGong} frames the chart's instinctive style, so the native tends to move with strong timing awareness and a practical sense of direction.
- Five-element pattern: ${input.wuXingJu} points to a steady, cumulative way of building progress, which favors disciplined systems over impulsive jumps.
- Plain-English takeaway: this chart does best when judgment, patience, and long-range planning work together.

## Main Life Directions
${buildEnglishMockMainDirections(stage)}

## Current Major Cycle
- The current ten-year cycle is better for repositioning than for standing still, so this is a phase for clarifying standards, pruning distractions, and upgrading commitments.
- Main opportunity: convert experience into authority, repeatable systems, and a cleaner public role.
- Main risk: overcommitting to urgent noise instead of the few paths that genuinely compound.

## Annual Timing
- ${currentYear}-04-18 to ${currentYear}-04-30 is favorable for proposals, interviews, or role negotiations that need visibility and decisive follow-up.
- ${currentYear}-08-12 to ${currentYear}-08-28 is a stronger window for financial decisions, partnership alignment, and resource concentration.
- ${currentYear}-11-06 to ${currentYear}-11-20 is better for review, recalibration, and closing unfinished obligations before the next cycle.

## Family, Partnership, and Health
${buildEnglishMockFamilyHealth(stage)}

## Lucky Elements and Practical Guidance
- Lucky colors: deep green, warm gold, charcoal.
- Lucky numbers: 1, 6, 8.
- Lucky directions: south, southeast.
- Practical actions: simplify one commitment this month, lock one repeatable work routine within 14 days, and schedule one concrete financial review before ${currentYear}-08-28.`,
  };
}

// ─── Test Connection ───────────────────────────────────────────────────────────

export async function testLLMConnection(config: LLMConfig = {}): Promise<boolean> {
  try {
    if (!hasLLMConfig(config)) {
      return false;
    }

    const { apiKey, baseURL, model } = resolveLLMConfig(config);
    const response = await fetch(`${baseURL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: 'Reply with OK only.',
        input: 'Ping',
        max_output_tokens: 16,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(extractResponseText(data));
  } catch {
    return false;
  }
}
