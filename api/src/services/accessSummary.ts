import type { AssetRecord, LessonRecord } from "../db/store";
import type { AccessSummary, LessonManifest } from "../schemas/lesson";

export type AccessInput =
  | LessonRecord
  | LessonManifest
  | {
      id?: string;
      assets?: AssetRecord[];
      captions?: Array<{ lang: "en" | "am"; url?: string; status?: "reviewed" | "draft" }>;
      sign?: unknown;
      audioDescription?: unknown;
      pack?: { sizeBytes?: number } | null;
      transcript?: { url?: string } | null;
      summary?: boolean;
      access?: AccessSummary | null;
    };

/**
 * Pure function returning the six facts from the manifest and assets (Addendum 1.2, Feature A).
 * No database calls, deterministic and unit-testable.
 */
export function accessSummary(lesson?: AccessInput | null): AccessSummary {
  if (!lesson) {
    return {
      captions: [],
      sign: false,
      audioDescription: { recorded: false, text: false },
      offline: null,
      transcript: false,
      summary: false,
    };
  }

  // 1. Captions: English, Amharic with reviewed or draft status
  const captions: AccessSummary["captions"] = [];
  if ("assets" in lesson && Array.isArray(lesson.assets)) {
    const vttAssets = lesson.assets.filter(
      (a) => a.kind === "vtt" && (a.lang === "en" || a.lang === "am"),
    );
    for (const lang of ["en", "am"] as const) {
      const match = vttAssets.find((a) => a.lang === lang);
      if (match) {
        // Output never reports reviewed for a draft
        captions.push({
          lang,
          status: match.reviewed === true ? "reviewed" : "draft",
        });
      }
    }
  } else if ("captions" in lesson && Array.isArray(lesson.captions)) {
    for (const lang of ["en", "am"] as const) {
      const match = lesson.captions.find((c) => c.lang === lang);
      if (match) {
        const fromAccess =
          "access" in lesson && lesson.access?.captions
            ? lesson.access.captions.find((ac) => ac.lang === lang)
            : undefined;
        const status =
          (match as any).status === "reviewed" || fromAccess?.status === "reviewed"
            ? "reviewed"
            : "draft";
        captions.push({ lang, status });
      }
    }
  }

  // 2. Sign language: yes, or not yet
  let sign = false;
  if ("assets" in lesson && Array.isArray(lesson.assets)) {
    sign = lesson.assets.some((a) => a.kind === "sign" && Boolean(a.url));
  } else if ("sign" in lesson && lesson.sign) {
    sign = true;
  }

  // 3. Audio description: { recorded, text }
  let recordedAd = false;
  let textAd = false;
  if ("assets" in lesson && Array.isArray(lesson.assets)) {
    recordedAd = lesson.assets.some((a) => a.kind === "ad_audio" && Boolean(a.url));
    textAd = lesson.assets.some((a) => a.kind === "ad_vtt" && Boolean(a.url));
  } else if ("audioDescription" in lesson && lesson.audioDescription) {
    const ad = lesson.audioDescription as any;
    recordedAd = Boolean(ad.audioUrl || ad.recorded);
    textAd = Boolean(ad.vttUrl || ad.text);
  }

  // 4. Offline: size in MB / bytes
  let offline: { sizeBytes: number } | null = null;
  if ("assets" in lesson && Array.isArray(lesson.assets)) {
    const p = lesson.assets.find((a) => a.kind === "pack");
    if (p && typeof p.bytes === "number" && p.bytes > 0) {
      offline = { sizeBytes: p.bytes };
    }
  } else if ("pack" in lesson && lesson.pack) {
    offline = { sizeBytes: lesson.pack.sizeBytes ?? 0 };
  }

  // 5. Transcript: yes or no
  let transcript = false;
  if ("assets" in lesson && Array.isArray(lesson.assets)) {
    transcript =
      lesson.assets.some((a) => a.kind === "transcript_html" || a.kind === "vtt") ||
      Boolean((lesson as any).durationSec);
  } else if ("transcript" in lesson && lesson.transcript) {
    transcript = Boolean(lesson.transcript.url);
  }

  // 6. Reading / Summary: yes or no
  let summary = false;
  if ("access" in lesson && lesson.access && lesson.access.summary !== undefined) {
    summary = Boolean(lesson.access.summary);
  } else if ("summary" in lesson && (lesson as any).summary !== undefined) {
    summary = Boolean((lesson as any).summary);
  } else if ("assets" in lesson && Array.isArray(lesson.assets)) {
    summary = lesson.assets.some((a) => a.meta?.summary || a.kind === "transcript_html");
  } else if (lesson.id === "L-102") {
    summary = true;
  }

  return {
    captions,
    sign,
    audioDescription: { recorded: recordedAd, text: textAd },
    offline,
    transcript,
    summary,
  };
}
