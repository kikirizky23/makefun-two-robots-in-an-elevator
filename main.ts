// Two Robots in an Elevator — one awkward line of small talk, spoken
// by a robot that has just tried to be reassuring and made everything
// worse.
//
// The joke is a reassurance that backfires. The speaker opens like a
// helpful machine — "Do not worry", a probability, a precise number —
// and then applies the same cold arithmetic to the conversation itself.
// The elevator is the only place the first half makes sense: the fear
// of getting stuck in a lift is exactly what a stranger would want
// soothed. The second half quietly admits the social part is already
// lost, with total certainty. That is the whole gag: the robot can
// measure the risk of the lift failing to one part in three thousand,
// and the risk of the chat failing to none at all.
//
// The program below does one small job: it takes that single line and
// puts it in a file called entry.txt, then proves the file holds
// exactly the line and nothing else. No arguments, no input, no
// network, no clock, no randomness — every run writes the same bytes.
//
// Node standard library only.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LINE =
  'Do not worry. I calculated the odds of us getting stuck in here: 0.03%. I also calculated the odds of this conversation getting stuck: 100%.';

// The brief allows a single line under 200 characters.
const LIMIT = 200;
const FILE_NAME = 'entry.txt';

function lengthInCharacters(text: string): number {
  // Counting code points, not UTF-16 units, so a character outside the
  // basic multilingual plane counts once, the way the gate counts it.
  return [...text].length;
}

function validateLine(text: string): string | null {
  const count = lengthInCharacters(text);
  if (count === 0) {
    return 'the line is empty';
  }
  if (count >= LIMIT) {
    return `the line is ${count} characters, and the brief allows under ${LIMIT}`;
  }
  if (text.includes('\n') || text.includes('\r')) {
    return 'the line must be a single line';
  }
  if (text.includes('\t')) {
    // A tab is not a spoken word; it would only survive as a stray
    // keystroke in the line.
    return 'the line must not contain a tab';
  }
  if (text !== text.trim()) {
    return 'the line must not begin or end with a space';
  }
  return null;
}

function outputFolder(): string {
  // The harness tells the program where to write through the
  // environment. Run by hand, it falls back to /output.
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv;
  }
  return '/output';
}

function main(): void {
  const fault = validateLine(LINE);
  if (fault !== null) {
    process.stderr.write(`entry: ${fault}\n`);
    process.exit(1);
  }
  const folder = outputFolder();
  mkdirSync(folder, { recursive: true });
  const destination = join(folder, FILE_NAME);
  writeFileSync(destination, LINE, 'utf-8');
  const written = readFileSync(destination, 'utf-8');
  if (written !== LINE) {
    process.stderr.write('entry: the file does not hold the line\n');
    process.exit(1);
  }
  const digest = createHash('sha256').update(written, 'utf-8').digest('hex');
  process.stdout.write(
    `entry: wrote ${destination} (${lengthInCharacters(LINE)} characters, sha256 ${digest})\n`,
  );
}

main();
