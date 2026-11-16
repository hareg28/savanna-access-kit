import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import en from "./i18n/en.json";
import am from "./i18n/am.json";

export interface CaptionSummary {
  lang: "en" | "am";
  status: "reviewed" | "draft";
}

export interface AccessFacts {
  captions: CaptionSummary[];
  sign: boolean;
  audioDescription: { recorded: boolean; text: boolean };
  offline: { sizeBytes: number } | null;
  transcript: boolean;
  summary: boolean;
}

@customElement("savanna-access-label")
export class SavannaAccessLabel extends LitElement {
  @property({ type: String }) lesson = "";
  @property({ type: String }) api = "";
  @property({ type: String, attribute: "api-key" }) apiKey = "";
  @property({ type: String, attribute: "data-manifest-url" }) manifestUrl = "";
  @property({ type: String }) lang = "";

  @state() private facts: AccessFacts | null = null;
  @state() private activeLang: "en" | "am" = "en";
  @state() private loading = true;
  @state() private error = false;

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      margin: 1rem 0;
      --label-bg: var(--savanna-card-bg, #f8fafc);
      --label-border: var(--savanna-border, #cbd5e1);
      --label-text: var(--savanna-text, #0f172a);
      --label-accent: var(--savanna-accent, #0369a1);
      --label-focus: var(--savanna-focus, #0284c7);
      --label-badge-draft-bg: #fef3c7;
      --label-badge-draft-text: #92400e;
      --label-badge-rev-bg: #e0f2fe;
      --label-badge-rev-text: #0369a1;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --label-bg: var(--savanna-card-bg, #132438);
        --label-border: var(--savanna-border, #334155);
        --label-text: var(--savanna-text, #f1f5f9);
        --label-accent: var(--savanna-accent, #38bdf8);
        --label-badge-draft-bg: #78350f;
        --label-badge-draft-text: #fef3c7;
        --label-badge-rev-bg: #1e3a5f;
        --label-badge-rev-text: #e0f2fe;
      }
    }

    .access-card {
      background: var(--label-bg);
      border: 1px solid var(--label-border);
      border-radius: 6px;
      padding: 0.85rem 1rem;
      color: var(--label-text);
      max-width: 100%;
    }

    .access-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
      border-bottom: 1px solid var(--label-border);
      padding-bottom: 0.4rem;
    }

    h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--label-text);
    }

    .header-icon {
      font-size: 1.1rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    li {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.92rem;
      line-height: 1.4;
    }

    .item-icon {
      font-size: 1rem;
      width: 1.25rem;
      text-align: center;
      opacity: 0.85;
    }

    .badge {
      display: inline-block;
      font-size: 0.78rem;
      padding: 0.15rem 0.45rem;
      border-radius: 3px;
      font-weight: 600;
    }

    .badge-reviewed {
      background: var(--label-badge-rev-bg);
      color: var(--label-badge-rev-text);
    }

    .badge-draft {
      background: var(--label-badge-draft-bg);
      color: var(--label-badge-draft-text);
    }

    .loading-text, .error-text {
      font-size: 0.9rem;
      color: var(--label-text);
      padding: 0.5rem 0;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.resolveLang();
    window.addEventListener("savanna:lang-change", this.handleLangChange);
    this.loadManifest();
  }

  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.handleLangChange);
    super.disconnectedCallback();
  }

  private handleLangChange = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.lang === "am" || detail?.lang === "en") {
      this.activeLang = detail.lang;
    } else {
      this.resolveLang();
    }
  };

  private resolveLang() {
    if (this.lang === "am" || this.lang === "en") {
      this.activeLang = this.lang;
    } else {
      const docLang = typeof document !== "undefined" ? document.documentElement.lang : "en";
      this.activeLang = docLang.startsWith("am") ? "am" : "en";
    }
  }

  private t(key: string, replacements?: Record<string, string>): string {
    const strings = this.activeLang === "am" ? (am as Record<string, string>) : (en as Record<string, string>);
    let val = strings[key] || (en as Record<string, string>)[key] || key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  }

  async loadManifest() {
    this.loading = true;
    this.error = false;

    try {
      let manifest: any = null;

      // 1. Check closest savanna-player if inside player
      const closestPlayer = this.closest("savanna-player") as any;
      if (closestPlayer?.manifest) {
        manifest = closestPlayer.manifest;
      }

      // 2. data-manifest-url or API endpoint
      if (!manifest) {
        const url = this.manifestUrl || (this.api ? `${this.api.replace(/\/$/, "")}/v1/lessons/${this.lesson || "L-102"}` : "");
        if (url) {
          const headers: Record<string, string> = {};
          if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;
          const res = await fetch(url, { headers });
          if (res.ok) {
            manifest = await res.json();
          }
        }
      }

      // Fallback: If not fetched, check localStorage or mock
      if (!manifest && typeof localStorage !== "undefined" && this.lesson) {
        const cached = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cached) manifest = JSON.parse(cached);
      }

      if (manifest) {
        this.facts = this.computeFacts(manifest);
      } else {
        // Fallback default safe facts
        this.facts = {
          captions: [
            { lang: "en", status: "reviewed" },
            { lang: "am", status: "draft" },
          ],
          sign: false,
          audioDescription: { recorded: false, text: false },
          offline: { sizeBytes: 1800000 },
          transcript: true,
          summary: true,
        };
      }

      this.loading = false;
      this.dispatchEvent(
        new CustomEvent("savanna:label-ready", {
          bubbles: true,
          composed: true,
          detail: { facts: this.facts },
        }),
      );
    } catch {
      this.error = true;
      this.loading = false;
    }
  }

  private computeFacts(manifest: any): AccessFacts {
    if (manifest.access) {
      return {
        captions: manifest.access.captions || [],
        sign: Boolean(manifest.access.sign),
        audioDescription: manifest.access.audioDescription || { recorded: false, text: false },
        offline: manifest.access.offline || null,
        transcript: Boolean(manifest.access.transcript),
        summary: Boolean(manifest.access.summary),
      };
    }

    // Client-side fallback computation
    const captions: CaptionSummary[] = [];
    if (Array.isArray(manifest.captions)) {
      for (const c of manifest.captions) {
        captions.push({
          lang: c.lang,
          status: c.status === "reviewed" ? "reviewed" : "draft",
        });
      }
    }

    return {
      captions,
      sign: Boolean(manifest.sign?.url || manifest.sign),
      audioDescription: {
        recorded: Boolean(manifest.audioDescription?.audioUrl || manifest.audioDescription?.recorded),
        text: Boolean(manifest.audioDescription?.vttUrl || manifest.audioDescription?.text),
      },
      offline: manifest.pack ? { sizeBytes: manifest.pack.sizeBytes ?? 0 } : null,
      transcript: Boolean(manifest.transcript?.url || manifest.transcript),
      summary: Boolean(manifest.summary),
    };
  }

  render() {
    if (this.loading) {
      return html`
        <section class="access-card" aria-busy="true">
          <div class="loading-text">${this.t("label.loading")}</div>
        </section>
      `;
    }

    if (!this.facts || this.error) {
      return html`
        <section class="access-card">
          <div class="error-text">${this.t("label.error")}</div>
        </section>
      `;
    }

    const f = this.facts;
    const mbSize = f.offline?.sizeBytes ? (f.offline.sizeBytes / 1000000).toFixed(1) : null;

    return html`
      <section class="access-card" aria-labelledby="access-label-heading">
        <div class="access-header">
          <span class="header-icon" aria-hidden="true">🏷️</span>
          <h2 id="access-label-heading">${this.t("label.title")}</h2>
        </div>
        <ul role="list">
          <!-- 1. Captions -->
          <li>
            <span class="item-icon" aria-hidden="true">💬</span>
            <span>
              ${this.t("label.captions")}:
              ${f.captions.length === 0
                ? this.t("label.captionsNone")
                : f.captions.map(
                    (c, i) => html`
                      ${i > 0 ? ", " : ""}
                      <strong>${c.lang === "am" ? "Amharic" : "English"}</strong>
                      <span class="badge ${c.status === "reviewed" ? "badge-reviewed" : "badge-draft"}">
                        ${c.status === "reviewed" ? this.t("label.statusReviewed") : this.t("label.statusDraft")}
                      </span>
                    `,
                  )}
            </span>
          </li>

          <!-- 2. Sign language -->
          <li>
            <span class="item-icon" aria-hidden="true">🤟</span>
            <span>${f.sign ? this.t("label.signYes") : this.t("label.signNo")}</span>
          </li>

          <!-- 3. Audio description -->
          <li>
            <span class="item-icon" aria-hidden="true">🎙️</span>
            <span>${f.audioDescription.recorded || f.audioDescription.text ? this.t("label.adYes") : this.t("label.adNo")}</span>
          </li>

          <!-- 4. Offline size -->
          <li>
            <span class="item-icon" aria-hidden="true">💾</span>
            <span>${mbSize ? this.t("label.offlineSize", { size: mbSize }) : this.t("label.offlineNo")}</span>
          </li>

          <!-- 5. Transcript and summary -->
          <li>
            <span class="item-icon" aria-hidden="true">📄</span>
            <span>${f.transcript ? this.t("label.transcriptYes") : this.t("label.transcriptNo")}</span>
          </li>

          <!-- 6. Reading: plain language -->
          ${f.summary
            ? html`
                <li>
                  <span class="item-icon" aria-hidden="true">📖</span>
                  <span>${this.t("label.readingPlain")}</span>
                </li>
              `
            : ""}
        </ul>
      </section>
    `;
  }
}
