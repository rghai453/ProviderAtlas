import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { providers, specialties, stats } from '../../src/db/schema';
import { countDistinct, count } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateStats(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const neonSql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: neonSql });

  console.log('Generating stats...');

  // Total providers
  const [providerCount] = await db.select({ count: count() }).from(providers);

  // Total specialties
  const [specialtyCount] = await db.select({ count: count() }).from(specialties);

  // Total unique cities
  const [cityCount] = await db.select({ count: countDistinct(providers.city) }).from(providers);

  // Upsert stats
  const statsToUpsert = [
    { key: 'totalProviders', value: providerCount.count },
    { key: 'totalSpecialties', value: specialtyCount.count },
    { key: 'totalCities', value: cityCount.count },
  ];

  for (const stat of statsToUpsert) {
    await db.insert(stats).values({
      key: stat.key,
      value: stat.value,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: stats.key,
      set: { value: stat.value, updatedAt: new Date() },
    });
  }

  console.log(`Stats generated:`);
  console.log(`  Total providers: ${providerCount.count}`);
  console.log(`  Total specialties: ${specialtyCount.count}`);
  console.log(`  Total cities: ${cityCount.count}`);
}

generateStats();
