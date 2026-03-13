import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserById(
  id: string,
): Promise<typeof users.$inferSelect | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(
  email: string,
): Promise<typeof users.$inferSelect | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function createUser(data: {
  id: string;
  email: string;
  name?: string;
}): Promise<typeof users.$inferSelect> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<typeof users.$inferInsert, 'id'>>,
): Promise<typeof users.$inferSelect> {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function getUserSubscriptionTier(
  id: string,
): Promise<'free' | 'pro'> {
  const result = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0]?.subscriptionTier ?? 'free';
}
