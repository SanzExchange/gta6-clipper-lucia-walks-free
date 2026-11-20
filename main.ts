// gta6-clipper-01 entry program, written for this entry.
//
// The entry itself is the YouTube clip named by VIDEO.json; this program is
// the hand-off. The grader runs it with MAKEFUN_BOT_DIR at the repository
// and MAKEFUN_OUTPUT_DIR at the output folder, and the gate then reads the
// clip's address from VIDEO.json in the output. So the program checks the
// address is a plausible YouTube one and places the file, byte for byte,
// into the output folder. Nothing else is read or written: no network, no
// clock, so two runs always produce the same bytes.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`main: ${message}`);
  process.exit(1);
}

const sourcePath = join(botDir, 'VIDEO.json');
let raw: Buffer;
try {
  raw = readFileSync(sourcePath);
} catch {
  fail(`cannot read ${sourcePath}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw!.toString('utf8'));
} catch {
  fail('VIDEO.json is not valid JSON');
}

const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || url.length === 0) {
  fail('VIDEO.json holds no url string');
}
const isYouTube = /^https:\/\/(www\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[\w-]+/.test(url);
if (!isYouTube) {
  fail(`url is not a YouTube address: ${url}`);
}

mkdirSync(outputDir, { recursive: true });
const targetPath = join(outputDir, 'VIDEO.json');
writeFileSync(targetPath, raw!);

// Read the copy back and compare: the gate trusts this file, so a short or
// altered write must fail the run here rather than hand over a bad address.
const written = readFileSync(targetPath);
if (!written.equals(raw!)) {
  fail('the copy in the output folder does not match VIDEO.json');
}
