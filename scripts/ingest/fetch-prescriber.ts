/**
 * fetch-prescriber.ts
 *
 * Seeds prescriber_data from a Medicare Part D Prescribers by Provider and Drug
 * bulk CSV download.
 *
 * Usage:
 *   pnpm tsx scripts/ingest/fetch-prescriber.ts path/to/prescribers.csv
 *
 * Download the CSV from:
 *   https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers/medicare-part-d-prescribers-by-provider-and-drug
 *
 * Expected CSV columns (case-sensitive):
 *   Prscrbr_NPI, Prscrbr_State_Abrvtn, Brnd_Name, Gnrc_Name,
 *   Tot_Clms, Tot_Drug_Cst, Tot_Benes
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { prescriberData, providers } from '../../src/db/schema';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BATCH_SIZE = 100;
const LOG_EVERY = 10_000;
const PROGRAM_YEAR = process.env.PRESCRIBER_YEAR
  ? parseInt(process.env.PRESCRIBER_YEAR, 10)
  : 2022;

interface PrescriberRecord {
  providerNpi: string;
  brandName: string | null;
  genericName: string;
  totalClaims: number;
  totalDrugCost: number;
  totalBeneficiaries: number | null;
  programYear: number;
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

function dollarsToCents(value: string): number | null {
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}

function parseFloatStringOrNull(value: string): string | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num.toFixed(2);
}

function parseIntOrNull(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
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
    console.error('Usage: pnpm tsx scripts/ingest/fetch-prescriber.ts path/to/prescribers.csv');
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
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  const input = fs.createReadStream(resolvedPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let headers: string[] = [];
  let colNpi = -1;
  let colState = -1;
  let colBrandName = -1;
  let colGenericName = -1;
  let colTotClms = -1;
  let colTotDrugCst = -1;
  let colTotBenes = -1;

  let totalRead = 0;
  let skippedState = 0;
  let skippedNpi = 0;
  let inserted = 0;
  let errored = 0;

  let batch: PrescriberRecord[] = [];

  async function flushBatch(): Promise<void> {
    if (batch.length === 0) return;
    try {
      await db.insert(prescriberData).values(batch);
      inserted += batch.length;
    } catch {
      // Fall back to individual inserts
      for (const record of batch) {
        try {
          await db.insert(prescriberData).values(record);
          inserted++;
        } catch {
          errored++;
        }
      }
    }
    batch = [];
  }

  for await (const line of rl) {
    if (headers.length === 0) {
      headers = parseCsvLine(line).map((h) => h.replace(/^"|"$/g, ''));
      colNpi = headers.indexOf('Prscrbr_NPI');
      colState = headers.indexOf('Prscrbr_State_Abrvtn');
      colBrandName = headers.indexOf('Brnd_Name');
      colGenericName = headers.indexOf('Gnrc_Name');
      colTotClms = headers.indexOf('Tot_Clms');
      colTotDrugCst = headers.indexOf('Tot_Drug_Cst');
      colTotBenes = headers.indexOf('Tot_Benes');

      const missing = [
        colNpi < 0 && 'Prscrbr_NPI',
        colState < 0 && 'Prscrbr_State_Abrvtn',
        colGenericName < 0 && 'Gnrc_Name',
      ].filter(Boolean);

      if (missing.length > 0) {
        console.error(`ERROR: Missing required columns: ${missing.join(', ')}`);
        console.error(`Found columns: ${headers.slice(0, 15).join(', ')}...`);
        process.exit(1);
      }

      console.log('Header parsed successfully. Processing rows...\n');
      continue;
    }

    totalRead++;

    const fields = parseCsvLine(line);
    const state = colState >= 0 ? (fields[colState] ?? '').replace(/"/g, '').trim() : '';

    if (state !== 'TX') {
      skippedState++;
      continue;
    }

    const npi = (fields[colNpi] ?? '').replace(/"/g, '').trim();

    if (!knownNpis.has(npi)) {
      skippedNpi++;
      continue;
    }

    const genericName = colGenericName >= 0
      ? (fields[colGenericName] ?? '').replace(/"/g, '').trim()
      : '';

    if (!genericName) continue;

    const record: PrescriberRecord = {
      providerNpi: npi,
      brandName: colBrandName >= 0
        ? ((fields[colBrandName] ?? '').replace(/"/g, '').trim() || null)
        : null,
      genericName,
      totalClaims: colTotClms >= 0
        ? (parseIntOrNull((fields[colTotClms] ?? '').replace(/"/g, '').trim()) ?? 0)
        : 0,
      totalDrugCost: colTotDrugCst >= 0
        ? (dollarsToCents((fields[colTotDrugCst] ?? '').replace(/"/g, '').trim()) ?? 0)
        : 0,
      totalBeneficiaries: colTotBenes >= 0
        ? parseIntOrNull((fields[colTotBenes] ?? '').replace(/"/g, '').trim())
        : null,
      programYear: PROGRAM_YEAR,
    };

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }

    if (totalRead % LOG_EVERY === 0) {
      console.log(
        `  Progress: ${totalRead.toLocaleString()} rows read | ` +
        `${inserted.toLocaleString()} inserted | ` +
        `${skippedState.toLocaleString()} non-TX skipped | ` +
        `${skippedNpi.toLocaleString()} NPI not found | ` +
        `${errored} errors`
      );
    }
  }

  // Flush remaining batch
  await flushBatch();

  console.log('\n--- Prescriber Data Seed Complete ---');
  console.log(`  Total rows read:       ${totalRead.toLocaleString()}`);
  console.log(`  Inserted:              ${inserted.toLocaleString()}`);
  console.log(`  Skipped (non-TX):      ${skippedState.toLocaleString()}`);
  console.log(`  Skipped (NPI missing): ${skippedNpi.toLocaleString()}`);
  console.log(`  Errored:               ${errored}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
