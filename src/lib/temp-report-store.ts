import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

interface TempReportRecord {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
  longitude: number;
  latitude: number;
  country: string | null;
  parsedData: string | null;
  rawAstrolabe: string | null;
  aiReport: string | null;
  coreIdentity: string | null;
  apiCalledAt: Date | null;
  apiRetryCount: number;
  paidAt: Date | null;
  createdAt: Date;
  completedAt: Date | null;
}

interface CreateTempReportInput {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthMinute?: number;
  birthCity: string;
  longitude: number;
  latitude?: number;
  country?: string | null;
  parsedData?: string | null;
  rawAstrolabe?: string | null;
  aiReport?: string | null;
  coreIdentity?: string | null;
  paidAt?: Date | null;
  createdAt?: Date;
  completedAt?: Date | null;
}

type TempReportUpdate = Partial<Omit<TempReportRecord, 'id' | 'createdAt'>> & {
  createdAt?: Date;
};

const globalForTempReports = globalThis as unknown as {
  tempReports: Map<string, TempReportRecord> | undefined;
};

const tempReports = globalForTempReports.tempReports ?? new Map<string, TempReportRecord>();

function resolveTempReportsFile() {
  const overridePath = process.env.TEMP_REPORTS_FILE?.trim();

  if (overridePath) {
    return overridePath;
  }

  if (process.env.VERCEL) {
    return join(tmpdir(), 'tianming-secrets', 'temp-reports.json');
  }

  return join(process.cwd(), '.local', 'temp-reports.json');
}

const tempReportsFile = resolveTempReportsFile();

if (!globalForTempReports.tempReports) {
  globalForTempReports.tempReports = tempReports;
}

function ensureTempReportsDirectory() {
  const directory = dirname(tempReportsFile);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function serializeTempReport(report: TempReportRecord) {
  return {
    ...report,
    apiCalledAt: report.apiCalledAt ? report.apiCalledAt.toISOString() : null,
    paidAt: report.paidAt ? report.paidAt.toISOString() : null,
    createdAt: report.createdAt.toISOString(),
    completedAt: report.completedAt ? report.completedAt.toISOString() : null,
  };
}

function deserializeTempReport(report: {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
  longitude: number;
  latitude: number;
  country: string | null;
  parsedData?: string | null;
  rawAstrolabe: string | null;
  aiReport: string | null;
  coreIdentity: string | null;
  apiCalledAt: string | null;
  apiRetryCount: number;
  paidAt: string | null;
  createdAt: string;
  completedAt: string | null;
}): TempReportRecord {
  return {
    ...report,
    parsedData: report.parsedData ?? null,
    apiCalledAt: report.apiCalledAt ? new Date(report.apiCalledAt) : null,
    paidAt: report.paidAt ? new Date(report.paidAt) : null,
    createdAt: new Date(report.createdAt),
    completedAt: report.completedAt ? new Date(report.completedAt) : null,
  };
}

function syncTempReportsFromDisk() {
  ensureTempReportsDirectory();

  if (!existsSync(tempReportsFile)) {
    return;
  }

  try {
    const raw = readFileSync(tempReportsFile, 'utf8');

    if (!raw.trim()) {
      return;
    }

    const parsed = JSON.parse(raw) as ReturnType<typeof serializeTempReport>[];

    tempReports.clear();

    for (const report of parsed) {
      tempReports.set(report.id, deserializeTempReport(report));
    }
  } catch (error) {
    console.warn('Failed to load temporary reports from disk:', error);
  }
}

function persistTempReportsToDisk() {
  ensureTempReportsDirectory();

  try {
    const serialized = JSON.stringify(
      [...tempReports.values()].map((report) => serializeTempReport(report)),
      null,
      2
    );

    writeFileSync(tempReportsFile, serialized, 'utf8');
  } catch (error) {
    console.warn('Failed to persist temporary reports to disk:', error);
  }
}

function cloneDate(value: Date | null): Date | null {
  return value ? new Date(value) : null;
}

function cloneTempReport(report: TempReportRecord): TempReportRecord {
  return {
    ...report,
    apiCalledAt: cloneDate(report.apiCalledAt),
    paidAt: cloneDate(report.paidAt),
    createdAt: new Date(report.createdAt),
    completedAt: cloneDate(report.completedAt),
  };
}

export function createTempReport(input: CreateTempReportInput): TempReportRecord {
  syncTempReportsFromDisk();

  const report: TempReportRecord = {
    id: input.id,
    email: input.email,
    gender: input.gender,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthMinute: input.birthMinute ?? 0,
    birthCity: input.birthCity,
    longitude: input.longitude,
    latitude: input.latitude ?? 0,
    country: input.country ?? null,
    parsedData: input.parsedData ?? null,
    rawAstrolabe: input.rawAstrolabe ?? null,
    aiReport: input.aiReport ?? null,
    coreIdentity: input.coreIdentity ?? null,
    apiCalledAt: null,
    apiRetryCount: 0,
    paidAt: input.paidAt ?? null,
    createdAt: input.createdAt ?? new Date(),
    completedAt: input.completedAt ?? null,
  };

  tempReports.set(report.id, report);
  persistTempReportsToDisk();

  return cloneTempReport(report);
}

export function getTempReport(id: string): TempReportRecord | null {
  syncTempReportsFromDisk();

  const report = tempReports.get(id);
  return report ? cloneTempReport(report) : null;
}

export function updateTempReport(id: string, updates: TempReportUpdate): TempReportRecord | null {
  syncTempReportsFromDisk();

  const existing = tempReports.get(id);

  if (!existing) {
    return null;
  }

  const nextReport: TempReportRecord = {
    ...existing,
    ...updates,
    apiCalledAt: updates.apiCalledAt === undefined ? existing.apiCalledAt : updates.apiCalledAt,
    paidAt: updates.paidAt === undefined ? existing.paidAt : updates.paidAt,
    completedAt: updates.completedAt === undefined ? existing.completedAt : updates.completedAt,
    createdAt: updates.createdAt ?? existing.createdAt,
  };

  tempReports.set(id, nextReport);
  persistTempReportsToDisk();

  return cloneTempReport(nextReport);
}
