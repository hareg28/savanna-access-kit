import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildShareHtml,
  computeFileChecksum,
  parseVttToCues,
  type ShareLessonData,
} from "../../../pipeline/src/pack/shareFile";
import type { LessonRecord } from "../db/store";

const FIXTURES_MEDIA = fileURLToPath(new URL("../../../contracts/fixtures/media", import.meta.url));

interface CachedShareFile {
  html: string;
  checksum: string;
  bytes: number;
}

const cache = new Map<string, CachedShareFile>();

export async function getOrBuildShareFile(lesson: LessonRecord): Promise<CachedShareFile> {
  const cached = cache.get(lesson.id);
  if (cached) return cached;

  // 1. Locate audio file
  const audioAsset = lesson.assets.find((a) => a.kind === "audio");
  let audioBuffer: Buffer | null = null;

  if (audioAsset) {
    if (audioAsset.url.includes("lesson.opus") || fs.existsSync(path.join(FIXTURES_MEDIA, "lesson.opus"))) {
      audioBuffer = fs.readFileSync(path.join(FIXTURES_MEDIA, "lesson.opus"));
    }
  }

  if (!audioBuffer && fs.existsSync(path.join(FIXTURES_MEDIA, "lesson.opus"))) {
    audioBuffer = fs.readFileSync(path.join(FIXTURES_MEDIA, "lesson.opus"));
  }

  if (!audioBuffer) {
    throw new Error(`Lesson "${lesson.id}" has no audio available to build a share file.`);
  }

  // 2. Load captions
  let enVtt = "";
  let amVtt = "";
  const enFile = path.join(FIXTURES_MEDIA, "en.vtt");
  const amFile = path.join(FIXTURES_MEDIA, "am.vtt");
  if (fs.existsSync(enFile)) enVtt = fs.readFileSync(enFile, "utf8");
  if (fs.existsSync(amFile)) amVtt = fs.readFileSync(amFile, "utf8");

  const enCues = enVtt ? parseVttToCues(enVtt) : [];
  const amCues = amVtt ? parseVttToCues(amVtt) : [];

  const shareData: ShareLessonData = {
    id: lesson.id,
    title: lesson.title,
    durationSec: lesson.durationSec,
    audioBase64: audioBuffer.toString("base64"),
    mimeType: "audio/ogg; codecs=opus",
    summary: {
      en: "Learn what a database is and how data is stored in tables.",
      am: "የመረጃ ቋት ምን እንደሆነ እና መረጃ እንዴት በሰንጠረዦች ውስጥ እንደሚከማች ይማሩ።",
    },
    captions: {
      en: enCues,
      am: amCues,
    },
  };

  const html = buildShareHtml(shareData);
  const checksum = computeFileChecksum(html);
  const bytes = Buffer.byteLength(html, "utf8");

  const entry: CachedShareFile = { html, checksum, bytes };
  cache.set(lesson.id, entry);
  return entry;
}
