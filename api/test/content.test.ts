import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";
import { FIXTURES_DIR } from "../src/db/seedData";
import { fromManifest, toManifest } from "../src/lib/manifest";
import { LessonManifestSchema, TranscriptSchema } from "../src/schemas/lesson";

const KEY = { "X-Savanna-Key": "pk_dev_local" };
const ADMIN_KEY = { "X-Savanna-Key": "sk_dev_local_change_me_please" };
const USER_A = { "X-Savanna-User": "user-token-aaaaaaaaaaaa" };
const USER_B = { "X-Savanna-User": "user-token-bbbbbbbbbbbb" };
const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8"));
const app = async () => createApp({ config: loadConfig({}) });

beforeAll(() => {
  const packZipPath = path.join(FIXTURES_DIR, "L-102/pack.zip");
  if (!fs.existsSync(packZipPath)) {
    // Valid minimal ZIP archive containing manifest.json
    const minimalZip = Buffer.from(
      "504b03040a0000000000000021000000000000000000000000000d0000006d616e69666573742e6a736f6e7b226964223a224c2d313032227d504b010214030a0000000000000021000000000000000000000000000d00000000000000000000008001000000006d616e69666573742e6a736f6e504b050600000000010001003b0000002b0000000000",
      "hex"
    );
    fs.writeFileSync(packZipPath, minimalZip);
  }
});

describe("contract C1: fixtures and API agree", () => {
  for (const id of ["L-102", "L-103"]) {
    it(`fixture ${id} satisfies the manifest schema`, () => {
      expect(LessonManifestSchema.safeParse(readJson(`${id}.json`)).success).toBe(true);
    });
    it(`fixture ${id} round-trips through the data model unchanged`, () => {
      const fixture = LessonManifestSchema.parse(readJson(`${id}.json`));
      expect(toManifest(fromManifest(fixture))).toEqual(fixture);
    });
    it(`GET /v1/lessons/${id} returns exactly the fixture`, async () => {
      const res = await request(await app()).get(`/v1/lessons/${id}`).set(KEY);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(readJson(`${id}.json`));
    });
  }
  it("transcript fixtures satisfy the transcript schema", () => {
    expect(TranscriptSchema.safeParse(readJson("L-102/transcript.json")).success).toBe(true);
  });
});

describe("lessons routes", () => {
  it("lists lessons", async () => {
    const res = await request(await app()).get("/v1/lessons").set(KEY);
    expect(res.status).toBe(200);
    expect(res.body.lessons.map((l: { id: string }) => l.id)).toEqual(["L-102", "L-103"]);
  });
  it("404s an unknown lesson as problem+json", async () => {
    const res = await request(await app()).get("/v1/lessons/L-999").set(KEY);
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toContain("application/problem+json");
  });
  it("needs an API key", async () => {
    expect((await request(await app()).get("/v1/lessons")).status).toBe(401);
  });
  it("redirects to the caption file", async () => {
    const res = await request(await app()).get("/v1/lessons/L-102/captions/am.vtt").set(KEY).redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:4010/media/am.vtt");
  });
  it("404s unsupported caption names", async () => {
    const a = await app();
    expect((await request(a).get("/v1/lessons/L-102/captions/fr.vtt").set(KEY)).status).toBe(404);
    expect((await request(a).get("/v1/lessons/L-999/captions/en.vtt").set(KEY)).status).toBe(404);
  });
  it("serves the transcript (English by default)", async () => {
    const res = await request(await app()).get("/v1/lessons/L-102/transcript").set(KEY);
    expect(res.status).toBe(200);
    expect(res.body.lang).toBe("en");
    expect(res.body.lines.length).toBeGreaterThan(0);
  });
  it("404s a missing transcript language and 400s a bad one", async () => {
    const a = await app();
    expect((await request(a).get("/v1/lessons/L-102/transcript?lang=am").set(KEY)).status).toBe(404);
    expect((await request(a).get("/v1/lessons/L-102/transcript?lang=xx").set(KEY)).status).toBe(400);
  });
});

describe("preferences routes", () => {
  it("needs a user token", async () => {
    const a = await app();
    expect((await request(a).get("/v1/preferences").set(KEY)).status).toBe(400);
    expect((await request(a).get("/v1/preferences").set(KEY).set("X-Savanna-User", "short")).status).toBe(400);
  });
  it("returns {} before anything is saved", async () => {
    const res = await request(await app()).get("/v1/preferences").set(KEY).set(USER_A);
    expect(res.body).toEqual({});
  });
  it("saves and reads back, per user", async () => {
    const a = await app();
    const prefs = { captions: { size: 150, color: "yellow" }, sign: { corner: "top-right" } };
    expect((await request(a).put("/v1/preferences").set(KEY).set(USER_A).send(prefs)).status).toBe(200);
    expect((await request(a).get("/v1/preferences").set(KEY).set(USER_A)).body).toEqual(prefs);
    expect((await request(a).get("/v1/preferences").set(KEY).set(USER_B)).body).toEqual({});
  });
  it("rejects unknown namespaces and oversized data", async () => {
    const a = await app();
    expect((await request(a).put("/v1/preferences").set(KEY).set(USER_A).send({ hacker: {} })).status).toBe(400);
    const big = { ui: { blob: "x".repeat(25_000) } };
    expect((await request(a).put("/v1/preferences").set(KEY).set(USER_A).send(big)).status).toBe(400);
  });
  it("allows the user header in CORS preflight", async () => {
    const res = await request(await app()).options("/v1/preferences").set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PUT").set("Access-Control-Request-Headers", "x-savanna-key,x-savanna-user");
    expect(res.headers["access-control-allow-headers"]).toContain("X-Savanna-User");
  });
  it("exports stored preferences (FR-A4 / NFR-S3)", async () => {
    const a = await app();
    const prefs = { captions: { size: 150, color: "yellow" } };
    await request(a).put("/v1/preferences").set(KEY).set(USER_A).send(prefs);
    const res = await request(a).get("/v1/preferences/export").set(KEY).set(USER_A);
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toContain("savanna-preferences.json");
    expect(res.body.preferences).toEqual(prefs);
  });
  it("deletes stored preferences (FR-A4 / NFR-S3)", async () => {
    const a = await app();
    const prefs = { ui: { lang: "am" } };
    await request(a).put("/v1/preferences").set(KEY).set(USER_A).send(prefs);
    expect((await request(a).delete("/v1/preferences").set(KEY).set(USER_A)).status).toBe(200);
    expect((await request(a).get("/v1/preferences").set(KEY).set(USER_A)).body).toEqual({});
  });
});

describe("FR-N3 API path aliases", () => {
  it("serves GET /api/v1/lessons/:id identical to /v1/lessons/:id", async () => {
    const a = await app();
    const v1 = await request(a).get("/v1/lessons/L-102").set(KEY);
    const apiV1 = await request(a).get("/api/v1/lessons/L-102").set(KEY);
    expect(apiV1.status).toBe(200);
    expect(apiV1.body).toEqual(v1.body);
  });
  it("serves GET /api/v1/lessons/:id/transcript", async () => {
    const a = await app();
    const res = await request(a).get("/api/v1/lessons/L-102/transcript?lang=en").set(KEY);
    expect(res.status).toBe(200);
    expect(res.body.lines.length).toBeGreaterThan(0);
  });
  it("serves GET /api/v1/lessons/:id/offline-pack as alias for pack.zip", async () => {
    const a = await app();
    const resZip = await request(a).get("/v1/lessons/L-102/pack.zip").set(KEY);
    const resAlias = await request(a).get("/api/v1/lessons/L-102/offline-pack").set(KEY);
    expect(resZip.status).toBe(200);
    expect(resAlias.status).toBe(200);
    expect(resAlias.headers["content-type"]).toBe("application/zip");
  });
});

describe("FR-A2 caption upload and review gate", () => {
  const validVtt = `WEBVTT - Reviewed Amharic Captions

1
00:00:01.000 --> 00:00:03.500
እንኳን ወደዚህ ትምህርት
በደህና መጡ።

2
00:00:04.000 --> 00:00:07.500
ይህ የተደራሽነት ትምህርት ነው።
`;

  it("requires secret/admin key to upload captions", async () => {
    const a = await app();
    const res = await request(a)
      .post("/v1/lessons/L-102/captions")
      .set(KEY)
      .send({ lang: "am", vtt: validVtt });
    expect(res.status).toBe(403);
  });

  it("accepts valid WebVTT and sets reviewed=true", async () => {
    const a = await app();
    const res = await request(a)
      .post("/v1/lessons/L-102/captions")
      .set(ADMIN_KEY)
      .send({ lang: "am", vtt: validVtt });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      lessonId: "L-102",
      lang: "am",
      reviewed: true,
      cueCount: 2,
      url: "/v1/lessons/L-102/captions/am.vtt",
    });

    // Check it can be read back
    const getRes = await request(a).get("/v1/lessons/L-102/captions/am.vtt").set(KEY);
    expect(getRes.status).toBe(200);
    expect(getRes.text).toContain("እንኳን ወደዚህ ትምህርት");
  });

  it("works via /api/v1 alias route", async () => {
    const a = await app();
    const res = await request(a)
      .post("/api/v1/lessons/L-102/captions")
      .set(ADMIN_KEY)
      .send({ lang: "am", vtt: validVtt });
    expect(res.status).toBe(200);
    expect(res.body.reviewed).toBe(true);
  });

  it("rejects invalid WebVTT with cue number in problem+json (too long duration > 7s)", async () => {
    const a = await app();
    const invalidVtt = `WEBVTT

1
00:00:01.000 --> 00:00:10.000
This cue runs for 9 seconds.
`;
    const res = await request(a)
      .post("/v1/lessons/L-102/captions")
      .set(ADMIN_KEY)
      .send({ lang: "en", vtt: invalidVtt });
    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toContain("application/problem+json");
    expect(res.body.cueIndex).toBe(1);
    expect(res.body.detail).toContain("Cue 1");
  });

  it("rejects cues with more than 2 lines", async () => {
    const a = await app();
    const invalidVtt = `WEBVTT

1
00:00:01.000 --> 00:00:03.000
Line one
Line two
Line three
`;
    const res = await request(a)
      .post("/v1/lessons/L-102/captions")
      .set(ADMIN_KEY)
      .send({ lang: "en", vtt: invalidVtt });
    expect(res.status).toBe(400);
    expect(res.body.cueIndex).toBe(1);
    expect(res.body.detail).toContain("maximum allowed is 2 lines");
  });
});
