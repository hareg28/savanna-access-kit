import type { AssetKind, AssetRecord, LessonRecord } from "../db/store";
import { HttpError } from "./errors";
import type { LessonManifest } from "../schemas/lesson";
import { accessSummary } from "../services/accessSummary";

const LANG_ORDER = ["en", "am"];

/** Database/memory record -> contract C1 manifest. */
export function toManifest(rec: LessonRecord): LessonManifest {
  const one = (kind: AssetKind) => rec.assets.find((a) => a.kind === kind);
  const need = (kind: AssetKind) => {
    const a = one(kind);
    if (!a) throw new HttpError(500, "Lesson is incomplete", `Lesson ${rec.id} has no "${kind}" file.`);
    return a;
  };

  const sign = one("sign");
  const adAudio = one("ad_audio");
  const adVtt = one("ad_vtt");
  const pack = one("pack");

  return {
    id: rec.id,
    title: rec.title,
    durationSec: rec.durationSec,
    media: { video: need("video").url, audio: need("audio").url },
    captions: rec.assets
      .filter((a) => a.kind === "vtt" && (a.lang === "en" || a.lang === "am"))
      .sort((a, b) => LANG_ORDER.indexOf(a.lang!) - LANG_ORDER.indexOf(b.lang!))
      .map((a) => ({ lang: a.lang as "en" | "am", url: a.url })),
    sign: sign ? { url: sign.url, offsetMs: Number(sign.meta?.offsetMs ?? 0) } : null,
    audioDescription:
      adAudio && adVtt
        ? { audioUrl: adAudio.url, vttUrl: adVtt.url, extended: Boolean(adAudio.meta?.extended) }
        : null,
    transcript: { url: `/v1/lessons/${rec.id}/transcript` },
    pack: pack ? { manifestUrl: `/v1/lessons/${rec.id}/pack`, sizeBytes: pack.bytes } : null,
    access: accessSummary(rec),
    share: { url: `/v1/lessons/${rec.id}/share.html`, sizeBytes: pack ? pack.bytes : 1800000 },
  };
}

/** Contract C1 manifest -> record (used to seed from the fixtures, so DB, memory and mock always agree). */
export function fromManifest(m: LessonManifest): LessonRecord {
  const asset = (kind: AssetKind, url: string, extra: Partial<AssetRecord> = {}): AssetRecord => ({
    kind, lang: null, url, bytes: 0, checksum: "", reviewed: true, meta: null, ...extra,
  });
  const assets: AssetRecord[] = [asset("video", m.media.video), asset("audio", m.media.audio)];
  for (const c of m.captions) {
    const status = m.access?.captions?.find((ac) => ac.lang === c.lang)?.status;
    const reviewed = status ? status === "reviewed" : true;
    assets.push(asset("vtt", c.url, { lang: c.lang, reviewed }));
  }
  if (m.sign) assets.push(asset("sign", m.sign.url, { meta: { offsetMs: m.sign.offsetMs } }));
  if (m.audioDescription) {
    assets.push(asset("ad_audio", m.audioDescription.audioUrl, { meta: { extended: m.audioDescription.extended } }));
    assets.push(asset("ad_vtt", m.audioDescription.vttUrl, { lang: "en" }));
  }
  if (m.pack) assets.push(asset("pack", m.pack.manifestUrl, { bytes: m.pack.sizeBytes }));
  if (m.access?.summary) {
    assets.push(asset("transcript_html", `/v1/lessons/${m.id}/transcript`, { meta: { summary: true } }));
  }
  return { id: m.id, title: m.title, durationSec: m.durationSec, assets };
}
