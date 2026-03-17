import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { alerts, providers, users } from '../../src/db/schema';
import { eq, and, gte, ilike } from 'drizzle-orm';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://provideratlas.com';

async function sendDigests(): Promise<void> {
  if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) {
    console.error('DATABASE_URL and RESEND_API_KEY must be set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Get active alerts
  const activeAlerts = await db.select().from(alerts).where(eq(alerts.active, true));
  console.log(`Processing ${activeAlerts.length} active alerts...`);

  for (const alert of activeAlerts) {
    // Look up user email
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, alert.userId));
    if (!user) {
      console.log(`  Alert "${alert.name}": user ${alert.userId} not found, skipping`);
      continue;
    }

    const query = alert.query as { specialty?: string; city?: string; zip?: string };
    const since = alert.lastSent || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // default 7 days

    // Build conditions
    const conditions = [gte(providers.createdAt, since)];
    if (query.specialty) {
      conditions.push(ilike(providers.specialtyDescription, `%${query.specialty}%`));
    }
    if (query.city) {
      conditions.push(ilike(providers.city, query.city));
    }

    const newProviders = await db.select().from(providers).where(and(...conditions)).limit(50);

    if (newProviders.length === 0) {
      console.log(`  Alert "${alert.name}": no new matches`);
      continue;
    }

    // Send email
    try {
      await resend.emails.send({
        from: 'ProviderAtlas <alerts@provideratlas.com>',
        to: user.email,
        subject: `${newProviders.length} new providers match "${alert.name}"`,
        html: `
          <h2>${newProviders.length} New Providers Match Your Alert</h2>
          <p>Alert: ${alert.name}</p>
          <ul>
            ${newProviders.slice(0, 20).map(p =>
              `<li><a href="${APP_URL}/provider/${p.npi}">${p.firstName || ''} ${p.lastName || p.organizationName || ''}</a> — ${p.specialtyDescription || 'Unknown'} in ${p.city || 'Unknown'}, TX</li>`
            ).join('')}
          </ul>
          ${newProviders.length > 20 ? `<p>...and ${newProviders.length - 20} more. <a href="${APP_URL}">View all on ProviderAtlas.</a></p>` : ''}
          <p style="color:#888;font-size:12px;margin-top:24px;">Manage your alerts at <a href="${APP_URL}/dashboard/alerts">${APP_URL}/dashboard/alerts</a></p>
        `,
      });

      // Update lastSent
      await db.update(alerts).set({ lastSent: new Date() }).where(eq(alerts.id, alert.id));
      console.log(`  Alert "${alert.name}": sent ${newProviders.length} matches to ${user.email}`);
    } catch (err) {
      console.error(`  Alert "${alert.name}": send failed`, err);
    }
  }

  console.log('Digest processing complete.');
}

sendDigests();
