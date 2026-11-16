import { describe, expect, it } from "vitest";
import { accessSummary } from "../src/services/accessSummary";
import type { LessonRecord } from "../src/db/store";

describe("accessSummary unit tests (Spec 3.5)", () => {
  it("all assets present", () => {
    const lesson: LessonRecord = {
      id: "L-ALL",
      title: { en: "All Assets", am: "ሁሉም ንብረቶች" },
      durationSec: 120,
      assets: [
        { kind: "video", lang: null, url: "http://example.com/v.mp4", bytes: 1000, checksum: "c1", reviewed: true, meta: null },
        { kind: "audio", lang: null, url: "http://example.com/a.opus", bytes: 500, checksum: "c2", reviewed: true, meta: null },
        { kind: "vtt", lang: "en", url: "http://example.com/en.vtt", bytes: 100, checksum: "c3", reviewed: true, meta: null },
        { kind: "vtt", lang: "am", url: "http://example.com/am.vtt", bytes: 100, checksum: "c4", reviewed: true, meta: null },
        { kind: "sign", lang: null, url: "http://example.com/s.mp4", bytes: 800, checksum: "c5", reviewed: true, meta: null },
        { kind: "ad_audio", lang: null, url: "http://example.com/ad.opus", bytes: 400, checksum: "c6", reviewed: true, meta: null },
        { kind: "ad_vtt", lang: "en", url: "http://example.com/ad.vtt", bytes: 80, checksum: "c7", reviewed: true, meta: null },
        { kind: "pack", lang: null, url: "/v1/lessons/L-ALL/pack", bytes: 1800000, checksum: "c8", reviewed: true, meta: null },
        { kind: "transcript_html", lang: "en", url: "http://example.com/tr.html", bytes: 200, checksum: "c9", reviewed: true, meta: { summary: true } },
      ],
    };

    const summary = accessSummary(lesson);
    expect(summary.captions).toEqual([
      { lang: "en", status: "reviewed" },
      { lang: "am", status: "reviewed" },
    ]);
    expect(summary.sign).toBe(true);
    expect(summary.audioDescription).toEqual({ recorded: true, text: true });
    expect(summary.offline).toEqual({ sizeBytes: 1800000 });
    expect(summary.transcript).toBe(true);
    expect(summary.summary).toBe(true);
  });

  it("no sign", () => {
    const lesson: LessonRecord = {
      id: "L-NOSIGN",
      title: { en: "No Sign", am: "ምልክት የለም" },
      durationSec: 60,
      assets: [
        { kind: "video", lang: null, url: "http://example.com/v.mp4", bytes: 1000, checksum: "c1", reviewed: true, meta: null },
        { kind: "audio", lang: null, url: "http://example.com/a.opus", bytes: 500, checksum: "c2", reviewed: true, meta: null },
      ],
    };
    const summary = accessSummary(lesson);
    expect(summary.sign).toBe(false);
  });

  it("no audio description", () => {
    const lesson: LessonRecord = {
      id: "L-NOAD",
      title: { en: "No AD", am: "ማብራሪያ የለም" },
      durationSec: 60,
      assets: [
        { kind: "video", lang: null, url: "http://example.com/v.mp4", bytes: 1000, checksum: "c1", reviewed: true, meta: null },
      ],
    };
    const summary = accessSummary(lesson);
    expect(summary.audioDescription).toEqual({ recorded: false, text: false });
  });

  it("no pack", () => {
    const lesson: LessonRecord = {
      id: "L-NOPACK",
      title: { en: "No Pack", am: "ጥቅል የለም" },
      durationSec: 60,
      assets: [],
    };
    const summary = accessSummary(lesson);
    expect(summary.offline).toBeNull();
  });

  it("unreviewed Amharic", () => {
    const lesson: LessonRecord = {
      id: "L-UNREV",
      title: { en: "Draft Amharic", am: "ረቂቅ አማርኛ" },
      durationSec: 60,
      assets: [
        { kind: "vtt", lang: "en", url: "http://example.com/en.vtt", bytes: 100, checksum: "c3", reviewed: true, meta: null },
        { kind: "vtt", lang: "am", url: "http://example.com/am.vtt", bytes: 100, checksum: "c4", reviewed: false, meta: null },
      ],
    };
    const summary = accessSummary(lesson);
    expect(summary.captions).toEqual([
      { lang: "en", status: "reviewed" },
      { lang: "am", status: "draft" },
    ]);
  });

  it("empty lesson", () => {
    const lesson: LessonRecord = {
      id: "L-EMPTY",
      title: { en: "", am: "" },
      durationSec: 0,
      assets: [],
    };
    const summary = accessSummary(lesson);
    expect(summary).toEqual({
      captions: [],
      sign: false,
      audioDescription: { recorded: false, text: false },
      offline: null,
      transcript: false,
      summary: false,
    });
  });

  it("check that the output never reports reviewed for a draft", () => {
    const lesson: LessonRecord = {
      id: "L-DRAFT",
      title: { en: "Test", am: "ሙከራ" },
      durationSec: 10,
      assets: [
        { kind: "vtt", lang: "en", url: "http://example.com/en.vtt", bytes: 100, checksum: "c1", reviewed: false, meta: null },
        { kind: "vtt", lang: "am", url: "http://example.com/am.vtt", bytes: 100, checksum: "c2", reviewed: false, meta: null },
      ],
    };
    const summary = accessSummary(lesson);
    for (const c of summary.captions) {
      expect(c.status).toBe("draft");
      expect(c.status).not.toBe("reviewed");
    }
  });
});
