import { db } from '@/db';
import { providers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import Papa from 'papaparse';
import { PRO_CSV_EXPORT_MAX_ROWS } from '@/lib/tier-limits';

interface ExportFilters {
  specialty?: string;
  city?: string;
  zip?: string;
}

interface ProviderCsvRow {
  NPI: string;
  Name: string;
  Specialty: string;
  Address: string;
  City: string;
  State: string;
  ZIP: string;
  Phone: string;
}

export async function generateExportCsv(filters: ExportFilters): Promise<string> {
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

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.select().from(providers).where(where).limit(PRO_CSV_EXPORT_MAX_ROWS);

  const csvRows: ProviderCsvRow[] = rows.map((p) => ({
    NPI: p.npi,
    Name:
      p.entityType === 'organization'
        ? (p.organizationName ?? '')
        : `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
    Specialty: p.specialtyDescription ?? '',
    Address: [p.addressLine1, p.addressLine2].filter(Boolean).join(', '),
    City: p.city ?? '',
    State: p.state ?? '',
    ZIP: p.zip ?? '',
    Phone: p.phone ?? '',
  }));

  return Papa.unparse(csvRows);
}
