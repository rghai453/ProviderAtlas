import fs from 'fs';
import path from 'path';

const API_BASE = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
const BATCH_SIZE = 200;
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/raw/npi');

// NPI API requires 2+ leading chars before wildcard.
// Strategy: iterate two-letter prefixes (Aa* through Zz*) for each enum type.
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

function generatePrefixes(): string[] {
  const prefixes: string[] = [];
  for (const a of ALPHABET) {
    for (const b of ALPHABET) {
      prefixes.push(`${a}${b}`);
    }
  }
  return prefixes;
}

async function fetchForPrefix(enumType: string, prefix: string): Promise<number> {
  let skip = 0;
  let totalFetched = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}&enumeration_type=${enumType}&state=TX&last_name=${prefix}*&limit=${BATCH_SIZE}&skip=${skip}`;

    try {
      const response = await fetch(url);
      if (!response.ok) break;

      const data = await response.json();
      if (data.Errors) break;

      const results = data.results || [];
      if (results.length === 0) break;

      const filename = `${enumType}_${prefix}_${String(skip).padStart(6, '0')}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));

      totalFetched += results.length;
      skip += BATCH_SIZE;

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (results.length < BATCH_SIZE || skip >= 1200) {
        hasMore = false;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      break;
    }
  }

  return totalFetched;
}

async function fetchNpiData(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const prefixes = generatePrefixes();
  console.log(`Starting NPI data fetch for Texas (${prefixes.length} prefixes per enum type)...\n`);

  let grandTotal = 0;

  for (const enumType of ['NPI-1', 'NPI-2']) {
    console.log(`=== ${enumType} ===`);
    let typeTotal = 0;

    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];
      const count = await fetchForPrefix(enumType, prefix);
      typeTotal += count;

      if (count > 0) {
        console.log(`  ${prefix}*: ${count} (${enumType} total: ${typeTotal})`);
      }

      // Progress update every 26 prefixes (each starting letter)
      if ((i + 1) % 26 === 0) {
        const letter = prefix[0].toUpperCase();
        console.log(`  --- Completed letter ${letter}, ${enumType} running total: ${typeTotal} ---`);
      }
    }

    console.log(`\n  ${enumType} subtotal: ${typeTotal}\n`);
    grandTotal += typeTotal;
  }

  console.log(`\nDone! Fetched ${grandTotal} total providers.`);
}

fetchNpiData();
