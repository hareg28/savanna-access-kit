import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";
import { buildShareHtml, parseVttToCues, computeFileChecksum } from "../../pipeline/src/pack/shareFile";
import type { LessonRecord } from "../src/db/store";

const KEY = { "X-Savanna-Key": "pk_dev_local" };
const makeApp = (opts = {}) => createApp({ config: loadConfig({}), ...opts });

describe("Feature C: Lesson in a File (Unit & Route tests)", () => {
  it("builder generates valid HTML with required sections and safe escaping", () => {
    const html = buildShareHtml({
      id: "L-TEST",
      title: { en: "Test <script>alert(1)</script>", am: "ሙከራ" },
      durationSec: 10,
      audioBase64: Buffer.from("dummy-audio").toString("base64"),
      summary: { en: "Test summary & details", am: "የሙከራ ማጠቃለያ" },
      captions: {
        en: [{ start: 0, end: 5, text: "Line 1 <img src=x onerror=alert(1)>" }],
        am: [{ start: 0, end: 5, text: "መስመር 1" }],
      },
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('<audio id="lesson-audio"');
    expect(html).toContain("Interactive Transcript");
    expect(html).toContain("You can send this file to a friend. It works without internet.");
    // Verify script tags in title/captions are safely escaped
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    // Verify size budget: small sample lesson is way under 50KB without heavy media
    expect(Buffer.byteLength(html, "utf8")).toBeLessThan(50 * 1024);
  });

  it("parseVttToCues parses standard WebVTT accurately", () => {
    const vtt = `WEBVTT\n\n00:00.000 --> 00:04.000\nHello world\n\n00:04.000 --> 00:08.500\nSecond line`;
    const cues = parseVttToCues(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0]?.text).toBe("Hello world");
    expect(cues[0]?.start).toBe(0);
    expect(cues[0]?.end).toBe(4);
    expect(cues[1]?.end).toBe(8.5);
  });

  it("serves GET /v1/lessons/L-102/share.html with attachment header and ETag", async () => {
    const app = await makeApp();
    const res = await request(app).get("/v1/lessons/L-102/share.html").set(KEY);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.headers["content-disposition"]).toBe('attachment; filename="lesson-L-102.html"');
    expect(res.headers["etag"]).toBeDefined();
    expect(res.text).toContain("Introduction to databases");
    expect(res.text).toContain("Interactive Transcript");
  });

  it("serves GET /api/v1/lessons/L-102/share.html alias", async () => {
    const app = await makeApp();
    const res = await request(app).get("/api/v1/lessons/L-102/share.html").set(KEY);
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toBe('attachment; filename="lesson-L-102.html"');
  });

  it("404s unknown lesson", async () => {
    const app = await makeApp();
    const res = await request(app).get("/v1/lessons/L-UNKNOWN/share.html").set(KEY);
    expect(res.status).toBe(404);
  });

  it("returns problem+json with plain-language message if lesson has no audio", async () => {
    const mockStore = {
      listLessons: async () => [],
      getLesson: async (id: string): Promise<LessonRecord | null> => {
        if (id === "L-NOAUDIO") {
          return {
            id: "L-NOAUDIO",
            title: { en: "No Audio", am: "ድምጽ የለም" },
            durationSec: 10,
            assets: [{ kind: "video", lang: null, url: "http://example.com/v.mp4", bytes: 10, checksum: "", reviewed: true, meta: null }],
          };
        }
        return null;
      },
      getTranscript: async () => null,
      getPreferences: async () => null,
      setPreferences: async () => {},
      deletePreferences: async () => {},
      saveCaption: async () => ({ url: "", reviewed: true }),
    };

    const app = await makeApp({ ctx: { store: mockStore as any } });
    const res = await request(app).get("/v1/lessons/L-NOAUDIO/share.html").set(KEY);
    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toContain("application/problem+json");
    expect(res.body.detail).toContain("no audio");
  });
});
