import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import en from "./i18n/en.json";
import am from "./i18n/am.json";
import { PROFILE_MAP, type ProfileKey, type ProfileChanges } from "./profile-map.js";

const PREFS_KEY = "savanna.prefs.v1";

@customElement("savanna-access-profiles")
export class SavannaAccessProfiles extends LitElement {
  @property({ type: String }) lang = "";

  @state() private activeLang: "en" | "am" = "en";
  @state() private hidden = false;
  @state() private canUndo = false;
  @state() private announcement = "";
  @state() private appliedProfiles: Set<ProfileKey> = new Set();

  private previousPrefs: any = null;

  static styles = css`
    :host {
      display: block;
      margin: 1rem 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      --prof-bg: var(--savanna-card-bg, #f8fafc);
      --prof-border: var(--savanna-border, #cbd5e1);
      --prof-text: var(--savanna-text, #0f172a);
      --prof-accent: var(--savanna-accent, #0369a1);
      --prof-focus: var(--savanna-focus, #0284c7);
      --prof-btn-bg: #ffffff;
      --prof-btn-hover: #f1f5f9;
      --prof-active-bg: #e0f2fe;
      --prof-active-text: #0369a1;
      --prof-active-border: #0369a1;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --prof-bg: var(--savanna-card-bg, #132438);
        --prof-border: var(--savanna-border, #334155);
        --prof-text: var(--savanna-text, #f1f5f9);
        --prof-accent: var(--savanna-accent, #38bdf8);
        --prof-btn-bg: #1e293b;
        --prof-btn-hover: #334155;
        --prof-active-bg: #1e3a5f;
        --prof-active-text: #e0f2fe;
        --prof-active-border: #38bdf8;
      }
    }

    .panel {
      background: var(--prof-bg);
      border: 1px solid var(--prof-border);
      border-radius: 8px;
      padding: 1.2rem;
      color: var(--prof-text);
      max-width: 100%;
    }

    .header {
      margin-bottom: 0.8rem;
    }

    h2 {
      margin: 0 0 0.3rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--prof-text);
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.85;
      line-height: 1.4;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin: 1rem 0;
    }

    .profile-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.9rem 0.6rem;
      min-height: 72px;
      background: var(--prof-btn-bg);
      border: 2px solid var(--prof-border);
      border-radius: 6px;
      color: var(--prof-text);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease-in-out;
    }

    .profile-btn:hover {
      background: var(--prof-btn-hover);
      border-color: var(--prof-accent);
    }

    .profile-btn:focus-visible {
      outline: 3px solid var(--prof-focus);
      outline-offset: 2px;
    }

    .profile-btn[aria-pressed="true"] {
      background: var(--prof-active-bg);
      color: var(--prof-active-text);
      border-color: var(--prof-active-border);
    }

    .btn-icon {
      font-size: 1.4rem;
      margin-bottom: 0.3rem;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      border-top: 1px solid var(--prof-border);
      padding-top: 0.8rem;
    }

    .action-btn {
      padding: 0.45rem 0.9rem;
      font-size: 0.88rem;
      font-weight: 600;
      border: 1px solid var(--prof-border);
      background: var(--prof-btn-bg);
      color: var(--prof-text);
      border-radius: 4px;
      cursor: pointer;
    }

    .action-btn:hover {
      background: var(--prof-btn-hover);
    }

    .action-btn:focus-visible {
      outline: 3px solid var(--prof-focus);
      outline-offset: 1px;
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
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

  private t(key: string): string {
    const strings = this.activeLang === "am" ? (am as Record<string, string>) : (en as Record<string, string>);
    return strings[key] || (en as Record<string, string>)[key] || key;
  }

  private applyProfile(profile: ProfileKey) {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(PREFS_KEY) : null;
      const currentPrefs = raw ? JSON.parse(raw) : {};

      if (!this.previousPrefs) {
        this.previousPrefs = JSON.parse(JSON.stringify(currentPrefs));
      }

      const changes = PROFILE_MAP[profile](this.activeLang);

      // Deep merge changes into currentPrefs
      for (const [ns, values] of Object.entries(changes)) {
        if (!currentPrefs[ns] || typeof currentPrefs[ns] !== "object") {
          currentPrefs[ns] = {};
        }
        Object.assign(currentPrefs[ns], values);
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PREFS_KEY, JSON.stringify(currentPrefs));
      }

      this.appliedProfiles.add(profile);
      this.appliedProfiles = new Set(this.appliedProfiles);
      this.canUndo = true;

      // Announcement
      const annKey = `profile.applied${profile.charAt(0).toUpperCase() + profile.slice(1)}`;
      this.announcement = this.t(annKey);

      // Dispatch event per Spec 4.3: window event savanna:prefs-applied with { profile, changed }
      window.dispatchEvent(
        new CustomEvent("savanna:prefs-applied", {
          detail: { profile, changed: changes },
        }),
      );
    } catch { }
  }

  private handleUndo() {
    if (!this.previousPrefs) return;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.previousPrefs));
      }
      this.appliedProfiles.clear();
      this.appliedProfiles = new Set();
      this.canUndo = false;
      this.announcement = this.t("profile.undone");

      window.dispatchEvent(
        new CustomEvent("savanna:prefs-applied", {
          detail: { profile: "undo", changed: this.previousPrefs },
        }),
      );
      this.previousPrefs = null;
    } catch { }
  }

  private handleSkip() {
    this.hidden = true;
    this.announcement = this.t("profile.skipped");
  }

  render() {
    if (this.hidden) {
      return html`<div class="sr-live" aria-live="polite">${this.announcement}</div>`;
    }

    return html`
      <section class="panel" aria-labelledby="profiles-heading">
        <div class="header">
          <h2 id="profiles-heading">🎯 ${this.t("profile.title")}</h2>
          <p>${this.t("profile.description")}</p>
        </div>

        <div class="button-grid" role="group" aria-label="${this.t("profile.title")}">
          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("cantSee")}"
            @click="${() => this.applyProfile("cantSee")}"
          >
            <span class="btn-icon" aria-hidden="true">👁️</span>
            <span>${this.t("profile.cantSee")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("cantHear")}"
            @click="${() => this.applyProfile("cantHear")}"
          >
            <span class="btn-icon" aria-hidden="true">👂</span>
            <span>${this.t("profile.cantHear")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("lowData")}"
            @click="${() => this.applyProfile("lowData")}"
          >
            <span class="btn-icon" aria-hidden="true">📶</span>
            <span>${this.t("profile.lowData")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("hardToRead")}"
            @click="${() => this.applyProfile("hardToRead")}"
          >
            <span class="btn-icon" aria-hidden="true">🔍</span>
            <span>${this.t("profile.hardToRead")}</span>
          </button>
        </div>

        <div class="footer">
          <button
            class="action-btn"
            ?disabled="${!this.canUndo}"
            @click="${this.handleUndo}"
          >
            ↩️ ${this.t("profile.undo")}
          </button>
          <button
            class="action-btn"
            @click="${this.handleSkip}"
          >
            ⏩ ${this.t("profile.skip")}
          </button>
        </div>

        <!-- Polite Live Region for screen readers -->
        <div class="sr-live" aria-live="polite" role="status">
          ${this.announcement}
        </div>
      </section>
    `;
  }
}
