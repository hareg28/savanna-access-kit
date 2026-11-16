// GET /v1/lessons, /v1/lessons/:id (contract C1), /v1/lessons/:id/captions/:lang.vtt, /v1/lessons/:id/transcript?lang=
// POST /v1/lessons/:id/captions (FR-A2 caption upload and correction with review validation)
import type { Router } from "express";
import { HttpError } from "../lib/errors";
import type { Ctx } from "../lib/context";
import { toManifest } from "../lib/manifest";
import { z } from "zod";
import type { OperationDoc } from "../lib/openapi";
import { LangQuery, LessonListSchema, LessonManifestSchema, TranscriptSchema } from "../schemas/lesson";
import { requireScope } from "../middleware/auth";
import { validateWebVTT } from "../lib/captionValidation";

export function register(router: Router, ctx: Ctx) {
  router.get("/lessons", async (_req, res) => {
    const lessons = await ctx.store.listLessons();
    res.json({ lessons: lessons.map((l) => ({ id: l.id, title: l.title, durationSec: l.durationSec })) });
  });

  router.get("/lessons/:id", async (req, res) => {
    const lesson = await ctx.store.getLesson(req.params.id);
    if (!lesson) throw new HttpError(404, "Not Found", `No lesson "${req.params.id}".`);
    res.json(toManifest(lesson));
  });

  // Captions live in object storage or memory store; we hand back the file location.
  router.get("/lessons/:id/captions/:file", async (req, res) => {
    const m = /^(en|am)\.vtt$/.exec(req.params.file);
    if (!m) throw new HttpError(404, "Not Found", "Captions are available as en.vtt or am.vtt.");
    const lang = m[1] as "en" | "am";
    if (ctx.store.getCaption) {
      const stored = await ctx.store.getCaption(req.params.id, lang);
      if (stored) {
        res.setHeader("Content-Type", "text/vtt; charset=utf-8");
        return void res.send(stored);
      }
    }
    const lesson = await ctx.store.getLesson(req.params.id);
    const cap = lesson && toManifest(lesson).captions.find((c) => c.lang === lang);
    if (!cap) throw new HttpError(404, "Not Found", `No ${lang} captions for lesson "${req.params.id}".`);
    res.redirect(302, cap.url);
  });

  router.get("/lessons/:id/transcript", async (req, res) => {
    const { lang } = LangQuery.parse(req.query);
    const t = await ctx.store.getTranscript(req.params.id, lang);
    if (!t) throw new HttpError(404, "Not Found", `No ${lang} transcript for lesson "${req.params.id}".`);
    res.json(t);
  });

  // POST /v1/lessons/:id/captions (FR-A2 caption upload and review gate)
  router.post("/lessons/:id/captions", requireScope("admin"), async (req, res) => {
    const id = String(req.params.id);
    const lesson = await ctx.store.getLesson(id);
    if (!lesson) throw new HttpError(404, "Not Found", `No lesson "${id}".`);

    let lang: "en" | "am" = "en";
    let vttText = "";

    if (typeof req.body === "string") {
      vttText = req.body;
      const qLang = req.query.lang;
      if (qLang === "am" || qLang === "en") lang = qLang;
    } else if (req.body && typeof req.body === "object") {
      const body = req.body as { lang?: string; vtt?: string };
      if (body.lang === "am" || body.lang === "en") lang = body.lang;
      else if (req.query.lang === "am" || req.query.lang === "en") lang = req.query.lang;
      vttText = typeof body.vtt === "string" ? body.vtt : "";
    }

    if (!vttText || typeof vttText !== "string") {
      return res.status(400).type("application/problem+json").json({
        type: "about:blank",
        title: "Missing Caption Content",
        status: 400,
        detail: "Provide WebVTT content in request body as text or { lang, vtt } JSON.",
      });
    }

    const validation = validateWebVTT(vttText);
    if (!validation.valid) {
      const firstError = validation.errors[0] ?? { message: "Caption validation failed", cueIndex: null, code: "validation-error" };
      return res.status(400).type("application/problem+json").json({
        type: "about:blank",
        title: "Caption Validation Failed",
        status: 400,
        detail: firstError.message,
        cueIndex: firstError.cueIndex,
        code: firstError.code,
        errors: validation.errors,
      });
    }

    const saved = await ctx.store.saveCaption(id, lang, vttText, true);
    res.status(200).json({
      status: "ok",
      lessonId: id,
      lang,
      reviewed: true,
      cueCount: validation.cues.length,
      url: saved.url,
    });
  });
}

const IdParam = z.object({ id: z.string().describe("Lesson id, e.g. L-102") });

export const openapi: OperationDoc[] = [
  {
    method: "get", path: "/lessons", summary: "List lessons", tags: ["Lessons"],
    responses: { 200: { description: "Published lessons.", schema: LessonListSchema } },
  },
  {
    method: "get", path: "/lessons/{id}", summary: "Get a lesson manifest", tags: ["Lessons"],
    description: "Everything a player needs: media, English and Amharic captions, sign video, audio description, transcript and offline pack. Fields that do not exist for a lesson are null. Alias: /api/v1/lessons/{id}",
    params: IdParam,
    responses: { 200: { description: "The lesson manifest (contract C1).", schema: LessonManifestSchema }, 404: { description: "Unknown lesson." } },
  },
  {
    method: "get", path: "/lessons/{id}/captions/{file}", summary: "Get a caption file", tags: ["Lessons"],
    description: "Redirects to or serves the WebVTT file for the requested language.",
    params: IdParam.extend({ file: z.enum(["en.vtt", "am.vtt"]) }),
    responses: { 302: { description: "Redirect to the caption file.", headers: { Location: "URL of the WebVTT file" } }, 404: { description: "No captions in that language." } },
  },
  {
    method: "get", path: "/lessons/{id}/transcript", summary: "Get a lesson transcript", tags: ["Lessons"],
    description: "Timed transcript lines. Alias: /api/v1/lessons/{id}/transcript",
    params: IdParam, query: LangQuery,
    responses: { 200: { description: "Timed transcript lines.", schema: TranscriptSchema }, 404: { description: "No transcript in that language." } },
  },
  {
    method: "post", path: "/lessons/{id}/captions", summary: "Upload and review corrected captions", tags: ["Lessons"],
    access: "admin",
    description: "Accepts and validates a WebVTT file for one language (2 lines max, ~32 chars/line, 1-7s duration, valid timestamps). Sets reviewed=true on success. Alias: /api/v1/lessons/{id}/captions",
    params: IdParam,
    body: z.object({ lang: z.enum(["en", "am"]), vtt: z.string().describe("WebVTT caption content") }),
    responses: {
      200: {
        description: "Caption accepted and approved.",
        schema: z.object({
          status: z.literal("ok"),
          lessonId: z.string(),
          lang: z.enum(["en", "am"]),
          reviewed: z.literal(true),
          cueCount: z.number(),
          url: z.string(),
        }),
      },
      400: { description: "Validation error with cue number and message (RFC 9457)." },
      403: { description: "Requires secret key." },
      404: { description: "Unknown lesson." },
    },
  },
];
