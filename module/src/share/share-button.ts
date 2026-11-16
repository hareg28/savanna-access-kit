import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import en from "./i18n/en.json";
import am from "./i18n/am.json";

@customElement("savanna-share-button")
export class SavannaShareButton extends LitElement {
  @property({ type: String }) lesson = "";
  @property({ type: String }) api = "";
  @property({ type: String, attribute: "api-key" }) apiKey = "";
  @property({ type: String, attribute: "data-manifest-url" }) manifestUrl = "";
  @property({ type: String }) lang = "";

  @state() private activeLang: "en" | "am" = "en";
  @state() private shareUrl: string | null = null;
  @state() private sizeBytes: number | null = null;
  @state() private loading = false;
  @state() private notAvailable = false;
  @state() private statusText = "";

  static styles = css`
    :host {
      display: inline-block;
      margin: 0.5rem 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      --share-bg: var(--savanna-accent, #0369a1);
      --share-text: #ffffff;
      --share-border: var(--savanna-accent, #0369a1);
      --share-hover: #0284c7;
      --share-focus: #0284c7;
    }

    .share-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.1rem;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--share-bg);
      color: var(--share-text);
      border: 1px solid var(--share-border);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease-in-out;
    }

    .share-btn:hover:not(:disabled) {
      background: var(--share-hover);
    }

    .share-btn:focus-visible {
      outline: 3px solid var(--share-focus);
      outline-offset: 2px;
    }

    .share-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .not-available {
      display: inline-block;
      font-size: 0.9rem;
      color: var(--savanna-text, #64748b);
      padding: 0.5rem 0;
    }

    .sr-live {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.resolveLang();
    window.addEventListener("savanna:lang-change", this.handleLangChange);
    this.loadShareInfo();
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

  async loadShareInfo() {
    try {
      let manifest: any = null;
      const closestPlayer = this.closest("savanna-player") as any;
      if (closestPlayer?.manifest) {
        manifest = closestPlayer.manifest;
      }

      if (!manifest) {
        const url = this.manifestUrl || (this.api ? `${this.api.replace(/\/$/, "")}/v1/lessons/${this.lesson || "L-102"}` : "");
        if (url) {
          const headers: Record<string, string> = {};
          if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;
          const res = await fetch(url, { headers });
          if (res.ok) manifest = await res.json();
        }
      }

      if (!manifest && typeof localStorage !== "undefined" && this.lesson) {
        const cached = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cached) manifest = JSON.parse(cached);
      }

      if (manifest?.share) {
        this.shareUrl = manifest.share.url;
        this.sizeBytes = manifest.share.sizeBytes;
        this.notAvailable = false;
      } else if (manifest) {
        // Fallback default share url
        const lessonId = this.lesson || manifest.id || "L-102";
        this.shareUrl = `/v1/lessons/${lessonId}/share.html`;
        this.sizeBytes = manifest.pack?.sizeBytes || 1800000;
        this.notAvailable = false;
      } else {
        this.notAvailable = true;
      }
    } catch {
      this.notAvailable = true;
    }
  }

  private async handleShare() {
    if (!this.shareUrl || this.loading) return;

    this.loading = true;
    this.statusText = this.t("share.downloading");
    this.dispatchEvent(new CustomEvent("savanna:share-start", { bubbles: true, composed: true }));

    const lessonId = this.lesson || "L-102";
    const resolvedUrl = this.api ? `${this.api.replace(/\/$/, "")}${this.shareUrl}` : this.shareUrl;

    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;

      const res = await fetch(resolvedUrl, { headers });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const blob = await res.blob();
      const filename = `lesson-${lessonId}.html`;
      const mbSize = (blob.size / 1000000).toFixed(1);
      const readyMsg = this.t("share.ready", { size: mbSize });
      this.statusText = readyMsg;

      // 4. If navigator.canShare({ files }), call navigator.share({ files }). Otherwise download.
      const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
      let sharedViaSheet = false;

      if (nav && typeof nav.share === "function" && typeof File !== "undefined") {
        try {
          const file = new File([blob], filename, { type: "text/html" });
          if (!nav.canShare || nav.canShare({ files: [file] })) {
            await nav.share({
              files: [file],
              title: `Savanna Lesson ${lessonId}`,
              text: "Here is your offline lesson in a file.",
            });
            sharedViaSheet = true;
          }
        } catch {
          // User cancelled or sheet not supported, fallback to direct download
        }
      }

      if (!sharedViaSheet) {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }

      this.loading = false;
      this.dispatchEvent(
        new CustomEvent("savanna:share-done", {
          bubbles: true,
          composed: true,
          detail: { filename, sizeBytes: blob.size },
        }),
      );
    } catch (err) {
      this.loading = false;
      this.statusText = this.t("share.error");
      this.dispatchEvent(
        new CustomEvent("savanna:error", {
          bubbles: true,
          composed: true,
          detail: { message: err instanceof Error ? err.message : String(err) },
        }),
      );
    }
  }

  render() {
    if (this.notAvailable) {
      return html`<span class="not-available">${this.t("share.notAvailable")}</span>`;
    }

    const mbSize = this.sizeBytes ? (this.sizeBytes / 1000000).toFixed(1) : "1.8";

    return html`
      <div>
        <button
          class="share-btn"
          ?disabled="${this.loading}"
          @click="${this.handleShare}"
          aria-label="${this.t("share.button")} ${this.t("share.size", { size: mbSize })}"
        >
          <span aria-hidden="true">${this.loading ? "⏳" : "📤"}</span>
          <span>${this.loading ? this.statusText : this.t("share.button")}</span>
          <span aria-hidden="true">${this.t("share.size", { size: mbSize })}</span>
        </button>

        <div class="sr-live" aria-live="polite" role="status">
          ${this.statusText}
        </div>
      </div>
    `;
  }
}
