import { db } from '@/db';
import { payments, providers } from '@/db/schema';
import { eq, desc, sql, sum } from 'drizzle-orm';

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
