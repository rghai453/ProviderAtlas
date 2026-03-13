import { db } from '@/db';
import { specialties } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllSpecialties(): Promise<(typeof specialties.$inferSelect)[]> {
  return db.select().from(specialties).orderBy(desc(specialties.providerCount));
}

export async function getSpecialtyByCode(
  code: string,
): Promise<typeof specialties.$inferSelect | undefined> {
  return db.query.specialties.findFirst({
    where: eq(specialties.code, code),
  });
}

export async function getTopSpecialties(
  limit: number,
): Promise<(typeof specialties.$inferSelect)[]> {
  return db
    .select()
    .from(specialties)
    .orderBy(desc(specialties.providerCount))
    .limit(limit);
}

export async function getSpecialtyByDescription(
  description: string,
): Promise<typeof specialties.$inferSelect | undefined> {
  return db.query.specialties.findFirst({
    where: eq(specialties.description, description),
  });
}
