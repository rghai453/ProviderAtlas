import { db } from '@/db';
import { mipsScores, providers } from '@/db/schema';
import { eq, desc, asc, sql, avg, count, isNotNull } from 'drizzle-orm';

export interface MipsOverview {
  finalScore: number | null;
  qualityScore: number | null;
  piScore: number | null;
  iaScore: number | null;
  costScore: number | null;
  programYear: number;
}

export async function getMipsOverview(npi: string): Promise<MipsOverview | null> {
  const rows = await db
    .select()
    .from(mipsScores)
    .where(eq(mipsScores.providerNpi, npi))
    .orderBy(desc(mipsScores.programYear))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    finalScore: row.finalScore ? Number(row.finalScore) : null,
    qualityScore: row.qualityScore ? Number(row.qualityScore) : null,
    piScore: row.promotingInteroperabilityScore ? Number(row.promotingInteroperabilityScore) : null,
    iaScore: row.improvementActivitiesScore ? Number(row.improvementActivitiesScore) : null,
    costScore: row.costScore ? Number(row.costScore) : null,
    programYear: row.programYear,
  };
}

// --- Rankings functions ---

export interface RankedMipsProvider {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  specialtyDescription: string | null;
  slug: string;
  finalScore: number;
  programYear: number;
}

async function getMipsProvidersByOrder(
  limit: number,
  direction: 'asc' | 'desc',
): Promise<RankedMipsProvider[]> {
  const latestYear = await db
    .select({ year: sql<number>`max(${mipsScores.programYear})` })
    .from(mipsScores);

  const year = latestYear[0]?.year;
  if (!year) return [];

  const orderFn = direction === 'desc' ? desc : asc;

  const rows = await db
    .select({
      npi: providers.npi,
      firstName: providers.firstName,
      lastName: providers.lastName,
      organizationName: providers.organizationName,
      specialtyDescription: providers.specialtyDescription,
      slug: providers.slug,
      finalScore: mipsScores.finalScore,
      programYear: mipsScores.programYear,
    })
    .from(mipsScores)
    .innerJoin(providers, eq(mipsScores.providerNpi, providers.npi))
    .where(eq(mipsScores.programYear, year))
    .orderBy(orderFn(mipsScores.finalScore))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    finalScore: r.finalScore ? Number(r.finalScore) : 0,
  }));
}

export async function getTopMipsProviders(
  limit: number,
): Promise<RankedMipsProvider[]> {
  return getMipsProvidersByOrder(limit, 'desc');
}

export async function getBottomMipsProviders(
  limit: number,
): Promise<RankedMipsProvider[]> {
  return getMipsProvidersByOrder(limit, 'asc');
}

export interface MipsAggregateStats {
  avgScore: number;
  providerCount: number;
  programYear: number;
}

export async function getMipsAggregateStats(): Promise<MipsAggregateStats> {
  const latestYear = await db
    .select({ year: sql<number>`max(${mipsScores.programYear})` })
    .from(mipsScores);

  const year = latestYear[0]?.year;
  if (!year) return { avgScore: 0, providerCount: 0, programYear: 0 };

  const [row] = await db
    .select({
      avgScore: avg(mipsScores.finalScore).mapWith(Number),
      providerCount: count(),
    })
    .from(mipsScores)
    .where(eq(mipsScores.programYear, year));

  return {
    avgScore: Math.round(row.avgScore ?? 0),
    providerCount: Number(row.providerCount),
    programYear: year,
  };
}
