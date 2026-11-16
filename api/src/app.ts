import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";
import { loadConfig } from "./config";
import { createStore } from "./db/createStore";
import type { AppConfig, Ctx } from "./lib/context";
import { CAREER_HARNESS_FILES, loadRouteModules } from "./lib/loadRoutes";
import { buildOpenApi } from "./lib/openapi";
import { authenticate, originAllowed } from "./middleware/auth";
import { errorHandler, notFound } from "./middleware/errors";
import { limiter } from "./middleware/rateLimit";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface AppOptions {
  config?: AppConfig;
  /** Folder to load route modules from. Defaults to src/routes. */
  routesDir?: string;
  /** Extra context (for example a PrismaClient once task 4.3 lands). */
  ctx?: Partial<Ctx>;
}

export async function createApp(opts: AppOptions = {}) {
  const config = opts.config ?? loadConfig();
  const created = opts.ctx?.store ? undefined : await createStore(config);
  const ctx: Ctx = { prisma: created?.prisma, store: (opts.ctx?.store ?? created?.store)!, config, ...opts.ctx };

  const app = express();
  app.disable("x-powered-by");
  if (config.production) app.set("trust proxy", 1);

  const allOrigins = config.partners.flatMap((p) => p.origins);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || originAllowed(origin, allOrigins, config.production)),
      allowedHeaders: ["Content-Type", "X-Savanna-Key", "X-Savanna-User"],
      maxAge: 600,
    }),
  );
  app.use(limiter(config));
  app.use(express.json({ limit: "100kb" }));

  const modules = await loadRouteModules(opts.routesDir ?? path.join(here, "routes"), {
    excludeFiles: CAREER_HARNESS_FILES,
  });

  // OpenAPI 3.1 spec (assembled from every route file) and Swagger UI. Both are public.
  const spec = buildOpenApi(modules);
  app.locals.openapi = spec;
  app.get(["/v1/openapi.json", "/api/v1/openapi.json"], (_req, res) => void res.json(spec));
  const swaggerDist = createRequire(import.meta.url)("swagger-ui-dist").getAbsoluteFSPath() as string;
  app.use("/docs/assets", express.static(swaggerDist, { index: false }));
  app.get("/docs/init.js", (_req, res) =>
    void res.type("application/javascript").send('window.ui = SwaggerUIBundle({ url: "/v1/openapi.json", dom_id: "#swagger-ui", persistAuthorization: true });'),
  );
  app.get("/docs", (_req, res) =>
    void res.type("html").send(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        "<title>Savanna Access Kit API</title>" +
        '<link rel="stylesheet" href="/docs/assets/swagger-ui.css"></head><body><div id="swagger-ui"></div>' +
        '<script src="/docs/assets/swagger-ui-bundle.js"></script><script src="/docs/init.js"></script></body></html>',
    ),
  );

  // Public modules first (full paths, no auth), then key-protected modules under /v1 and /api/v1 (FR-N3).
  for (const { mod } of modules.filter((m) => m.mod.access === "public")) {
    const router = Router();
    mod.register(router, ctx);
    app.use(router);
  }
  const v1 = Router();
  for (const { mod } of modules.filter((m) => m.mod.access !== "public")) {
    mod.register(v1, ctx);
  }
  app.use("/v1", authenticate(config), v1);
  app.use("/api/v1", authenticate(config), v1);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
