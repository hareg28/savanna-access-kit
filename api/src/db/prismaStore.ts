// PostgreSQL store (Prisma 6). Needs `pnpm --filter @savanna/api db:generate` and a running database.
// The client is loaded lazily and typed loosely on purpose: typecheck and tests must pass on a fresh
// clone before anyone has generated the client or started Docker.
import type { Lang, Transcript } from "../schemas/lesson";
import type { Preferences } from "../schemas/preferences";
import type { AssetRecord, LessonRecord, Store } from "./store";

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRecord(row: any): LessonRecord {
  return {
    id: row.id,
    title: row.title,
    durationSec: row.durationSec,
    assets: row.assets.map((a: any): AssetRecord => ({
      kind: a.kind, lang: a.lang, url: a.url, bytes: a.bytes, checksum: a.checksum, reviewed: a.reviewed, meta: a.meta,
    })),
  };
}

export async function createPrismaStore(databaseUrl: string): Promise<{ store: Store; prisma: unknown }> {
  const mod: any = await import("@prisma/client");
  const prisma: any = new mod.PrismaClient({ datasourceUrl: databaseUrl });

  const store: Store = {
    async listLessons() {
      const rows = await prisma.lesson.findMany({ where: { status: "published" }, orderBy: { id: "asc" }, include: { assets: true } });
      return rows.map(toRecord);
    },
    async getLesson(id) {
      const row = await prisma.lesson.findFirst({ where: { id, status: "published" }, include: { assets: true } });
      return row ? toRecord(row) : null;
    },
    async getTranscript(lessonId: string, lang: Lang): Promise<Transcript | null> {
      const row = await prisma.transcript.findUnique({ where: { lessonId_lang: { lessonId, lang } } });
      return row ? { id: lessonId, lang, lines: row.lines } : null;
    },
    async getPreferences(userHash) {
      const row = await prisma.preference.findUnique({ where: { userHash } });
      return row ? (row.data as Preferences) : null;
    },
    async setPreferences(userHash, prefs) {
      await prisma.preference.upsert({ where: { userHash }, create: { userHash, data: prefs }, update: { data: prefs } });
    },
    async deletePreferences(userHash) {
      await prisma.preference.deleteMany({ where: { userHash } });
    },
    async saveCaption(lessonId, lang, vttContent, reviewed = true) {
      const url = `/v1/lessons/${lessonId}/captions/${lang}.vtt`;
      await prisma.asset.upsert({
        where: { lessonId_kind_lang: { lessonId, kind: "vtt", lang } },
        create: { lessonId, kind: "vtt", lang, url, bytes: Buffer.byteLength(vttContent), checksum: "", reviewed },
        update: { url, bytes: Buffer.byteLength(vttContent), reviewed },
      });
      return { url, reviewed };
    },
  };
  return { store, prisma };
}
