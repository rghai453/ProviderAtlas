import { db } from '@/db';
import { payments, providers } from '@/db/schema';
import { eq, desc, sql, sum, count, avg, countDistinct } from 'drizzle-orm';

const PAGE_SIZE = 20;

export interface PaginatedPayments {
  payments: (typeof payments.$inferSelect)[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TopPaymentRecipient {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  specialtyDescription: string | null;
  slug: string;
  totalPayments: number;
}

export async function getPaymentsByProvider(
  npi: string,
): Promise<(typeof payments.$inferSelect)[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.providerNpi, npi))
    .orderBy(desc(payments.dateOfPayment));
}

export async function getTopPaymentRecipients(
  limit: number,
): Promise<TopPaymentRecipient[]> {
  const rows = await db
    .select({
      npi: providers.npi,
      firstName: providers.firstName,
      lastName: providers.lastName,
      organizationName: providers.organizationName,
      specialtyDescription: providers.specialtyDescription,
      slug: providers.slug,
      totalPayments: sum(payments.amount).mapWith(Number),
    })
    .from(payments)
    .innerJoin(providers, eq(payments.providerNpi, providers.npi))
    .groupBy(
      providers.npi,
      providers.firstName,
      providers.lastName,
      providers.organizationName,
      providers.specialtyDescription,
      providers.slug,
    )
    .orderBy(desc(sum(payments.amount)))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    totalPayments: r.totalPayments ?? 0,
  }));
}

export interface PaymentsByCompanySummary {
  payerName: string;
  totalAmount: number;
  transactionCount: number;
}

export interface PaymentsByYearSummary {
  year: number;
  totalAmount: number;
  transactionCount: number;
}

export async function getPaymentSummaryByProvider(
  npi: string,
): Promise<{
  byCompany: PaymentsByCompanySummary[];
  byYear: PaymentsByYearSummary[];
}> {
  const [byCompany, byYear] = await Promise.all([
    db
      .select({
        payerName: payments.payerName,
        totalAmount: sum(payments.amount).mapWith(Number),
        transactionCount: count(),
      })
      .from(payments)
      .where(eq(payments.providerNpi, npi))
      .groupBy(payments.payerName)
      .orderBy(desc(sum(payments.amount))),
    db
      .select({
        year: sql<number>`coalesce(${payments.programYear}, extract(year from ${payments.dateOfPayment})::integer)`,
        totalAmount: sum(payments.amount).mapWith(Number),
        transactionCount: count(),
      })
      .from(payments)
      .where(eq(payments.providerNpi, npi))
      .groupBy(sql`coalesce(${payments.programYear}, extract(year from ${payments.dateOfPayment})::integer)`)
      .orderBy(desc(sql`coalesce(${payments.programYear}, extract(year from ${payments.dateOfPayment})::integer)`)),
  ]);

  return {
    byCompany: byCompany.map((r) => ({
      ...r,
      totalAmount: r.totalAmount ?? 0,
    })),
    byYear: byYear.map((r) => ({
      ...r,
      year: Number(r.year),
      totalAmount: r.totalAmount ?? 0,
    })),
  };
}

export async function getAllProviderNpisWithPayments(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ npi: payments.providerNpi })
    .from(payments);
  return rows.map((r) => r.npi);
}

export interface PaymentAggregateStats {
  totalPayments: number;
  providerCount: number;
  companyCount: number;
}

export async function getPaymentAggregateStats(): Promise<PaymentAggregateStats> {
  const [row] = await db
    .select({
      totalPayments: sum(payments.amount).mapWith(Number),
      providerCount: countDistinct(payments.providerNpi),
      companyCount: countDistinct(payments.payerName),
    })
    .from(payments);

  return {
    totalPayments: row.totalPayments ?? 0,
    providerCount: Number(row.providerCount),
    companyCount: Number(row.companyCount),
  };
}

export interface PaymentStatBySpecialty {
  specialty: string;
  providerCount: number;
  totalPayments: number;
  avgPayment: number;
}

export async function getPaymentStatsBySpecialty(
  limit: number,
): Promise<PaymentStatBySpecialty[]> {
  const rows = await db
    .select({
      specialty: providers.specialtyDescription,
      providerCount: countDistinct(providers.npi),
      totalPayments: sum(payments.amount).mapWith(Number),
      avgPayment: avg(payments.amount).mapWith(Number),
    })
    .from(payments)
    .innerJoin(providers, eq(payments.providerNpi, providers.npi))
    .groupBy(providers.specialtyDescription)
    .orderBy(desc(sum(payments.amount)))
    .limit(limit);

  return rows.map((r) => ({
    specialty: r.specialty ?? 'Unknown',
    providerCount: Number(r.providerCount),
    totalPayments: r.totalPayments ?? 0,
    avgPayment: Math.round((r.totalPayments ?? 0) / Number(r.providerCount)),
  }));
}

export async function getPaymentsByCompany(
  payerName: string,
  page?: number,
): Promise<PaginatedPayments> {
  const currentPage = page ?? 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const where = eq(payments.payerName, payerName);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.dateOfPayment))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(payments)
      .where(where),
  ]);

  const totalCount = Number(total);

  return {
    payments: rows,
    total: totalCount,
    page: currentPage,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}
