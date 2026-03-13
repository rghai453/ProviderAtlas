import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { providers, payments, specialties, stats } from '../../src/db/schema';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NORMALIZED_DIR = path.join(process.cwd(), 'scripts/normalized');
const BATCH_SIZE = 50;

async function seed(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });

  console.log('Starting database seed...\n');

  // 1. Seed specialties
  const specialtiesPath = path.join(NORMALIZED_DIR, 'specialties.json');
  if (fs.existsSync(specialtiesPath)) {
    const specialtiesData = JSON.parse(fs.readFileSync(specialtiesPath, 'utf-8'));
    console.log(`Seeding ${specialtiesData.length} specialties...`);

    for (let i = 0; i < specialtiesData.length; i += BATCH_SIZE) {
      const batch = specialtiesData.slice(i, i + BATCH_SIZE).map((s: { code: string; description: string; count: number }) => ({
        code: s.code,
        description: s.description,
        providerCount: s.count,
      }));

      await db.insert(specialties).values(batch).onConflictDoUpdate({
        target: specialties.code,
        set: {
          description: specialties.description,
          providerCount: specialties.providerCount,
        },
      });
    }
    console.log('  ✓ Specialties seeded');
  }

  // 2. Seed providers
  const providersPath = path.join(NORMALIZED_DIR, 'providers.json');
  if (fs.existsSync(providersPath)) {
    const providersData = JSON.parse(fs.readFileSync(providersPath, 'utf-8'));
    console.log(`Seeding ${providersData.length} providers...`);

    let seeded = 0;
    let errors = 0;

    for (let i = 0; i < providersData.length; i += BATCH_SIZE) {
      const batch = providersData.slice(i, i + BATCH_SIZE).map((p: Record<string, unknown>) => ({
        npi: p.npi as string,
        firstName: p.firstName as string | null,
        lastName: p.lastName as string | null,
        credential: p.credential as string | null,
        gender: p.gender as string | null,
        entityType: p.entityType as 'individual' | 'organization',
        organizationName: p.organizationName as string | null,
        taxonomyCode: p.taxonomyCode as string | null,
        specialtyDescription: p.specialtyDescription as string | null,
        slug: p.slug as string,
        phone: p.phone as string | null,
        fax: p.fax as string | null,
        addressLine1: p.addressLine1 as string | null,
        addressLine2: p.addressLine2 as string | null,
        city: p.city as string | null,
        state: p.state as string | null,
        zip: p.zip as string | null,
        county: p.county as string | null,
        enumerationDate: p.enumerationDate ? new Date(p.enumerationDate as string) : null,
        lastUpdated: p.lastUpdated ? new Date(p.lastUpdated as string) : null,
      }));

      try {
        await db.insert(providers).values(batch).onConflictDoUpdate({
          target: providers.npi,
          set: {
            firstName: providers.firstName,
            lastName: providers.lastName,
            credential: providers.credential,
            specialtyDescription: providers.specialtyDescription,
            slug: providers.slug,
            phone: providers.phone,
            city: providers.city,
            zip: providers.zip,
            lastUpdated: providers.lastUpdated,
            updatedAt: new Date(),
          },
        });
        seeded += batch.length;
      } catch (err) {
        // On batch failure, try inserting one by one
        for (const record of batch) {
          try {
            await db.insert(providers).values(record).onConflictDoUpdate({
              target: providers.npi,
              set: {
                firstName: providers.firstName,
                lastName: providers.lastName,
                credential: providers.credential,
                specialtyDescription: providers.specialtyDescription,
                slug: providers.slug,
                phone: providers.phone,
                city: providers.city,
                zip: providers.zip,
                lastUpdated: providers.lastUpdated,
                updatedAt: new Date(),
              },
            });
            seeded++;
          } catch {
            errors++;
          }
        }
      }

      if (seeded % 5000 === 0) {
        console.log(`  → ${seeded} providers seeded...`);
      }
    }
    console.log(`  ✓ Providers: ${seeded} seeded, ${errors} errors`);
  }

  // 3. Seed payments
  const paymentsPath = path.join(NORMALIZED_DIR, 'payments.json');
  if (fs.existsSync(paymentsPath)) {
    const paymentsData = JSON.parse(fs.readFileSync(paymentsPath, 'utf-8'));
    console.log(`Seeding ${paymentsData.length} payments...`);

    let seeded = 0;
    for (let i = 0; i < paymentsData.length; i += BATCH_SIZE) {
      const batch = paymentsData.slice(i, i + BATCH_SIZE).map((p: Record<string, unknown>) => ({
        providerNpi: p.providerNpi as string,
        payerName: p.payerName as string,
        payerType: p.payerType as 'pharma' | 'device' | null,
        amount: p.amount as number,
        dateOfPayment: p.dateOfPayment ? new Date(p.dateOfPayment as string) : null,
        natureOfPayment: p.natureOfPayment as string | null,
        formOfPayment: p.formOfPayment as string | null,
        contextualInfo: p.contextualInfo as string | null,
        programYear: p.programYear as number | null,
      }));

      try {
        await db.insert(payments).values(batch);
        seeded += batch.length;
      } catch (err) {
        console.error(`  Error seeding payment batch at offset ${i}:`, err);
      }
    }
    console.log(`  ✓ Payments: ${seeded} seeded`);
  }

  console.log('\nSeed complete!');
}

seed();
