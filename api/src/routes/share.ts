import type { Router } from "express";
import { HttpError } from "../lib/errors";
import type { Ctx } from "../lib/context";
import { getOrBuildShareFile } from "../services/shareFile";
import type { OperationDoc } from "../lib/openapi";
import { z } from "zod";

export function register(router: Router, ctx: Ctx) {
  router.get("/lessons/:id/share.html", async (req, res) => {
    const lesson = await ctx.store.getLesson(req.params.id);
    if (!lesson) {
      throw new HttpError(404, "Not Found", `No lesson "${req.params.id}".`);
    }

    const hasAudio = lesson.assets.some((a) => a.kind === "audio");
    if (!hasAudio) {
      return res.status(400).type("application/problem+json").json({
        type: "about:blank",
        title: "No Audio Available",
        status: 400,
        detail: `Lesson "${req.params.id}" has no audio. A standalone lesson file requires audio.`,
      });
    }

    try {
      const { html, checksum } = await getOrBuildShareFile(lesson);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="lesson-${req.params.id}.html"`);
      res.setHeader("ETag", `"${checksum}"`);
      res.send(html);
    } catch (err) {
      return res.status(400).type("application/problem+json").json({
        type: "about:blank",
        title: "Share File Error",
        status: 400,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

const IdParam = z.object({ id: z.string().describe("Lesson id, e.g. L-102") });

export const openapi: OperationDoc[] = [
  {
    method: "get",
    path: "/lessons/{id}/share.html",
    summary: "Download standalone lesson in a file (Feature C)",
    tags: ["Lessons"],
    description:
      "Returns a single offline self-contained HTML file containing embedded Opus audio, dual-language captions, interactive transcript, and summary. No internet required once downloaded.",
    params: IdParam,
    responses: {
      200: {
        description: "Standalone lesson HTML file.",
        headers: {
          "Content-Disposition": 'Attachment header e.g. attachment; filename="lesson-L-102.html"',
          ETag: "SHA-256 checksum ETag of content",
        },
      },
      400: { description: "Lesson has no audio available." },
      404: { description: "Unknown lesson." },
    },
  },
];
