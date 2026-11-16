import { z } from "zod";

const url = z.string().url();
export const Lang = z.enum(["en", "am"]);
export type Lang = z.infer<typeof Lang>;

export const CaptionStatus = z.enum(["reviewed", "draft"]);
export type CaptionStatus = z.infer<typeof CaptionStatus>;

export const AccessSummarySchema = z.object({
  captions: z.array(
    z.object({
      lang: Lang,
      status: CaptionStatus,
    }),
  ),
  sign: z.boolean(),
  audioDescription: z.object({
    recorded: z.boolean(),
    text: z.boolean(),
  }),
  offline: z.object({
    sizeBytes: z.number().int().nonnegative(),
  }).nullable(),
  transcript: z.boolean(),
  summary: z.boolean(),
});
export type AccessSummary = z.infer<typeof AccessSummarySchema>;

export const ShareInfoSchema = z.object({
  url: z.string(),
  sizeBytes: z.number().int().nonnegative(),
});
export type ShareInfo = z.infer<typeof ShareInfoSchema>;

/** Contract C1. The API output AND contracts/fixtures/v1/lessons/*.json must both satisfy this. */
export const LessonManifestSchema = z.object({
  id: z.string().min(1),
  title: z.object({ en: z.string(), am: z.string() }),
  durationSec: z.number().int().nonnegative(),
  media: z.object({ video: url, audio: url }),
  captions: z.array(z.object({ lang: Lang, url })),
  sign: z.object({ url, offsetMs: z.number().int() }).nullable(),
  audioDescription: z.object({ audioUrl: url, vttUrl: url, extended: z.boolean() }).nullable(),
  transcript: z.object({ url: z.string().startsWith("/v1/") }),
  pack: z.object({ manifestUrl: z.string().startsWith("/v1/"), sizeBytes: z.number().int().nonnegative() }).nullable(),
  access: AccessSummarySchema.optional().nullable(),
  share: ShareInfoSchema.optional().nullable(),
});
export type LessonManifest = z.infer<typeof LessonManifestSchema>;

export const TranscriptSchema = z.object({
  id: z.string(),
  lang: Lang,
  lines: z.array(z.object({ start: z.number().nonnegative(), end: z.number().nonnegative(), text: z.string() })),
});
export type Transcript = z.infer<typeof TranscriptSchema>;

export const LangQuery = z.object({ lang: Lang.default("en") });

export const LessonListSchema = z.object({
  lessons: z.array(z.object({ id: z.string(), title: z.object({ en: z.string(), am: z.string() }), durationSec: z.number().int() })),
});
