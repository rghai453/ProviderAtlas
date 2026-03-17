/**
 * fetch-medicare-util.ts
 *
 * Seeds medicare_utilization from a Medicare Physician & Other Practitioners
 * by Provider and Service bulk CSV download.
 *
 * Usage:
 *   pnpm tsx scripts/ingest/fetch-medicare-util.ts path/to/medicare.csv
 *
 * Download the CSV from:
 *   https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicare-physician-other-practitioners-by-provider-and-service
 *
 * Expected CSV columns (case-sensitive):
 *   Rndrng_NPI, Rndrng_Prvdr_State_Abrvtn, HCPCS_Cd, HCPCS_Desc,
 *   Place_Of_Srvc, Tot_Benes, Tot_Srvcs, Tot_Mdcr_Pymt_Amt, Avg_Mdcr_Pymt_Amt
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { medicareUtilization, providers } from '../../src/db/schema';
import { sql as drizzleSql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BATCH_SIZE = 100;
const LOG_EVERY = 10_000;
// Default to the most recent available program year; can be overridden via env
const PROGRAM_YEAR = process.env.MEDICARE_UTIL_YEAR
  ? parseInt(process.env.MEDICARE_UTIL_YEAR, 10)
  : 2022;

interface MedicareUtilRecord {
  providerNpi: string;
  hcpcsCode: string;
  hcpcsDescription: string | null;
  placeOfService: string | null;
  totalBeneficiaries: number | null;
  totalServices: number | null;
  totalMedicarePayment: number | null; // cents
  avgMedicarePayment: number | null; // cents
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
        // Escaped quote
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

function parseIntOrNull(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function parseFloatStringOrNull(value: string): string | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num.toFixed(2);
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
    console.error('Usage: pnpm tsx scripts/ingest/fetch-medicare-util.ts path/to/medicare.csv');
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
  let colHcpcsCode = -1;
  let colHcpcsDesc = -1;
  let colPlaceOfService = -1;
  let colTotBenes = -1;
  let colTotSrvcs = -1;
  let colTotMdcrPymt = -1;
  let colAvgMdcrPymt = -1;

  let totalRead = 0;
  let skippedState = 0;
  let skippedNpi = 0;
  let inserted = 0;
  let errored = 0;

  let batch: MedicareUtilRecord[] = [];

  async function flushBatch(): Promise<void> {
    if (batch.length === 0) return;
    try {
      await db.insert(medicareUtilization).values(batch);
      inserted += batch.length;
    } catch {
      // Fall back to individual inserts
      for (const record of batch) {
        try {
          await db.insert(medicareUtilization).values(record);
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
      colNpi = headers.indexOf('Rndrng_NPI');
      colState = headers.indexOf('Rndrng_Prvdr_State_Abrvtn');
      colHcpcsCode = headers.indexOf('HCPCS_Cd');
      colHcpcsDesc = headers.indexOf('HCPCS_Desc');
      colPlaceOfService = headers.indexOf('Place_Of_Srvc');
      colTotBenes = headers.indexOf('Tot_Benes');
      colTotSrvcs = headers.indexOf('Tot_Srvcs');
      colTotMdcrPymt = headers.indexOf('Tot_Mdcr_Pymt_Amt');
      colAvgMdcrPymt = headers.indexOf('Avg_Mdcr_Pymt_Amt');

      const missing = [
        colNpi < 0 && 'Rndrng_NPI',
        colState < 0 && 'Rndrng_Prvdr_State_Abrvtn',
        colHcpcsCode < 0 && 'HCPCS_Cd',
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

    const hcpcsCode = colHcpcsCode >= 0 ? (fields[colHcpcsCode] ?? '').replace(/"/g, '').trim() : '';
    if (!hcpcsCode) continue;

    const record: MedicareUtilRecord = {
      providerNpi: npi,
      hcpcsCode,
      hcpcsDescription: colHcpcsDesc >= 0
        ? ((fields[colHcpcsDesc] ?? '').replace(/"/g, '').trim() || null)
        : null,
      placeOfService: colPlaceOfService >= 0
        ? ((fields[colPlaceOfService] ?? '').replace(/"/g, '').trim() || null)
        : null,
      totalBeneficiaries: colTotBenes >= 0
        ? parseIntOrNull((fields[colTotBenes] ?? '').replace(/"/g, '').trim())
        : null,
      totalServices: colTotSrvcs >= 0
        ? parseIntOrNull((fields[colTotSrvcs] ?? '').replace(/"/g, '').trim())
        : null,
      totalMedicarePayment: (() => {
        // Compute total = services * avg payment
        const srvcs = colTotSrvcs >= 0 ? parseFloat((fields[colTotSrvcs] ?? '0').replace(/[",]/g, '')) : 0;
        const avg = colAvgMdcrPymt >= 0 ? parseFloat((fields[colAvgMdcrPymt] ?? '0').replace(/[",]/g, '')) : 0;
        const total = srvcs * avg;
        return isNaN(total) ? null : Math.round(total * 100);
      })(),
      avgMedicarePayment: colAvgMdcrPymt >= 0
        ? dollarsToCents((fields[colAvgMdcrPymt] ?? '').replace(/"/g, '').trim())
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

  console.log('\n--- Medicare Utilization Seed Complete ---');
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
