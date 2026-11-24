// Say What Actually Broke — one brutally honest, funny error line.
// Writes the line to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Node 22, no dependencies.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;
const MIN_CHARS = 1;

/** The entry: one line of software error copy, at most 200 characters. */
const ENTRY =
  "Your file didn't save because the server's disk is full, and the Retry button just asks the same full disk again.";

/**
 * Validate the entry the way the sealed gate does:
 * UTF-8 text, 1-200 characters, exactly one line, not only whitespace.
 * Throws on the first failure so a bad line can never be written.
 */
function validateEntry(text) {
  if (typeof text !== "string") {
    throw new Error("entry must be a string");
  }
  // Re-encode through UTF-8 to prove it is valid UTF-8 text.
  const roundTrip = Buffer.from(text, "utf8").toString("utf8");
  if (roundTrip !== text) {
    throw new Error("entry is not valid UTF-8 text");
  }
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${text.length}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 1) {
    throw new Error(`entry must be exactly one line, got ${lines.length}`);
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("entry must not contain line breaks");
  }
  return text;
}

/** Resolve the output directory: $MAKEFUN_OUTPUT_DIR wins, else /output. */
function outputDir() {
  return process.env.MAKEFUN_OUTPUT_DIR || "/output";
}

function main() {
  const text = validateEntry(ENTRY);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "entry.txt");
  writeFileSync(outPath, text, "utf8");
  console.log(`wrote ${outPath} (${text.length} chars)`);
  console.log(text);
}

main();
