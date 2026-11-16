// Offline lesson packs (task 2.7)
// GET /v1/lessons/:id/pack        -> manifest JSON
// GET /v1/lessons/:id/pack.zip    -> streaming download with byte-range support
//
// Mounted under /v1 by app.ts with API-key authentication.
// Routes use relative paths (no /v1 prefix here).

import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response, Router } from "express";
import { z } from "zod";
import type { Ctx } from "../lib/context";
import type { OperationDoc } from "../lib/openapi";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Default pack storage falls back to the C8 fixture directory so the route
 * works in tests and in the development sandbox without any extra configuration.
 * A real deployment can override it by passing `packRoot` via AppOptions.ctx.
 */
const FIXTURE_PACK_ROOT = path.resolve(here, "../../../contracts/fixtures/v1/lessons");

const IdParam = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/).describe("Lesson id, e.g. L-102"),
});

const PackManifestSchema = z.looseObject({
  id: z.string(),
  version: z.number(),
  sizeBytes: z.number(),
});

function problem(res: Response, status: number, title: string, detail: string) {
  return res
    .status(status)
    .type("application/problem+json")
    .json({ type: "about:blank", title, status, detail });
}

async function safeFileAt(root: string, id: string, name: string): Promise<string> {
  const dir = path.resolve(root, id);
  const file = path.resolve(dir, name);
  // Guard against path-traversal
  if (!file.startsWith(`${dir}${path.sep}`)) throw new Error("Invalid pack path");
  await fs.access(file);
  return file;
}

/**
 * Try manifest.json first (produced by build-pack.mjs), then pack.json (C8 fixture name).
 * This keeps the route working with both production packs and development fixtures.
 */
async function manifestFile(root: string, id: string): Promise<string> {
  for (const name of ["manifest.json", "pack.json"]) {
    try {
      return await safeFileAt(root, id, name);
    } catch {
      // try the next name
    }
  }
  throw new Error("Pack manifest not found");
}

/** C7 route module. Registering pack routes must never throw during app startup. */
export function register(router: Router, ctx: Ctx & { packRoot?: string }) {
  // packRoot is optional; production passes it via AppOptions.ctx; dev/test falls back to fixtures.
  const root: string = ctx.packRoot ?? FIXTURE_PACK_ROOT;

  router.get("/lessons/:id/pack", async (req: Request, res: Response) => {
    const parsed = IdParam.safeParse(req.params);
    if (!parsed.success)
      return problem(res, 400, "Invalid lesson id", "Lesson ids must be alphanumeric (A–Z, 0–9, dash, underscore, 1–80 chars).");
    try {
      const file = await manifestFile(root, parsed.data.id);
      return res.json(JSON.parse(await fs.readFile(file, "utf8")));
    } catch {
      return problem(res, 404, "Pack not found", "No offline pack is published for this lesson.");
    }
  });

  router.get(["/lessons/:id/pack.zip", "/lessons/:id/offline-pack"], async (req: Request, res: Response) => {
    const parsed = IdParam.safeParse(req.params);
    if (!parsed.success)
      return problem(res, 400, "Invalid lesson id", "Lesson ids must be alphanumeric (A–Z, 0–9, dash, underscore, 1–80 chars).");
    try {
      const file = await safeFileAt(root, parsed.data.id, "pack.zip");
      const stat = await fs.stat(file);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${parsed.data.id}-pack.zip"`);

      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
        if (!match) return problem(res, 416, "Invalid range", "Range header must be bytes=start-end.");
        const start = match[1] ? Number(match[1]) : 0;
        const reqEnd = match[2] ? Number(match[2]) : stat.size - 1;
        if (start >= stat.size || reqEnd < start)
          return problem(res, 416, "Range not satisfiable", "Requested range is outside the file.");
        const end = Math.min(reqEnd, stat.size - 1);
        res
          .status(206)
          .setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`)
          .setHeader("Content-Length", String(end - start + 1));
        return createReadStream(file, { start, end }).pipe(res);
      }

      res.setHeader("Content-Length", String(stat.size));
      return createReadStream(file).pipe(res);
    } catch {
      return problem(res, 404, "Pack not found", "Offline ZIP is not available for this lesson.");
    }
  });
}

export const openapi: OperationDoc[] = [
  {
    method: "get",
    path: "/lessons/{id}/pack",
    summary: "Get an offline lesson pack manifest",
    tags: ["Offline"],
    params: IdParam,
    responses: {
      200: {
        description: "Pack manifest with the list of included files and their SHA-256 checksums.",
        schema: PackManifestSchema,
      },
      404: { description: "No pack is published for this lesson." },
    },
  },
  {
    method: "get",
    path: "/lessons/{id}/pack.zip",
    summary: "Download an offline lesson pack",
    tags: ["Offline"],
    params: IdParam,
    responses: {
      200: {
        description: "The complete offline lesson ZIP.",
        contentType: "application/zip",
        headers: {
          "Content-Disposition": "Attachment filename",
          "Accept-Ranges": "Indicates byte-range support",
        },
      },
      206: {
        description: "Partial ZIP content (byte-range response).",
        contentType: "application/zip",
        headers: { "Content-Range": "Returned byte range" },
      },
      404: { description: "No pack ZIP is available for this lesson." },
    },
  },
];
