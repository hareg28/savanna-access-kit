import type { Transcript } from "../schemas/lesson";
import type { Preferences } from "../schemas/preferences";
import { loadSeedData } from "./seedData";
import type { LessonRecord, Store } from "./store";

/** No database needed: lessons come from contracts/fixtures. Preferences live in RAM (lost on restart). */
export function createMemoryStore(): Store {
  const { lessons, transcripts } = loadSeedData();
  const byId = new Map<string, LessonRecord>(lessons.map((l) => [l.id, l]));
  const tr = new Map<string, Transcript>(transcripts.map((t) => [`${t.id}:${t.lang}`, t]));
  const prefs = new Map<string, Preferences>();
  const captionsContent = new Map<string, string>();

  return {
    listLessons: async () => [...byId.values()],
    getLesson: async (id) => byId.get(id) ?? null,
    getTranscript: async (id, lang) => tr.get(`${id}:${lang}`) ?? null,
    getPreferences: async (h) => prefs.get(h) ?? null,
    setPreferences: async (h, p) => void prefs.set(h, p),
    deletePreferences: async (h) => void prefs.delete(h),
    saveCaption: async (id, lang, vttContent, reviewed = true) => {
      const lesson = byId.get(id);
      if (!lesson) throw new Error(`Lesson ${id} not found`);
      const url = `/v1/lessons/${id}/captions/${lang}.vtt`;
      const existing = lesson.assets.find((a) => a.kind === "vtt" && a.lang === lang);
      if (existing) {
        existing.url = url;
        existing.reviewed = reviewed;
        existing.bytes = Buffer.byteLength(vttContent);
      } else {
        lesson.assets.push({
          kind: "vtt",
          lang,
          url,
          bytes: Buffer.byteLength(vttContent),
          checksum: "",
          reviewed,
          meta: null,
        });
      }
      captionsContent.set(`${id}:${lang}`, vttContent);
      return { url, reviewed };
    },
    getCaption: async (id, lang) => captionsContent.get(`${id}:${lang}`) ?? null,
  };
}
