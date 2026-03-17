/**
 * fetch-mips.ts
 *
 * Seeds mips_scores (performance_scores table) from a MIPS Performance Scores
 * bulk CSV download.
 *
 * Usage:
 *   pnpm tsx scripts/ingest/fetch-mips.ts path/to/mips.csv
 *
 * Download the CSV from:
 *   https://data.cms.gov/provider-compliance/quality-payment-program/merit-based-incentive-payment-system-mips-performance
 *
 * Expected CSV columns (case-insensitive lookup):
 *   npi, final_mips_score, quality_category_score, pi_category_score,
 *   ia_category_score, cost_category_score
 *
 * The script upserts on (provider_npi, program_year) so it is safe to re-run.
 * No state filter — we filter purely by whether the NPI exists in our providers table.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { mipsScores, providers } from '../../src/db/schema';
import { sql as drizzleSql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BATCH_SIZE = 100;
const LOG_EVERY = 10_000;
const PROGRAM_YEAR = process.env.MIPS_YEAR
  ? parseInt(process.env.MIPS_YEAR, 10)
  : 2022;

interface MipsRecord {
  providerNpi: string;
  finalScore: string | null;
  qualityScore: string | null;
  promotingInteroperabilityScore: string | null;
  improvementActivitiesScore: string | null;
  costScore: string | null;
  programYear: number;
  updatedAt: Date;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseScoreOrNull(value: string): string | null {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'n/a') return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num.toFixed(2);
}

/**
 * Find a column index by trying multiple candidate names (case-insensitive).
 */
function findCol(headers: string[], ...candidates: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.indexOf(candidate.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

async function loadProviderNpis(db: ReturnType<typeof drizzle>): Promise<Set<string>> {
  console.log('Loading provider NPIs from DB...');
  const rows = await db.select({ npi: providers.npi }).from(providers);
  const set = new Set(rows.map((r) => r.npi));
  console.log(`  Loaded ${set.size.toLocaleString()} NPIs.\n`);
  return set;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('ERROR: No CSV path provided.');
    console.error('Usage: pnpm tsx scripts/ingest/fetch-mips.ts path/to/mips.csv');
    process.exit(1);
  }

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`ERROR: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sqlClient });

  const knownNpis = await loadProviderNpis(db);

  console.log(`Reading CSV: ${resolvedPath}`);
  console.log(`Program year: ${PROGRAM_YEAR}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log('Upsert mode: ON CONFLICT (provider_npi, program_year) DO UPDATE\n');

  const input = fs.createReadStream(resolvedPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let headers: string[] = [];
  let colNpi = -1;
  let colFinalScore = -1;
  let colQualityScore = -1;
  let colPiScore = -1;
  let colIaScore = -1;
  let colCostScore = -1;

  let totalRead = 0;
  let skippedNpi = 0;
  let inserted = 0;
  let errored = 0;

  let batch: MipsRecord[] = [];
  const now = new Date();

  async function flushBatch(): Promise<void> {
    if (batch.length === 0) return;
    try {
      await db
        .insert(mipsScores)
        .values(batch)
        .onConflictDoUpdate({
          target: [mipsScores.providerNpi, mipsScores.programYear],
          set: {
            finalScore: drizzleSql`excluded.final_score`,
            qualityScore: drizzleSql`excluded.quality_score`,
            promotingInteroperabilityScore: drizzleSql`excluded.promoting_interoperability_score`,
            improvementActivitiesScore: drizzleSql`excluded.improvement_activities_score`,
            costScore: drizzleSql`excluded.cost_score`,
            updatedAt: drizzleSql`excluded.updated_at`,
          },
        });
      inserted += batch.length;
    } catch {
      // Fall back to individual upserts
      for (const record of batch) {
        try {
          await db
            .insert(mipsScores)
            .values(record)
            .onConflictDoUpdate({
              target: [mipsScores.providerNpi, mipsScores.programYear],
              set: {
                finalScore: drizzleSql`excluded.final_score`,
                qualityScore: drizzleSql`excluded.quality_score`,
                promotingInteroperabilityScore: drizzleSql`excluded.promoting_interoperability_score`,
                improvementActivitiesScore: drizzleSql`excluded.improvement_activities_score`,
                costScore: drizzleSql`excluded.cost_score`,
                updatedAt: drizzleSql`excluded.updated_at`,
              },
            });
          inserted++;
        } catch (err) {
          if (errored === 0) {
            console.error('First individual insert error:', err);
            console.error('Record:', JSON.stringify(record));
          }
          errored++;
        }
      }
    }
    batch = [];
  }

  for await (const line of rl) {
    if (headers.length === 0) {
      headers = parseCsvLine(line).map((h) => h.replace(/^"|"$/g, '').trim());
      // Accept multiple possible column name variants across CMS dataset years
      colNpi = findCol(headers, 'npi', 'Npi', 'NPI', 'provider_npi');
      colFinalScore = findCol(
        headers,
        'final_mips_score',
        'final_score',
        'mips_final_score',
        'Final_MIPS_Score',
      );
      colQualityScore = findCol(
        headers,
        'quality_category_score',
        'quality_score',
        'Quality_Category_Score',
      );
      colPiScore = findCol(
        headers,
        'pi_category_score',
        'promoting_interoperability_score',
        'PI_Category_Score',
        'aci_category_score',
      );
      colIaScore = findCol(
        headers,
        'ia_category_score',
        'improvement_activities_score',
        'IA_Category_Score',
      );
      colCostScore = findCol(headers, 'cost_category_score', 'cost_score', 'Cost_Category_Score');

      if (colNpi < 0) {
        console.error('ERROR: Could not find NPI column.');
        console.error(`Found columns: ${headers.slice(0, 20).join(', ')}...`);
        process.exit(1);
      }

      if (colFinalScore < 0) {
        console.warn(
          'WARNING: Could not find final score column. Score will be null for all records.'
        );
      }

      console.log('Header parsed successfully. Processing rows...\n');
      continue;
    }

    totalRead++;

    const fields = parseCsvLine(line);
    const npi = (fields[colNpi] ?? '').replace(/"/g, '').trim();

    if (!npi || !knownNpis.has(npi)) {
      skippedNpi++;
      continue;
    }

    const record: MipsRecord = {
      providerNpi: npi,
      finalScore: colFinalScore >= 0
        ? parseScoreOrNull((fields[colFinalScore] ?? '').replace(/"/g, ''))
        : null,
      qualityScore: colQualityScore >= 0
        ? parseScoreOrNull((fields[colQualityScore] ?? '').replace(/"/g, ''))
        : null,
      promotingInteroperabilityScore: colPiScore >= 0
        ? parseScoreOrNull((fields[colPiScore] ?? '').replace(/"/g, ''))
        : null,
      improvementActivitiesScore: colIaScore >= 0
        ? parseScoreOrNull((fields[colIaScore] ?? '').replace(/"/g, ''))
        : null,
      costScore: colCostScore >= 0
        ? parseScoreOrNull((fields[colCostScore] ?? '').replace(/"/g, ''))
        : null,
      programYear: PROGRAM_YEAR,
      updatedAt: now,
    };

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }

    if (totalRead % LOG_EVERY === 0) {
      console.log(
        `  Progress: ${totalRead.toLocaleString()} rows read | ` +
        `${inserted.toLocaleString()} upserted | ` +
        `${skippedNpi.toLocaleString()} NPI not found | ` +
        `${errored} errors`
      );
    }
  }

  // Flush remaining batch
  await flushBatch();

  console.log('\n--- MIPS Scores Seed Complete ---');
  console.log(`  Total rows read:       ${totalRead.toLocaleString()}`);
  console.log(`  Upserted:              ${inserted.toLocaleString()}`);
  console.log(`  Skipped (NPI missing): ${skippedNpi.toLocaleString()}`);
  console.log(`  Errored:               ${errored}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
