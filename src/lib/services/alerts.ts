import { db } from '@/db';
import { alerts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createAlert(
  data: typeof alerts.$inferInsert,
): Promise<typeof alerts.$inferSelect> {
  const [alert] = await db.insert(alerts).values(data).returning();
  return alert;
}

export async function getAlertsByUser(
  userId: string,
): Promise<(typeof alerts.$inferSelect)[]> {
  return db.select().from(alerts).where(eq(alerts.userId, userId));
}

export async function updateAlert(
  id: string,
  data: Partial<Omit<typeof alerts.$inferInsert, 'id'>>,
): Promise<typeof alerts.$inferSelect> {
  const [alert] = await db
    .update(alerts)
    .set(data)
    .where(eq(alerts.id, id))
    .returning();
  return alert;
}

export async function deleteAlert(id: string): Promise<void> {
  await db.delete(alerts).where(eq(alerts.id, id));
}

export async function getActiveAlerts(): Promise<(typeof alerts.$inferSelect)[]> {
  return db.select().from(alerts).where(eq(alerts.active, true));
}
