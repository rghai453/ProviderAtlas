import { db } from '@/db';
import { stats, providers, payments, medicareUtilization, prescriberData } from '@/db/schema';
import { eq, ilike, count, sql, inArray, desc } from 'drizzle-orm';

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

export async function getCityCounts(
  cities: string[],
): Promise<Map<string, number>> {
  const rows = await db
    .select({
      city: sql<string>`lower(${providers.city})`,
      total: count(),
    })
    .from(providers)
    .where(inArray(sql`lower(${providers.city})`, cities.map((c) => c.toLowerCase())))
    .groupBy(sql`lower(${providers.city})`);

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.city, Number(row.total));
  }
  return map;
}

export async function getCityStats(city: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(providers)
    .where(ilike(providers.city, city));
  return Number(total);
}

export async function getZipStats(zip: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(providers)
    .where(eq(providers.zip, zip));
  return Number(total);
}

export interface CityListItem {
  city: string;
  providerCount: number;
}

export async function getTopCities(limit: number): Promise<CityListItem[]> {
  const rows = await db
    .select({
      city: providers.city,
      providerCount: count(),
    })
    .from(providers)
    .where(sql`${providers.city} is not null`)
    .groupBy(providers.city)
    .orderBy(desc(count()))
    .limit(limit);

  return rows.map((r) => ({
    city: r.city!,
    providerCount: Number(r.providerCount),
  }));
}

export async function getAllCityNames(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ city: providers.city })
    .from(providers)
    .where(sql`${providers.city} is not null`);
  return rows.map((r) => r.city!);
}

export interface DataSourceCounts {
  paymentsCount: number;
  medicareCount: number;
  prescriberCount: number;
}

export async function getDataSourceCounts(): Promise<DataSourceCounts> {
  const [paymentsRow, medicareRow, prescriberRow] = await Promise.all([
    db.select({ total: count() }).from(payments),
    db.select({ total: count() }).from(medicareUtilization),
    db.select({ total: count() }).from(prescriberData),
  ]);

  return {
    paymentsCount: Number(paymentsRow[0].total),
    medicareCount: Number(medicareRow[0].total),
    prescriberCount: Number(prescriberRow[0].total),
  };
}

export async function getStatByKey(
  key: string,
): Promise<typeof stats.$inferSelect | undefined> {
  return db.query.stats.findFirst({
    where: eq(stats.key, key),
  });
}
