/**
 * WebVTT parser and validator for caption review/upload (FR-A2).
 * Enforces SRS limits:
 * - At most 2 lines per cue
 * - About 32 characters per line (max 37)
 * - 1 to 7 seconds per cue
 * - Valid timestamps in chronological order
 */

export interface ParsedCue {
  index: number;
  id?: string;
  start: number; // in seconds
  end: number;   // in seconds
  lines: string[];
}

export interface ValidationError {
  cueIndex: number | null;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  cues: ParsedCue[];
  errors: ValidationError[];
}

function parseTimestamp(ts: string): number | null {
  const match = /^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/.exec(ts.trim());
  if (!match) return null;
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  const millis = parseInt(match[4] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

export function formatTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

/** Parses WebVTT into cues. */
export function parseWebVTT(vttText: string): { cues: ParsedCue[]; parseErrors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const cues: ParsedCue[] = [];
  const lines = vttText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  if (lines.length === 0) {
    errors.push({
      cueIndex: null,
      code: "empty-file",
      message: "The caption file is empty.",
    });
    return { cues, parseErrors: errors };
  }

  // Skip UTF-8 BOM if present
  const firstLine = lines[0] ?? "";
  if (firstLine.charCodeAt(0) === 0xfeff) {
    lines[0] = firstLine.slice(1);
  }

  // Must begin with WEBVTT
  const header = (lines[0] ?? "").trim();
  if (!header.startsWith("WEBVTT")) {
    errors.push({
      cueIndex: null,
      code: "not-webvtt",
      message: "The caption file does not begin with the WEBVTT header.",
    });
    return { cues, parseErrors: errors };
  }

  let i = 1;
  // Skip headers or comments before first blank line
  while (i < lines.length && (lines[i] ?? "").trim() !== "") {
    i++;
  }

  let cueCount = 0;
  while (i < lines.length) {
    // Skip empty lines
    while (i < lines.length && (lines[i] ?? "").trim() === "") {
      i++;
    }
    if (i >= lines.length) break;

    cueCount++;
    const cueIndex = cueCount;
    let cueId: string | undefined;

    const currentLine = lines[i] ?? "";
    // Check if current line is cue identifier or timing line
    if (!currentLine.includes("-->")) {
      cueId = currentLine.trim();
      i++;
      const nextLine = lines[i] ?? "";
      if (i >= lines.length || !nextLine.includes("-->")) {
        errors.push({
          cueIndex,
          code: "invalid-timing",
          message: `Cue ${cueIndex} is missing a valid timestamp timing line.`,
        });
        i++;
        continue;
      }
    }

    const timingLine = (lines[i] ?? "").trim();
    i++;
    const [startStr = "", ...rest] = timingLine.split("-->");
    const endStr = (rest.join("-->").trim().split(/[ \t]/)[0]) ?? "";

    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);

    if (start === null || end === null) {
      errors.push({
        cueIndex,
        code: "invalid-timestamp",
        message: `Cue ${cueIndex} has malformed timestamps: "${timingLine}".`,
      });
      continue;
    }

    // Collect cue text lines until empty line or EOF
    const textLines: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "") {
      textLines.push((lines[i] ?? "").trim());
      i++;
    }

    cues.push({
      index: cueIndex,
      id: cueId,
      start,
      end,
      lines: textLines,
    });
  }

  return { cues, parseErrors: errors };
}

/** Validates parsed WebVTT cues against SRS & Addendum 1.1 rules. */
export function validateWebVTT(vttText: string): ValidationResult {
  const { cues, parseErrors } = parseWebVTT(vttText);
  if (parseErrors.length > 0) {
    return { valid: false, cues, errors: parseErrors };
  }

  const errors: ValidationError[] = [];
  if (cues.length === 0) {
    errors.push({
      cueIndex: null,
      code: "empty-captions",
      message: "The caption file contains zero cues.",
    });
    return { valid: false, cues, errors };
  }

  let prevEnd = 0;

  for (const cue of cues) {
    const duration = cue.end - cue.start;

    // 1. Valid timing: end must be after start
    if (duration <= 0) {
      errors.push({
        cueIndex: cue.index,
        code: "invalid-duration",
        message: `Cue ${cue.index} ends at or before its start time (${duration.toFixed(2)}s).`,
      });
    }

    // 2. Sequential / no overlap
    if (cue.start < prevEnd - 0.05) {
      errors.push({
        cueIndex: cue.index,
        code: "overlapping-cues",
        message: `Cue ${cue.index} starts at ${cue.start.toFixed(2)}s before previous cue ends at ${prevEnd.toFixed(2)}s.`,
      });
    }

    // 3. Duration: 1 to 7 seconds per cue
    if (duration > 0 && duration < 0.95) {
      errors.push({
        cueIndex: cue.index,
        code: "cue-too-short",
        message: `Cue ${cue.index} duration is ${duration.toFixed(2)}s, shorter than the minimum 1.0s.`,
      });
    }
    if (duration > 7.05) {
      errors.push({
        cueIndex: cue.index,
        code: "cue-too-long",
        message: `Cue ${cue.index} duration is ${duration.toFixed(2)}s, exceeding the maximum 7.0s.`,
      });
    }

    // 4. Line count: at most 2 lines
    if (cue.lines.length === 0) {
      errors.push({
        cueIndex: cue.index,
        code: "empty-cue-text",
        message: `Cue ${cue.index} has no caption text.`,
      });
    } else if (cue.lines.length > 2) {
      errors.push({
        cueIndex: cue.index,
        code: "too-many-lines",
        message: `Cue ${cue.index} has ${cue.lines.length} lines (maximum allowed is 2 lines).`,
      });
    }

    // 5. Line length: about 32 characters (enforce max 37 characters per line)
    for (let li = 0; li < cue.lines.length; li++) {
      const line = cue.lines[li] ?? "";
      // strip html/vtt tags if any
      const cleanLine = line.replace(/<[^>]+>/g, "").trim();
      const len = [...cleanLine].length; // grapheme/char count
      if (len > 37) {
        errors.push({
          cueIndex: cue.index,
          code: "line-too-long",
          message: `Cue ${cue.index} line ${li + 1} has ${len} characters ("${cleanLine.slice(0, 25)}..."), exceeding the 37 character limit.`,
        });
      }
    }

    prevEnd = Math.max(prevEnd, cue.end);
  }

  return {
    valid: errors.length === 0,
    cues,
    errors,
  };
}
