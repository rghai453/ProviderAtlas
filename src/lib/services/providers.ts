import { db } from '@/db';
import { providers } from '@/db/schema';
import { eq, ilike, like, and, desc, gte, ne, sql, count } from 'drizzle-orm';

const PAGE_SIZE = 20;

export interface PaginatedProviders {
  providers: (typeof providers.$inferSelect)[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProviderByNpi(npi: string) {
  return db.query.providers.findFirst({
    where: eq(providers.npi, npi),
    with: {
      payments: true,
    },
  });
}

export async function searchProviders(filters: {
  specialty?: string;
  city?: string;
  zip?: string;
  name?: string;
  page?: number;
}): Promise<PaginatedProviders> {
  const page = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];

  if (filters.specialty) {
    conditions.push(eq(providers.specialtyDescription, filters.specialty));
  }
  if (filters.city) {
    conditions.push(eq(providers.city, filters.city));
  }
  if (filters.zip) {
    conditions.push(eq(providers.zip, filters.zip));
  }
  if (filters.name) {
    conditions.push(
      like(
        sql`concat(${providers.firstName}, ' ', ${providers.lastName}, ' ', coalesce(${providers.organizationName}, ''))`,
        `%${filters.name}%`,
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(providers)
      .where(where)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: count() })
      .from(providers)
      .where(where),
  ]);

  const totalCount = Number(total);

  return {
    providers: rows,
    total: totalCount,
    page,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

export async function getProvidersBySpecialty(
  specialty: string,
  city?: string,
  page?: number,
): Promise<PaginatedProviders> {
  const currentPage = page ?? 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const conditions = [ilike(providers.specialtyDescription, specialty)];
  if (city) {
    conditions.push(eq(providers.city, city));
  }

  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(providers).where(where).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(providers).where(where),
  ]);

  const totalCount = Number(total);

  return {
    providers: rows,
    total: totalCount,
    page: currentPage,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

export async function getProvidersByCity(
  city: string,
  page?: number,
): Promise<PaginatedProviders> {
  const currentPage = page ?? 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const where = eq(providers.city, city);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(providers).where(where).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(providers).where(where),
  ]);

  const totalCount = Number(total);

  return {
    providers: rows,
    total: totalCount,
    page: currentPage,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

export async function getProvidersByZip(
  zip: string,
  page?: number,
): Promise<PaginatedProviders> {
  const currentPage = page ?? 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const where = eq(providers.zip, zip);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(providers).where(where).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(providers).where(where),
  ]);

  const totalCount = Number(total);

  return {
    providers: rows,
    total: totalCount,
    page: currentPage,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

export async function getNewProviders(page?: number): Promise<PaginatedProviders> {
  const currentPage = page ?? 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const where = gte(providers.enumerationDate, thirtyDaysAgo);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(providers)
      .where(where)
      .orderBy(desc(providers.enumerationDate))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(providers).where(where),
  ]);

  const totalCount = Number(total);

  return {
    providers: rows,
    total: totalCount,
    page: currentPage,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

export async function getAllProviderSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: providers.slug }).from(providers);
  return rows.map((r) => r.slug);
}

export async function getProviderCount(): Promise<number> {
  const [{ total }] = await db.select({ total: count() }).from(providers);
  return Number(total);
}

export async function getRelatedProviders(
  specialtyDescription: string,
  city: string,
  excludeNpi: string,
  limit: number = 5,
): Promise<(typeof providers.$inferSelect)[]> {
  return db
    .select()
    .from(providers)
    .where(
      and(
        ilike(providers.specialtyDescription, specialtyDescription),
        eq(providers.city, city),
        ne(providers.npi, excludeNpi),
      ),
    )
    .limit(limit);
}
