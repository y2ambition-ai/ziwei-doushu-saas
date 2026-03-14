const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) {
      return;
    }

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  });
}

function readEnvValue(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function normalizeBaseURL(baseURL) {
  const trimmed = baseURL.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return 'https://ai.gs88.shop/v1';
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

function extractResponseText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if ((part?.type === 'output_text' || part?.type === 'text') && typeof part?.text === 'string') {
        chunks.push(part.text.trim());
      }
    }
  }

  return chunks.join('\n').trim();
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));

  const apiKey = readEnvValue('OPENAI_API_KEY', 'DOUBAO_API_KEY');
  const baseURL = normalizeBaseURL(readEnvValue('OPENAI_BASE_URL', 'DOUBAO_BASE_URL') || 'https://ai.gs88.shop');
  const model = readEnvValue('OPENAI_MODEL', 'DOUBAO_MODEL') || 'gpt-5.2';

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY / DOUBAO_API_KEY in .env.local');
  }

  console.log('Base URL:', baseURL);
  console.log('Model:', model);
  console.log('API Key:', `${apiKey.slice(0, 8)}...`);

  const response = await fetch(`${baseURL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: 'You are a precise assistant. Reply in markdown.',
      input: 'Write a 5-line connectivity confirmation for the Zi Wei report generator. Mention the model is reachable and output only English.',
      max_output_tokens: 256,
      temperature: 0.2,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const content = extractResponseText(data);
  if (!content) {
    throw new Error('LLM returned no text content');
  }

  fs.writeFileSync('test-output.md', content, 'utf8');
  console.log('Saved model output to test-output.md');
  if (data.usage) {
    console.log(JSON.stringify(data.usage, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
