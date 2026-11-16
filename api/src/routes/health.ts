// Public route: mounted at the root with full paths, no API key needed.
import type { Router } from "express";
import { z } from "zod";
import type { Ctx } from "../lib/context";
import type { OperationDoc } from "../lib/openapi";

export const access = "public" as const;

export function register(router: Router, _ctx: Ctx) {
  router.get(["/v1/health", "/api/v1/health", "/health"], (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });
}

export const openapi: OperationDoc[] = [
  {
    method: "get", path: "/v1/health", summary: "Health check", tags: ["Ops"],
    responses: { 200: { description: "The API is up.", schema: z.object({ status: z.literal("ok"), time: z.string() }) } },
  },
];
