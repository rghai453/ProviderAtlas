import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function markMedicareProviders(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const neonSql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: neonSql });

  console.log('Marking providers who accept Medicare...');

  await db.execute(sql`
    UPDATE providers
    SET accepts_medicare = true
    WHERE npi IN (
      SELECT DISTINCT provider_npi FROM medicare_utilization
    )
  `);

  const result = await db.execute(sql`
    SELECT count(*) as count FROM providers WHERE accepts_medicare = true
  `);

  const count = (result as unknown as Array<{ count: string }>)[0]?.count ?? '0';
  console.log(`Done. ${count} providers marked as accepting Medicare.`);
}

markMedicareProviders();
