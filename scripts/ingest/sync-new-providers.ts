/**
 * Daily sync: fetches Texas providers registered in the last N days
 * from the NPI Registry and upserts them into the database.
 *
 * Usage: pnpm tsx scripts/ingest/sync-new-providers.ts [days]
 * Default: 3 days lookback (covers weekends + buffer)
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { providers, specialties, stats } from '../../src/db/schema';
import { count, countDistinct, desc } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_BASE = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
const BATCH_SIZE = 200;
const DB_BATCH_SIZE = 50;

interface NpiResult {
  number: string;
  basic: {
    first_name?: string;
    last_name?: string;
    credential?: string;
    gender?: string;
    enumeration_type: string;
    organization_name?: string;
    enumeration_date?: string;
    last_updated?: string;
  };
  taxonomies: { code: string; desc: string; primary: boolean }[];
  addresses: {
    address_purpose: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country_code?: string;
    telephone_number?: string;
    fax_number?: string;
  }[];
}

function slugify(parts: (string | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(mmddyyyy: string | undefined): Date | null {
  if (!mmddyyyy) return null;
  const [mm, dd, yyyy] = mmddyyyy.split('/');
  if (!mm || !dd || !yyyy) return null;
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function normalizeProvider(r: NpiResult) {
  const isOrg = r.basic.enumeration_type === 'NPI-2';
  const primaryTaxonomy = r.taxonomies?.find((t) => t.primary) ?? r.taxonomies?.[0];
  const practiceAddr = r.addresses?.find((a) => a.address_purpose === 'LOCATION') ?? r.addresses?.[0];

  const firstName = isOrg ? null : (r.basic.first_name ?? null);
  const lastName = isOrg ? null : (r.basic.last_name ?? null);
  const orgName = isOrg ? (r.basic.organization_name ?? null) : null;

  const slug = isOrg
    ? slugify([orgName, r.number])
    : slugify([firstName, lastName, r.number]);

  return {
    npi: r.number,
    firstName,
    lastName,
    credential: r.basic.credential ?? null,
    gender: r.basic.gender ?? null,
    entityType: isOrg ? 'organization' as const : 'individual' as const,
    organizationName: orgName,
    taxonomyCode: primaryTaxonomy?.code ?? null,
    specialtyDescription: primaryTaxonomy?.desc ?? null,
    slug,
    phone: practiceAddr?.telephone_number ?? null,
    fax: practiceAddr?.fax_number ?? null,
    addressLine1: practiceAddr?.address_1 ?? null,
    addressLine2: practiceAddr?.address_2 ?? null,
    city: practiceAddr?.city ?? null,
    state: practiceAddr?.state ?? null,
    zip: practiceAddr?.postal_code?.slice(0, 10) ?? null,
    county: null,
    enumerationDate: formatDate(r.basic.enumeration_date),
    lastUpdated: formatDate(r.basic.last_updated),
  };
}

async function fetchNewProviders(sinceDate: string): Promise<NpiResult[]> {
  const all: NpiResult[] = [];

  for (const enumType of ['NPI-1', 'NPI-2']) {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `${API_BASE}&enumeration_type=${enumType}&state=TX&enumeration_date=${sinceDate}&limit=${BATCH_SIZE}&skip=${skip}`;

      try {
        const res = await fetch(url);
        if (!res.ok) break;

        const data = await res.json();
        if (data.Errors) break;

        const results: NpiResult[] = data.results ?? [];
        if (results.length === 0) break;

        all.push(...results);
        skip += BATCH_SIZE;

        if (results.length < BATCH_SIZE) {
          hasMore = false;
        }

        await new Promise((r) => setTimeout(r, 150));
      } catch {
        console.error(`  Error fetching ${enumType} at skip=${skip}, retrying...`);
        await new Promise((r) => setTimeout(r, 2000));
        break;
      }
    }

    console.log(`  ${enumType}: ${all.length} total so far`);
  }

  return all;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql });

  // Find the latest enumeration_date in the DB to sync from there
  const [latest] = await db
    .select({ maxDate: providers.enumerationDate })
    .from(providers)
    .orderBy(desc(providers.enumerationDate))
    .limit(1);

  let since: Date;
  if (latest?.maxDate) {
    since = new Date(latest.maxDate);
    console.log(`Latest provider in DB: ${since.toISOString().slice(0, 10)}`);
  } else {
    // Fallback: 30 days back if DB is empty
    since = new Date();
    since.setDate(since.getDate() - 30);
    console.log('No providers in DB, looking back 30 days');
  }

  // NPI API expects MM/DD/YYYY for enumeration_date range filter
  const sinceStr = `${String(since.getMonth() + 1).padStart(2, '0')}/${String(since.getDate()).padStart(2, '0')}/${since.getFullYear()}`;

  console.log(`Fetching TX providers registered since ${sinceStr}...\n`);

  const results = await fetchNewProviders(sinceStr);
  console.log(`\nFetched ${results.length} providers from NPI API\n`);

  if (results.length === 0) {
    console.log('No new providers. Done.');
    return;
  }

  const normalized = results.map(normalizeProvider);

  let upserted = 0;
  let errors = 0;

  for (let i = 0; i < normalized.length; i += DB_BATCH_SIZE) {
    const batch = normalized.slice(i, i + DB_BATCH_SIZE);

    try {
      await db.insert(providers).values(batch).onConflictDoUpdate({
        target: providers.npi,
        set: {
          firstName: providers.firstName,
          lastName: providers.lastName,
          credential: providers.credential,
          specialtyDescription: providers.specialtyDescription,
          slug: providers.slug,
          phone: providers.phone,
          fax: providers.fax,
          addressLine1: providers.addressLine1,
          addressLine2: providers.addressLine2,
          city: providers.city,
          state: providers.state,
          zip: providers.zip,
          lastUpdated: providers.lastUpdated,
          updatedAt: new Date(),
        },
      });
      upserted += batch.length;
    } catch {
      for (const record of batch) {
        try {
          await db.insert(providers).values(record).onConflictDoUpdate({
            target: providers.npi,
            set: {
              firstName: providers.firstName,
              lastName: providers.lastName,
              credential: providers.credential,
              specialtyDescription: providers.specialtyDescription,
              slug: providers.slug,
              phone: providers.phone,
              fax: providers.fax,
              city: providers.city,
              zip: providers.zip,
              lastUpdated: providers.lastUpdated,
              updatedAt: new Date(),
            },
          });
          upserted++;
        } catch {
          errors++;
        }
      }
    }
  }

  console.log(`Upserted ${upserted} providers (${errors} errors)\n`);

  // Update specialty counts
  console.log('Updating specialty counts...');
  const specCounts = await db
    .select({
      code: providers.taxonomyCode,
      count: count(),
    })
    .from(providers)
    .where(providers.taxonomyCode)
    .groupBy(providers.taxonomyCode);

  for (const { code, count: c } of specCounts) {
    if (!code) continue;
    await db
      .insert(specialties)
      .values({ code, description: code, providerCount: c })
      .onConflictDoUpdate({
        target: specialties.code,
        set: { providerCount: c },
      });
  }

  // Refresh stats
  console.log('Refreshing stats...');
  const [providerCount] = await db.select({ count: count() }).from(providers);
  const [specialtyCount] = await db.select({ count: count() }).from(specialties);
  const [cityCount] = await db.select({ count: countDistinct(providers.city) }).from(providers);

  for (const { key, value } of [
    { key: 'totalProviders', value: providerCount.count },
    { key: 'totalSpecialties', value: specialtyCount.count },
    { key: 'totalCities', value: cityCount.count },
  ]) {
    await db.insert(stats).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({
      target: stats.key,
      set: { value, updatedAt: new Date() },
    });
  }

  console.log(`Done! Stats: ${providerCount.count} providers, ${specialtyCount.count} specialties, ${cityCount.count} cities`);
}

main();
