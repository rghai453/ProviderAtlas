import fs from 'fs';
import path from 'path';

const API_BASE = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
const BATCH_SIZE = 200;
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/raw/npi');

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

async function fetchNpiOrgs(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const prefixes = generatePrefixes();
  console.log(`Fetching NPI-2 organizations for Texas (${prefixes.length} prefixes)...\n`);

  let total = 0;

  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    let skip = 0;
    let hasMore = true;
    let prefixCount = 0;

    while (hasMore) {
      const url = `${API_BASE}&enumeration_type=NPI-2&state=TX&organization_name=${prefix}*&limit=${BATCH_SIZE}&skip=${skip}`;

      try {
        const response = await fetch(url);
        if (!response.ok) break;

        const data = await response.json();
        if (data.Errors) break;

        const results = data.results || [];
        if (results.length === 0) break;

        const filename = `NPI-2_org_${prefix}_${String(skip).padStart(6, '0')}.json`;
        fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(data, null, 2));

        prefixCount += results.length;
        total += results.length;
        skip += BATCH_SIZE;

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (results.length < BATCH_SIZE || skip >= 1200) hasMore = false;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        break;
      }
    }

    if (prefixCount > 0) {
      console.log(`  ${prefix}*: ${prefixCount} (total: ${total})`);
    }

    if ((i + 1) % 26 === 0) {
      console.log(`  --- Completed letter ${prefix[0].toUpperCase()}, running total: ${total} ---`);
    }
  }

  console.log(`\nDone! Fetched ${total} organizations.`);
}

fetchNpiOrgs();
