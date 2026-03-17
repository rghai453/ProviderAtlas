import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { specialties, providers } from '../../src/db/schema';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NORMALIZED_DIR = path.join(process.cwd(), 'scripts/normalized');

async function backfill(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  // Read the already-normalized specialties JSON as the source of truth
  const specialtiesPath = path.join(NORMALIZED_DIR, 'specialties.json');
  if (!fs.existsSync(specialtiesPath)) {
    console.error('No normalized specialties.json found. Run normalize.ts first.');
    process.exit(1);
  }

  const normalizedSpecialties: { code: string; description: string; count: number }[] =
    JSON.parse(fs.readFileSync(specialtiesPath, 'utf-8'));
  console.log(`Read ${normalizedSpecialties.length} specialties from normalized JSON`);

  // Build a map of code → normalized description
  const codeToDesc = new Map<string, string>();
  for (const s of normalizedSpecialties) {
    codeToDesc.set(s.code, s.description);
  }

  const client = neon(process.env.DATABASE_URL);
  const db = drizzle({ client });

  // Read current DB specialties
  const dbSpecialties = await db.select().from(specialties);
  console.log(`${dbSpecialties.length} specialties in DB`);

  // Find which ones need updating
  const updates: { code: string; newDesc: string }[] = [];
  for (const s of dbSpecialties) {
    const normalized = codeToDesc.get(s.code);
    if (normalized && normalized !== s.description) {
      updates.push({ code: s.code, newDesc: normalized });
    }
  }

  console.log(`${updates.length} specialties need description updates`);

  for (const u of updates.slice(0, 10)) {
    const old = dbSpecialties.find(s => s.code === u.code)!.description;
    console.log(`  "${old}" → "${u.newDesc}"`);
  }
  if (updates.length > 10) console.log(`  ... and ${updates.length - 10} more`);

  // Update specialties descriptions
  if (updates.length > 0) {
    console.log('\nUpdating specialties.description...');
    for (const u of updates) {
      await db.update(specialties)
        .set({ description: u.newDesc })
        .where(eq(specialties.code, u.code));
    }
    console.log('  Done.');

    // Update providers.specialtyDescription to match
    console.log('Updating providers.specialty_description...');
    let processed = 0;
    for (const u of updates) {
      await db.update(providers)
        .set({ specialtyDescription: u.newDesc })
        .where(eq(providers.taxonomyCode, u.code));
      processed++;
      if (processed % 100 === 0) {
        console.log(`  → ${processed}/${updates.length} taxonomy codes processed...`);
      }
    }
    console.log(`  Done. ${updates.length} taxonomy codes updated.`);
  }

  // Recompute provider counts per taxonomy code
  console.log('Recomputing specialty provider counts...');
  const countRows = await db
    .select({
      code: providers.taxonomyCode,
      cnt: sql<number>`count(*)::int`,
    })
    .from(providers)
    .where(sql`${providers.taxonomyCode} is not null`)
    .groupBy(providers.taxonomyCode);

  let countUpdated = 0;
  for (const row of countRows) {
    if (!row.code) continue;
    await db.update(specialties)
      .set({ providerCount: row.cnt })
      .where(eq(specialties.code, row.code));
    countUpdated++;
    if (countUpdated % 200 === 0) {
      console.log(`  → ${countUpdated}/${countRows.length} counts updated...`);
    }
  }
  console.log(`  Done. ${countUpdated} specialty counts refreshed.`);

  console.log('\nBackfill complete!');
}

backfill();
