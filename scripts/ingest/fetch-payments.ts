import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/raw/payments');
const CSV_URL = 'https://download.cms.gov/openpayments/PGYR2024_P01232026_01102026/OP_DTL_GNRL_PGYR2024_P01232026_01102026.csv';
const RAW_CSV = path.join(OUTPUT_DIR, 'general_payments_2024_full.csv');
const TX_CSV = path.join(OUTPUT_DIR, 'general_payments_2024_tx.csv');

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;

    console.log(`Downloading from: ${url}`);
    console.log(`Saving to: ${dest}`);
    console.log('This is a large file (~5GB). This will take a while...\n');

    let downloaded = 0;
    let lastLog = Date.now();

    proto.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`Redirecting to: ${redirectUrl}`);
          file.close();
          fs.unlinkSync(dest);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10);

      response.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        const now = Date.now();
        if (now - lastLog > 5000) {
          const mb = (downloaded / 1024 / 1024).toFixed(1);
          const pct = totalSize > 0 ? ((downloaded / totalSize) * 100).toFixed(1) : '?';
          process.stdout.write(`  Downloaded: ${mb} MB (${pct}%)\r`);
          lastLog = now;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const mb = (downloaded / 1024 / 1024).toFixed(1);
        console.log(`\n  Download complete: ${mb} MB`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function filterTexasRecords(): Promise<number> {
  console.log('\nFiltering for Texas records...');

  const input = fs.createReadStream(RAW_CSV);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let header = '';
  let txCount = 0;
  let totalLines = 0;
  let stateColIndex = -1;
  const txOutput = createWriteStream(TX_CSV);

  for await (const line of rl) {
    totalLines++;

    if (totalLines === 1) {
      header = line;
      // Find the column index for recipient_state
      const cols = header.split(',').map(c => c.replace(/"/g, '').trim().toLowerCase());
      stateColIndex = cols.indexOf('recipient_state');
      if (stateColIndex === -1) {
        // Try alternate column name
        stateColIndex = cols.indexOf('covered_recipient_primary_state');
      }
      if (stateColIndex === -1) {
        console.error('Could not find state column. Available columns:', cols.slice(0, 20).join(', '));
        // Just look for TX in the whole line as fallback
        stateColIndex = -2;
      }
      txOutput.write(header + '\n');
      continue;
    }

    let isTexas = false;
    if (stateColIndex === -2) {
      // Fallback: check if TX appears in the line
      isTexas = line.includes(',TX,') || line.includes(',"TX"');
    } else {
      // Parse CSV properly - handle quoted fields
      const match = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
      if (match && match[stateColIndex]) {
        const val = match[stateColIndex].replace(/^,/, '').replace(/"/g, '').trim();
        isTexas = val === 'TX';
      }
    }

    if (isTexas) {
      txOutput.write(line + '\n');
      txCount++;
    }

    if (totalLines % 1000000 === 0) {
      console.log(`  Processed ${(totalLines / 1000000).toFixed(0)}M lines, ${txCount} TX records so far...`);
    }
  }

  txOutput.close();
  console.log(`  Filtered complete: ${txCount} Texas records out of ${totalLines - 1} total.`);

  return txCount;
}

async function convertToJson(): Promise<void> {
  console.log('\nConverting TX CSV to JSON batches...');

  const input = fs.createReadStream(TX_CSV);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let headers: string[] = [];
  let batch: Record<string, string>[] = [];
  let batchNum = 0;
  let totalRecords = 0;
  const BATCH_SIZE = 5000;

  for await (const line of rl) {
    if (headers.length === 0) {
      headers = line.split(',').map(h => h.replace(/"/g, '').trim());
      continue;
    }

    // Simple CSV parse (handles most cases)
    const values = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
    if (!values) continue;

    const record: Record<string, string> = {};
    values.forEach((val, i) => {
      if (i < headers.length) {
        record[headers[i]] = val.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      }
    });

    batch.push(record);
    totalRecords++;

    if (batch.length >= BATCH_SIZE) {
      const filename = `payments_${String(batchNum).padStart(5, '0')}.json`;
      fs.writeFileSync(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify({ results: batch }, null, 2)
      );
      batchNum++;
      batch = [];
    }
  }

  // Write remaining
  if (batch.length > 0) {
    const filename = `payments_${String(batchNum).padStart(5, '0')}.json`;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, filename),
      JSON.stringify({ results: batch }, null, 2)
    );
  }

  console.log(`  Converted ${totalRecords} records into ${batchNum + 1} JSON batches.`);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Download the full CSV
  if (!fs.existsSync(RAW_CSV)) {
    await downloadFile(CSV_URL, RAW_CSV);
  } else {
    const size = fs.statSync(RAW_CSV).size;
    console.log(`Raw CSV already exists (${(size / 1024 / 1024).toFixed(1)} MB), skipping download.`);
  }

  // Step 2: Filter for Texas
  if (!fs.existsSync(TX_CSV)) {
    await filterTexasRecords();
  } else {
    console.log('TX CSV already exists, skipping filter.');
  }

  // Step 3: Convert to JSON batches for the normalize script
  await convertToJson();

  // Optional: Clean up the huge full CSV to save disk space
  // fs.unlinkSync(RAW_CSV);

  console.log('\nPayments fetch complete!');
}

main();
