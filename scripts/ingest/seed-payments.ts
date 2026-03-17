/**
 * seed-payments.ts
 *
 * Dedicated payment seeder. Reads scripts/normalized/payments.json,
 * pre-filters by existing provider NPIs to avoid FK failures, and
 * batch-inserts into the payments table with individual-insert fallback.
 *
 * Usage:
 *   pnpm tsx scripts/ingest/seed-payments.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { payments, providers } from '../../src/db/schema';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PAYMENTS_JSON = path.join(process.cwd(), 'scripts/normalized/payments.json');
const BATCH_SIZE = 100;
const LOG_EVERY = 10_000;

interface PaymentRecord {
  providerNpi: string;
  payerName: string;
  payerType: 'pharma' | 'device' | null;
  amount: number;
  dateOfPayment: Date | null;
  natureOfPayment: string | null;
  formOfPayment: string | null;
  contextualInfo: string | null;
  programYear: number | null;
}

function parsePaymentRecord(raw: Record<string, unknown>): PaymentRecord | null {
  const npi = (raw.providerNpi as string | undefined)?.trim();
  const payerName = (raw.payerName as string | undefined)?.trim();

  if (!npi || !payerName) return null;

  const rawAmount = raw.amount;
  const amount =
    typeof rawAmount === 'number'
      ? rawAmount
      : typeof rawAmount === 'string'
      ? parseInt(rawAmount, 10)
      : null;

  if (amount === null || isNaN(amount as number)) return null;

  const rawPayerType = raw.payerType as string | null | undefined;
  const payerType: 'pharma' | 'device' | null =
    rawPayerType === 'pharma' || rawPayerType === 'device' ? rawPayerType : null;

  const rawDate = raw.dateOfPayment;
  let dateOfPayment: Date | null = null;
  if (rawDate && typeof rawDate === 'string' && rawDate.trim()) {
    const parsed = new Date(rawDate);
    dateOfPayment = isNaN(parsed.getTime()) ? null : parsed;
  }

  const rawYear = raw.programYear;
  const programYear =
    typeof rawYear === 'number'
      ? rawYear
      : typeof rawYear === 'string' && rawYear.trim()
      ? parseInt(rawYear, 10)
      : null;

  return {
    providerNpi: npi,
    payerName,
    payerType,
    amount: amount as number,
    dateOfPayment,
    natureOfPayment: (raw.natureOfPayment as string | null | undefined)?.trim() || null,
    formOfPayment: (raw.formOfPayment as string | null | undefined)?.trim() || null,
    contextualInfo: (raw.contextualInfo as string | null | undefined)?.trim() || null,
    programYear: programYear !== null && !isNaN(programYear as number) ? (programYear as number) : null,
  };
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

  if (!fs.existsSync(PAYMENTS_JSON)) {
    console.error(`ERROR: payments.json not found at ${PAYMENTS_JSON}`);
    console.error('Run the fetch-payments script first to generate this file.');
    process.exit(1);
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sqlClient });

  const knownNpis = await loadProviderNpis(db);

  console.log(`Reading: ${PAYMENTS_JSON}`);
  const raw = fs.readFileSync(PAYMENTS_JSON, 'utf-8');

  let rawData: unknown;
  try {
    rawData = JSON.parse(raw);
  } catch (err) {
    console.error('ERROR: Failed to parse payments.json:', err);
    process.exit(1);
  }

  if (!Array.isArray(rawData)) {
    console.error('ERROR: payments.json must be a JSON array at the top level.');
    process.exit(1);
  }

  console.log(`  Found ${(rawData as unknown[]).length.toLocaleString()} total payment records.\n`);

  let skippedNpi = 0;
  let skippedInvalid = 0;
  let inserted = 0;
  let errored = 0;
  let processed = 0;

  let batch: PaymentRecord[] = [];

  async function flushBatch(): Promise<void> {
    if (batch.length === 0) return;

    try {
      await db.insert(payments).values(batch);
      inserted += batch.length;
    } catch {
      // On batch failure, fall back to individual inserts and skip failures silently
      for (const record of batch) {
        try {
          await db.insert(payments).values(record);
          inserted++;
        } catch {
          errored++;
        }
      }
    }

    batch = [];
  }

  for (const rawItem of rawData as Record<string, unknown>[]) {
    processed++;

    const record = parsePaymentRecord(rawItem);

    if (!record) {
      skippedInvalid++;
      continue;
    }

    if (!knownNpis.has(record.providerNpi)) {
      skippedNpi++;
      continue;
    }

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
    }

    if (processed % LOG_EVERY === 0) {
      console.log(
        `  Progress: ${processed.toLocaleString()} processed | ` +
        `${inserted.toLocaleString()} inserted | ` +
        `${skippedNpi.toLocaleString()} NPI not found | ` +
        `${skippedInvalid.toLocaleString()} invalid | ` +
        `${errored} errors`
      );
    }
  }

  // Flush remaining batch
  await flushBatch();

  console.log('\n--- Payment Seed Complete ---');
  console.log(`  Total records processed: ${processed.toLocaleString()}`);
  console.log(`  Inserted:                ${inserted.toLocaleString()}`);
  console.log(`  Skipped (NPI missing):   ${skippedNpi.toLocaleString()}`);
  console.log(`  Skipped (invalid data):  ${skippedInvalid.toLocaleString()}`);
  console.log(`  Errored (insert failed): ${errored}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
