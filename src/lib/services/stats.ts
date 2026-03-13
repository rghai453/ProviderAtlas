import { db } from '@/db';
import { stats, providers } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export interface HomepageStats {
  totalProviders: number;
  totalSpecialties: number;
  totalCities: number;
}

export async function getHomepageStats(): Promise<HomepageStats> {
  const [totalProvidersRow, totalSpecialtiesRow, totalCitiesRow] =
    await Promise.all([
      db.query.stats.findFirst({ where: eq(stats.key, 'totalProviders') }),
      db.query.stats.findFirst({ where: eq(stats.key, 'totalSpecialties') }),
      db.query.stats.findFirst({ where: eq(stats.key, 'totalCities') }),
    ]);

  return {
    totalProviders: Number(totalProvidersRow?.value ?? 0),
    totalSpecialties: Number(totalSpecialtiesRow?.value ?? 0),
    totalCities: Number(totalCitiesRow?.value ?? 0),
  };
}

export async function getCityStats(city: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(providers)
    .where(eq(providers.city, city));
  return Number(total);
}

export async function getZipStats(zip: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(providers)
    .where(eq(providers.zip, zip));
  return Number(total);
}

export async function getStatByKey(
  key: string,
): Promise<typeof stats.$inferSelect | undefined> {
  return db.query.stats.findFirst({
    where: eq(stats.key, key),
  });
}
