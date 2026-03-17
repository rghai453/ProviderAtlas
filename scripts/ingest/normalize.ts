import fs from 'fs';
import path from 'path';

const NPI_DIR = path.join(process.cwd(), 'scripts/raw/npi');
const PAYMENTS_DIR = path.join(process.cwd(), 'scripts/raw/payments');
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/normalized');

interface NormalizedProvider {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  credential: string | null;
  gender: string | null;
  entityType: 'individual' | 'organization';
  organizationName: string | null;
  taxonomyCode: string | null;
  specialtyDescription: string | null;
  slug: string;
  phone: string | null;
  fax: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  enumerationDate: string | null;
  lastUpdated: string | null;
}

interface NormalizedPayment {
  providerNpi: string;
  payerName: string;
  payerType: 'pharma' | 'device' | null;
  amount: number; // cents
  dateOfPayment: string | null;
  natureOfPayment: string | null;
  formOfPayment: string | null;
  contextualInfo: string | null;
  programYear: number | null;
}

export function normalizeSpecialtyDescription(raw: string, collisions: Set<string>): string {
  // 1. Trim and collapse whitespace, strip trailing commas
  let desc = raw.trim().replace(/,\s*$/, '').replace(/\s+/g, ' ');

  // 2. If no comma, return as-is
  if (!desc.includes(', ')) return desc;

  // 3. Split on first comma
  const commaIdx = desc.indexOf(', ');
  const prefix = desc.slice(0, commaIdx);
  const suffix = desc.slice(commaIdx + 2).trim();
  if (!suffix) return prefix;

  // 4. If sub-specialty is unique, drop prefix
  if (!collisions.has(suffix)) return suffix;

  // 5. If collision, use em dash format
  return `${prefix} — ${suffix}`;
}

export function buildCollisionSet(descriptions: string[]): Set<string> {
  const suffixToCodeCount = new Map<string, number>();
  for (const raw of descriptions) {
    const cleaned = raw.trim().replace(/,\s*$/, '').replace(/\s+/g, ' ');
    if (!cleaned.includes(', ')) continue;
    const suffix = cleaned.slice(cleaned.indexOf(', ') + 2).trim();
    if (!suffix) continue;
    suffixToCodeCount.set(suffix, (suffixToCodeCount.get(suffix) ?? 0) + 1);
  }
  const collisions = new Set<string>();
  for (const [suffix, count] of suffixToCodeCount) {
    if (count >= 2) collisions.add(suffix);
  }
  return collisions;
}

function cleanName(name: string | null | undefined): string | null {
  if (!name) return null;
  return name.trim().replace(/\s+/g, ' ').split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ');
}

function generateSlug(provider: { firstName?: string | null; lastName?: string | null; organizationName?: string | null; npi: string; entityType: string }): string {
  if (provider.entityType === 'individual' && provider.firstName && provider.lastName) {
    const name = `${provider.firstName}-${provider.lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    return `${name}-${provider.npi}`;
  }
  if (provider.organizationName) {
    const name = provider.organizationName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 50);
    return `${name}-${provider.npi}`;
  }
  return provider.npi;
}

function normalizeProviders(): NormalizedProvider[] {
  if (!fs.existsSync(NPI_DIR)) {
    console.log('No NPI raw data found. Run fetch-npi.ts first.');
    return [];
  }

  const files = fs.readdirSync(NPI_DIR).filter(f => f.endsWith('.json')).sort();
  const providers = new Map<string, NormalizedProvider>();

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(NPI_DIR, file), 'utf-8'));
    const results = data.results || [];

    for (const r of results) {
      const npi = r.number?.toString();
      if (!npi) continue;

      const basic = r.basic || {};
      const addresses = r.addresses || [];
      // Prefer the TX address; fall back to first address
      const address = addresses.find((a: Record<string, unknown>) => a.state === 'TX') || addresses[0] || {};
      const taxonomy = r.taxonomies?.[0] || {};
      const entityType = r.enumeration_type === 'NPI-1' ? 'individual' : 'organization';

      const provider: NormalizedProvider = {
        npi,
        firstName: cleanName(basic.first_name),
        lastName: cleanName(basic.last_name),
        credential: basic.credential || null,
        gender: basic.gender || null,
        entityType,
        organizationName: cleanName(basic.organization_name),
        taxonomyCode: taxonomy.code || null,
        specialtyDescription: taxonomy.desc || null,
        slug: '',
        phone: address.telephone_number || null,
        fax: address.fax_number || null,
        addressLine1: address.address_1 || null,
        addressLine2: address.address_2 || null,
        city: cleanName(address.city),
        state: address.state || null,
        zip: address.postal_code?.slice(0, 5) || null,
        county: null,
        enumerationDate: basic.enumeration_date || null,
        lastUpdated: basic.last_updated || null,
      };

      // Only include Texas providers
      if (provider.state !== 'TX') continue;

      provider.slug = generateSlug(provider);
      providers.set(npi, provider);
    }
  }

  return Array.from(providers.values());
}

function normalizePayments(): NormalizedPayment[] {
  if (!fs.existsSync(PAYMENTS_DIR)) {
    console.log('No payments raw data found. Run fetch-payments.ts first.');
    return [];
  }

  const files = fs.readdirSync(PAYMENTS_DIR).filter(f => f.endsWith('.json')).sort();
  const payments: NormalizedPayment[] = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(PAYMENTS_DIR, file), 'utf-8'));
    const results = data.results || data.data || [];

    for (const r of results) {
      // Support both lowercase (API) and PascalCase (CSV) field names
      const npi = r.Covered_Recipient_NPI || r.covered_recipient_npi || r.physician_npi;
      if (!npi) continue;

      const amountStr = r.Total_Amount_of_Payment_USDollars || r.total_amount_of_payment_usdollars || '0';
      const amount = Math.round(parseFloat(amountStr) * 100);

      const payerName = r.Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name
        || r.applicable_manufacturer_or_applicable_gpo_making_payment_name
        || 'Unknown';

      const coveredFlag = r.Covered_or_Noncovered_Indicator_Flag || r.covered_or_noncovered_indicator_flag;

      payments.push({
        providerNpi: npi.toString(),
        payerName,
        payerType: coveredFlag === 'Covered' ? 'pharma' : 'device',
        amount,
        dateOfPayment: r.Date_of_Payment || r.date_of_payment || null,
        natureOfPayment: r.Nature_of_Payment_or_Transfer_of_Value || r.nature_of_payment_or_transfer_of_value || null,
        formOfPayment: r.Form_of_Payment_or_Transfer_of_Value || r.form_of_payment_or_transfer_of_value || null,
        contextualInfo: r.Contextual_Information || r.contextual_information || null,
        programYear: r.Program_Year || r.program_year ? parseInt(r.Program_Year || r.program_year) : null,
      });
    }
  }

  return payments;
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Normalizing providers...');
  const providers = normalizeProviders();
  console.log(`  → ${providers.length} providers normalized`);

  console.log('Normalizing payments...');
  const payments = normalizePayments();
  console.log(`  → ${payments.length} payments normalized`);

  // Collect unique specialties (raw descriptions first)
  const specialties = new Map<string, { code: string; description: string; count: number }>();
  for (const p of providers) {
    if (p.taxonomyCode && p.specialtyDescription) {
      const existing = specialties.get(p.taxonomyCode);
      if (existing) {
        existing.count++;
      } else {
        specialties.set(p.taxonomyCode, {
          code: p.taxonomyCode,
          description: p.specialtyDescription,
          count: 1,
        });
      }
    }
  }

  // Build collision set from raw specialty descriptions (one per taxonomy code)
  const rawDescriptions = Array.from(specialties.values()).map(s => s.description);
  const collisions = buildCollisionSet(rawDescriptions);
  console.log(`  → ${collisions.size} colliding sub-specialty names detected`);

  // Normalize specialty descriptions
  for (const s of specialties.values()) {
    s.description = normalizeSpecialtyDescription(s.description, collisions);
  }
  for (const p of providers) {
    if (p.specialtyDescription) {
      p.specialtyDescription = normalizeSpecialtyDescription(p.specialtyDescription, collisions);
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'providers.json'), JSON.stringify(providers, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'payments.json'), JSON.stringify(payments, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'specialties.json'), JSON.stringify(Array.from(specialties.values()), null, 2));

  console.log(`\nNormalized data written to ${OUTPUT_DIR}`);
  console.log(`  Providers: ${providers.length}`);
  console.log(`  Payments: ${payments.length}`);
  console.log(`  Specialties: ${specialties.size}`);
}

// Only run main() when executed directly, not when imported
const isDirectRun = process.argv[1]?.endsWith('normalize.ts') || process.argv[1]?.endsWith('normalize');
if (isDirectRun) {
  main();
}
