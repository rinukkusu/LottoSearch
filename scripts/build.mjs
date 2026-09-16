// Downloads all Lotto CSV files from win2day and compiles them into data/draws.js
// Usage: node scripts/build.mjs [--save-csv]
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOWNLOAD_PAGE = 'https://www.win2day.at/lotterie/lotto/lotto-statistik-zahlen-ergebnisse-download';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');
const saveCsv = process.argv.includes('--save-csv');

async function fetchText(url, encoding = 'utf-8') {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return new TextDecoder(encoding).decode(await res.arrayBuffer());
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${err.message}`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

async function findCsvUrls() {
  const html = await fetchText(DOWNLOAD_PAGE);
  const urls = [...new Set(html.match(/https:\/\/statics\.win2day\.at\/[^"'\s<>]+\.csv/g) ?? [])];
  if (urls.length === 0) throw new Error('No CSV links found on download page');
  return urls;
}

// Row formats seen across the files:
//   04.01.;aufsteigend;1;4;15;16;22;38;ZZ;11;...          (2017+, year from file name)
//   Mi;08.9.;aufsteigend;4;30;31;32;34;38;Zz;33;...       (2010–2017, year from section header)
//   So.;07.09.;1;20;22;24;27;40;Zz:;12;...                (1986–2010, year from section header; also "Zz.")
const ROW_RE = /^(?:[^;]*;)?\s*(\d{1,2})\.(\d{1,2})\.\s*;(?:aufsteigend;)?((?:\s*\d{1,2}\s*;){6})\s*zz[:.]?\s*;\s*(\d{1,2})\s*;/i;
const YEAR_RE = /^\s*(\d{4}) Lotto/;

function parseCsv(text, url) {
  let year = Number(basename(url).match(/(\d{4})\.csv$/)?.[1]) || null;
  const draws = [];
  for (const line of text.split(/\r?\n/)) {
    const y = line.match(YEAR_RE);
    if (y) { year = Number(y[1]); continue; }
    const m = line.match(ROW_RE);
    if (!m) continue;
    if (!year) throw new Error(`${url}: draw row before any year header: ${line}`);
    const nums = m[3].split(';').filter(s => s.trim()).map(Number);
    draws.push([Number(m[1]), Number(m[2]), year, ...nums, Number(m[4])]);
  }
  return draws;
}

function validate(d) {
  const [day, month, , ...nums] = d;
  const main = nums.slice(0, 6);
  const date = new Date(Date.UTC(d[2], month - 1, day));
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 &&
    nums.every(n => n >= 1 && n <= 45) && new Set(main).size === 6 && !main.includes(nums[6]);
}

const urls = await findCsvUrls();
const byDate = new Map();
for (const url of urls) {
  const text = await fetchText(url, 'windows-1252');
  if (saveCsv) {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(join(DATA_DIR, basename(url)), text);
  }
  const draws = parseCsv(text, url);
  console.log(`${basename(url)}: ${draws.length} draws`);
  for (const d of draws) {
    if (!validate(d)) throw new Error(`${url}: invalid draw ${JSON.stringify(d)}`);
    const key = `${d[2]}-${d[1]}-${d[0]}`;
    const prev = byDate.get(key);
    if (prev && prev.join() !== d.join()) throw new Error(`Conflicting draws for ${key}: ${prev} vs ${d}`);
    byDate.set(key, d);
  }
}

const all = [...byDate.values()].sort((a, b) => a[2] - b[2] || a[1] - b[1] || a[0] - b[0]);
if (all.length < 3000) throw new Error(`Only ${all.length} draws parsed, refusing to write`);

await mkdir(DATA_DIR, { recursive: true });
await writeFile(join(DATA_DIR, 'draws.js'), `const DRAWS=${JSON.stringify(all)};\n`);
console.log(`Wrote ${all.length} draws (${all[0].slice(0, 3).join('.')} – ${all.at(-1).slice(0, 3).join('.')})`);
