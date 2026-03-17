import { db } from '@/db';
import { medicareUtilization, prescriberData, providers } from '@/db/schema';
import { eq, desc, sql, sum, count, countDistinct } from 'drizzle-orm';

export interface MedicareOverview {
  totalBeneficiaries: number;
  totalServices: number;
  totalMedicarePayment: number; // cents
  topProcedures: {
    hcpcsCode: string;
    hcpcsDescription: string | null;
    totalServices: number;
    totalPayment: number; // cents
  }[];
}

export async function getMedicareOverview(npi: string): Promise<MedicareOverview | null> {
  const rows = await db
    .select()
    .from(medicareUtilization)
    .where(eq(medicareUtilization.providerNpi, npi))
    .orderBy(desc(medicareUtilization.totalServices));

  if (rows.length === 0) return null;

  let totalBeneficiaries = 0;
  let totalServices = 0;
  let totalMedicarePayment = 0;

  for (const row of rows) {
    totalBeneficiaries += Number(row.totalBeneficiaries ?? 0);
    totalServices += Number(row.totalServices ?? 0);
    totalMedicarePayment += Number(row.totalMedicarePayment ?? 0);
  }

  const topProcedures = rows.slice(0, 8).map((r) => ({
    hcpcsCode: r.hcpcsCode ?? '',
    hcpcsDescription: r.hcpcsDescription,
    totalServices: Number(r.totalServices ?? 0),
    totalPayment: Number(r.totalMedicarePayment ?? 0),
  }));

  return {
    totalBeneficiaries,
    totalServices,
    totalMedicarePayment,
    topProcedures,
  };
}

export interface PrescriberOverview {
  totalClaims: number;
  totalDrugCost: number; // cents
  totalBeneficiaries: number;
  topDrugs: {
    brandName: string | null;
    genericName: string;
    totalClaims: number;
    totalDrugCost: number; // cents
  }[];
}

export async function getPrescriberOverview(npi: string): Promise<PrescriberOverview | null> {
  const rows = await db
    .select()
    .from(prescriberData)
    .where(eq(prescriberData.providerNpi, npi))
    .orderBy(desc(prescriberData.totalClaims));

  if (rows.length === 0) return null;

  let totalClaims = 0;
  let totalDrugCost = 0;
  let totalBeneficiaries = 0;

  for (const row of rows) {
    totalClaims += Number(row.totalClaims ?? 0);
    totalDrugCost += Number(row.totalDrugCost ?? 0);
    totalBeneficiaries += Number(row.totalBeneficiaries ?? 0);
  }

  const topDrugs = rows.slice(0, 10).map((r) => ({
    brandName: r.brandName,
    genericName: r.genericName,
    totalClaims: Number(r.totalClaims ?? 0),
    totalDrugCost: Number(r.totalDrugCost ?? 0),
  }));

  return {
    totalClaims,
    totalDrugCost,
    totalBeneficiaries,
    topDrugs,
  };
}

// --- Rankings functions ---

export interface TopMedicareProvider {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  specialtyDescription: string | null;
  slug: string;
  totalBeneficiaries: number;
  totalServices: number;
  totalMedicarePayment: number;
}

export async function getTopMedicareProviders(
  limit: number,
): Promise<TopMedicareProvider[]> {
  const rows = await db
    .select({
      npi: providers.npi,
      firstName: providers.firstName,
      lastName: providers.lastName,
      organizationName: providers.organizationName,
      specialtyDescription: providers.specialtyDescription,
      slug: providers.slug,
      totalBeneficiaries: sum(medicareUtilization.totalBeneficiaries).mapWith(Number),
      totalServices: sum(sql<number>`cast(${medicareUtilization.totalServices} as integer)`).mapWith(Number),
      totalMedicarePayment: sum(medicareUtilization.totalMedicarePayment).mapWith(Number),
    })
    .from(medicareUtilization)
    .innerJoin(providers, eq(medicareUtilization.providerNpi, providers.npi))
    .groupBy(
      providers.npi,
      providers.firstName,
      providers.lastName,
      providers.organizationName,
      providers.specialtyDescription,
      providers.slug,
    )
    .orderBy(desc(sum(medicareUtilization.totalMedicarePayment)))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    totalBeneficiaries: r.totalBeneficiaries ?? 0,
    totalServices: r.totalServices ?? 0,
    totalMedicarePayment: r.totalMedicarePayment ?? 0,
  }));
}

export interface MedicareAggregateStats {
  totalMedicarePayments: number;
  totalBeneficiaries: number;
  totalServices: number;
}

export async function getMedicareAggregateStats(): Promise<MedicareAggregateStats> {
  const [row] = await db
    .select({
      totalMedicarePayments: sum(medicareUtilization.totalMedicarePayment).mapWith(Number),
      totalBeneficiaries: sum(medicareUtilization.totalBeneficiaries).mapWith(Number),
      totalServices: sum(sql<number>`cast(${medicareUtilization.totalServices} as integer)`).mapWith(Number),
    })
    .from(medicareUtilization);

  return {
    totalMedicarePayments: row.totalMedicarePayments ?? 0,
    totalBeneficiaries: row.totalBeneficiaries ?? 0,
    totalServices: row.totalServices ?? 0,
  };
}

export interface TopPrescriberProvider {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  specialtyDescription: string | null;
  slug: string;
  totalClaims: number;
  totalDrugCost: number;
  totalBeneficiaries: number;
}

export async function getTopPrescriberProviders(
  limit: number,
): Promise<TopPrescriberProvider[]> {
  const rows = await db
    .select({
      npi: providers.npi,
      firstName: providers.firstName,
      lastName: providers.lastName,
      organizationName: providers.organizationName,
      specialtyDescription: providers.specialtyDescription,
      slug: providers.slug,
      totalClaims: sum(sql<number>`cast(${prescriberData.totalClaims} as integer)`).mapWith(Number),
      totalDrugCost: sum(prescriberData.totalDrugCost).mapWith(Number),
      totalBeneficiaries: sum(prescriberData.totalBeneficiaries).mapWith(Number),
    })
    .from(prescriberData)
    .innerJoin(providers, eq(prescriberData.providerNpi, providers.npi))
    .groupBy(
      providers.npi,
      providers.firstName,
      providers.lastName,
      providers.organizationName,
      providers.specialtyDescription,
      providers.slug,
    )
    .orderBy(desc(sum(prescriberData.totalDrugCost)))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    totalClaims: r.totalClaims ?? 0,
    totalDrugCost: r.totalDrugCost ?? 0,
    totalBeneficiaries: r.totalBeneficiaries ?? 0,
  }));
}

export interface PrescriberAggregateStats {
  totalDrugCost: number;
  totalClaims: number;
  totalBeneficiaries: number;
}

export async function getPrescriberAggregateStats(): Promise<PrescriberAggregateStats> {
  const [row] = await db
    .select({
      totalDrugCost: sum(prescriberData.totalDrugCost).mapWith(Number),
      totalClaims: sum(sql<number>`cast(${prescriberData.totalClaims} as integer)`).mapWith(Number),
      totalBeneficiaries: sum(prescriberData.totalBeneficiaries).mapWith(Number),
    })
    .from(prescriberData);

  return {
    totalDrugCost: row.totalDrugCost ?? 0,
    totalClaims: row.totalClaims ?? 0,
    totalBeneficiaries: row.totalBeneficiaries ?? 0,
  };
}
