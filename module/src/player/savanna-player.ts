import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import en from './i18n/en.json';
import am from './i18n/am.json';
import { parseWebVtt, getActiveCueText, type VttCue } from './vtt-parser.js';
import {
  type TranscriptLine,
  type FilteredTranscriptItem,
  filterTranscriptLines,
  findActiveTranscriptLineIndex,
  splitTextByMatch,
  formatTranscriptForDownload,
} from './transcript-manager.js';
import { formatTranscriptToBrf } from './braille-formatter.js';
import {
  loadPlayerPreferences,
  savePlayerPreferences,
  getDefaultUiPreferences,
  getDefaultCaptionsPreferences,
  type UiPreferences,
  type CaptionsPreferences,
  type PlayerPreferences,
} from './preferences-manager.js';
import {
  resolveCaptionUrl,
  shouldSendApiKey,
  fetchCaptionTrack,
  formatPackSize,
} from './caption-loader.js';

@customElement('savanna-player')
export class SavannaPlayer extends LitElement {
  @property({ type: String })
  src = '';

  /** Contract C1 / C6: Lesson ID to fetch from the API */
  @property({ type: String })
  lesson = '';

  /** Contract C6: API base URL (e.g. http://localhost:4010) */
  @property({ type: String })
  api = '';

  /** Contract C6: Public publishable API key */
  @property({ type: String, attribute: 'api-key' })
  apiKey = '';

  /** Contract C4: Component language code ('en' | 'am') */
  @property({ type: String })
  lang = 'en';

  /**
   * Allows disabling keyboard shortcuts per WCAG 2.1.4
   * (Character Key Shortcuts) or host application preferences.
   */
  @property({ type: Boolean, attribute: 'disable-shortcuts', reflect: true })
  disableShortcuts = false;

  /** Toggle state for slotted sign language window */
  @property({ type: Boolean, attribute: 'show-sign-window', reflect: true })
  showSignWindow = true;

  /** Toggle state for audio description */
  @property({ type: Boolean, attribute: 'audio-description', reflect: true })
  audioDescriptionEnabled = false;

  /** Exposes the offline pack metadata from the lesson manifest (Contract C1) */
  public get offlinePack(): { manifestUrl?: string; sizeBytes?: number } | null {
    return this.manifestData?.pack ?? null;
  }

  /**
   * Dynamically formatted offline pack size (e.g. "1.72 MB" or "850 KB") without hardcoding.
   */
  public get formattedPackSize(): string {
    return formatPackSize(this.manifestData?.pack?.sizeBytes);
  }

  /** Whether the on-screen shortcuts help dialog is open */
  @state()
  private showHelpDialog = false;

  /** Whether the caption customization settings dialog is open */
  @state()
  private showCaptionsDialog = false;

  /** Whether the unified player preferences dialog is open (SRS FR-P9) */
  @state()
  private showPreferencesDialog = false;

  /** Selected player display theme (Contract C3 / SRS FR-P9) */
  @state()
  private playerTheme: 'dark' | 'light' | 'high-contrast' = 'dark';

  /** Active preferences tab: 'general' | 'captions' */
  @state()
  private activePrefsTab: 'general' | 'captions' = 'general';

  /** Caption track list loaded from lesson manifest */
  @state()
  private manifestCaptions: Array<{ lang: string; url: string }> = [];

  /** Selected caption language: 'en' | 'am' | 'off' */
  @state()
  private selectedCaptionLang: 'en' | 'am' | 'off' = 'en';

  /** Active cue text computed on playback timeupdate */
  @state()
  private currentCueText = '';

  /** Captions customization settings per SRS FR-P3 & Contract C3 */
  @state()
  private captionFontSize = 100; // 100%, 150%, 200%, 300%

  @state()
  private captionPreset: 'white-black' | 'yellow-black' | 'black-white' | 'custom' = 'white-black';

  @state()
  private captionTextColor = '#ffffff';

  @state()
  private captionBgColor = '#000000';

  @state()
  private captionBgOpacity = 80; // 100%, 75%, 50%, 0%

  @state()
  private captionPosition: 'bottom' | 'top' = 'bottom';

  /** In-memory cache of parsed WebVTT cues mapped by language */
  private vttCuesCache = new Map<string, VttCue[]>();

  /** Map of active Object URLs generated for authenticated caption tracks (lang -> blobUrl) */
  private captionBlobUrls = new Map<string, string>();

  /** Playback and controls reactive state */
  @state()
  private isPlaying = false;

  @state()
  private currentTime = 0;

  @state()
  private duration = 0;

  @state()
  private volume = 1;

  @state()
  private isMuted = false;

  @state()
  private playbackRate = 1;

  @state()
  private captionsShowing = false;

  @state()
  private isFullscreen = false;

  /** Temporary on-screen HUD toast message for shortcut confirmation (visual only) */
  @state()
  private statusToast = '';

  /** Permanent polite live region announcement string for screen readers */
  @state()
  private liveRegionMessage = '';

  /** Contract C1: Null-safety flags derived from manifest */
  @state()
  private hasSignTrack = true;

  @state()
  private hasAdTrack = true;

  private toastTimeout: number | null = null;
  private liveRegionTimeout: number | null = null;
  private triggerElementBeforeDialog: HTMLElement | null = null;

  @query('video')
  private videoElement!: HTMLVideoElement;

  @query('.shortcuts-dialog')
  private helpDialogElement!: HTMLDialogElement | null;

  @query('.captions-dialog')
  private captionsDialogElement!: HTMLDialogElement | null;

  @query('.btn-help')
  private helpButtonElement!: HTMLButtonElement | null;

  @query('.btn-captions-settings')
  private captionsSettingsBtnElement!: HTMLButtonElement | null;

  @query('.btn-fullscreen')
  private fullscreenButtonElement!: HTMLButtonElement | null;

  /** FR-P1a: Tracks the last focused control in the player for fullscreen restoration */
  private lastFocusedControl: HTMLElement | null = null;

  /** FR-P12: Whether non-speech sound descriptions should be voiced to screen readers */
  @state()
  private soundDescriptionsEnabled = false;

  /** Whether the interactive transcript panel is open (SRS FR-P8) */
  @state()
  private isTranscriptOpen = false;

  /** Transcript lines array */
  @state()
  private transcriptLines: TranscriptLine[] = [];

  /** Plain-language summary of the lesson (SRS FR-P8, FR-D4) */
  @state()
  private transcriptSummary = '';

  /** Search query string in transcript */
  @state()
  private transcriptSearchQuery = '';

  /** Whether auto-scrolling is enabled during playback */
  @state()
  private transcriptAutoScroll = true;

  /** Index of the active line in transcriptLines */
  @state()
  private activeTranscriptIndex = -1;

  /** Whether the playback speed popover menu is open (SRS FR-P9) */
  @state()
  private isSpeedMenuOpen = false;

  /** Whether loading lesson manifest failed (SRS FR-P11, Task 1.7) */
  @state()
  private manifestLoadError = false;

  /** Lesson title from manifest */
  @state()
  private lessonTitle = '';

  /** Stored manifest cache */
  private manifestData: any = null;

  /** Reactive state aliases matching developer/test expectations */
  get isCaptionsOpen(): boolean {
    return this.captionsShowing;
  }
  set isCaptionsOpen(val: boolean) {
    if (this.captionsShowing !== val) {
      this.toggleCaptions();
    }
  }

  get isPrefsOpen(): boolean {
    return this.showPreferencesDialog;
  }
  set isPrefsOpen(val: boolean) {
    if (val) {
      this.openPreferencesDialog('general');
    } else {
      this.closePreferencesDialog();
    }
  }

  get isSignOpen(): boolean {
    return this.showSignWindow;
  }
  set isSignOpen(val: boolean) {
    if (this.showSignWindow !== val) {
      this.toggleSignWindow();
    }
  }

  get isAdOpen(): boolean {
    return this.audioDescriptionEnabled;
  }
  set isAdOpen(val: boolean) {
    if (this.audioDescriptionEnabled !== val) {
      this.toggleAudioDescription();
    }
  }

  @query('.btn-transcript')
  private transcriptBtnElement!: HTMLButtonElement | null;

  @query('#transcript-search-input')
  private transcriptSearchInput!: HTMLInputElement | null;

  @query('.transcript-lines-container')
  private transcriptScrollContainer!: HTMLElement | null;

  @query('.prefs-dialog')
  private prefsDialogElement!: HTMLDialogElement | null;

  @query('.btn-preferences')
  private prefsBtnElement!: HTMLButtonElement | null;

  // Expose the real browser media element (Contract C2).
  get media(): HTMLMediaElement {
    return this.videoElement;
  }

  static styles = css`
    :host {
      --savanna-accent: #0f4c81;
      --savanna-focus: #005fcc;
      --savanna-radius: 4px;
      --savanna-ctrl-bg: #0b192c;
      --savanna-ctrl-text: #ffffff;
      --savanna-btn-bg: rgba(255, 255, 255, 0.12);
      --savanna-btn-border: rgba(255, 255, 255, 0.25);
      --savanna-btn-hover: rgba(255, 255, 255, 0.24);
      --savanna-panel-bg: #0b192c;
      --savanna-header-bg: #142742;
      display: block;
      position: relative;
      outline: none;
      border-radius: var(--savanna-radius, 4px);
      box-sizing: border-box;
      cursor: pointer;
    }

    :host([data-theme='light']) {
      --savanna-accent: #0284c7;
      --savanna-ctrl-bg: #f8fafc;
      --savanna-ctrl-text: #0f172a;
      --savanna-btn-bg: rgba(0, 0, 0, 0.08);
      --savanna-btn-border: rgba(0, 0, 0, 0.25);
      --savanna-btn-hover: rgba(0, 0, 0, 0.15);
      --savanna-panel-bg: #ffffff;
      --savanna-header-bg: #e2e8f0;
    }

    :host([data-theme='high-contrast']) {
      --savanna-accent: #f59e0b;
      --savanna-focus: #f59e0b;
      --savanna-ctrl-bg: #000000;
      --savanna-ctrl-text: #ffffff;
      --savanna-btn-bg: #000000;
      --savanna-btn-border: #ffffff;
      --savanna-btn-hover: #1f2937;
      --savanna-panel-bg: #000000;
      --savanna-header-bg: #111827;
    }

    :host(:focus),
    :host(:focus-within),
    :host(:focus-visible) {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 3px;
      box-shadow: 0 0 0 3px var(--savanna-focus, #005fcc);
    }

    @media (forced-colors: active) {
      :host(:focus),
      :host(:focus-within),
      :host(:focus-visible) {
        outline: 3px solid Highlight !important;
      }
    }

    .player {
      position: relative;
      width: 100%;
      background-color: #000000;
      border-radius: var(--savanna-radius, 4px);
      overflow: hidden;
    }

    video {
      display: block;
      width: 100%;
      height: auto;
    }

    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    ::slotted(*) {
      pointer-events: auto;
    }

    /* Screen Reader Only Utility */
    .sr-only {
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

    /* Noto Sans Ethiopic font family stack for native Amharic glyph support */
    @font-face {
      font-family: 'Noto Sans Ethiopic';
      font-style: normal;
      font-weight: 400 700;
      font-display: swap;
      src: local('Noto Sans Ethiopic'), local('Nyala'), local('Abyssinica SIL'), local('Kefa');
      unicode-range: U+1200-137F, U+1380-139F, U+2D80-2DDF, U+AB00-AB2F;
    }

    /* Custom Captions Overlay (SRS FR-P3) */
    .caption-overlay {
      position: absolute;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 20;
      transition: top 0.15s ease, bottom 0.15s ease;
    }

    .caption-overlay.pos-bottom {
      bottom: 60px;
    }

    .caption-overlay.pos-top {
      top: 14px;
    }

    .caption-cue {
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
      line-height: 1.4;
      white-space: pre-wrap;
      display: inline-block;
      text-align: center;
      padding: 0.35rem 0.85rem;
      border-radius: var(--savanna-radius, 4px);
      box-sizing: border-box;
      max-width: 90%;
      word-break: break-word;
      transition: font-size 0.1s ease, color 0.1s ease, background-color 0.1s ease;
    }

    /* Modal Dialogs (Shortcuts Help & Captions Settings) */
    dialog.shortcuts-dialog,
    dialog.captions-dialog {
      margin: auto;
      max-width: 540px;
      width: calc(100% - 2rem);
      max-height: calc(100% - 2rem);
      box-sizing: border-box;
      background: #0b192c;
      color: #ffffff;
      border: 2px solid var(--savanna-focus, #005fcc);
      border-radius: var(--savanna-radius, 4px);
      padding: 1.25rem;
      z-index: 100;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }

    dialog.shortcuts-dialog::backdrop,
    dialog.captions-dialog::backdrop {
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(2px);
    }

    dialog:not([open]) {
      display: none;
    }

    .shortcuts-header,
    .captions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 0.5rem;
    }

    .shortcuts-header h2,
    .shortcuts-header h3,
    .prefs-header h2,
    .captions-header h2,
    .captions-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #ffffff;
    }

    .close-help-btn,
    .close-captions-btn {
      background: #ffffff;
      color: #111827;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      min-height: 36px;
      min-width: 44px;
      box-sizing: border-box;
    }

    .close-help-btn:focus-visible,
    .close-captions-btn:focus-visible {
      outline: 3px solid #facc15;
      outline-offset: 2px;
    }

    .shortcuts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      color: #f3f4f6;
    }

    .shortcuts-table th,
    .shortcuts-table td {
      padding: 0.4rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .shortcuts-table th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 600;
    }

    kbd {
      background: #374151;
      border: 1px solid #6b7280;
      border-radius: 3px;
      padding: 2px 5px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 0.85em;
      color: #f9fafb;
    }

    /* Captions Settings Controls */
    .captions-settings-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      font-size: 0.9rem;
    }

    .setting-row label {
      font-weight: 500;
      color: #f1f5f9;
    }

    .setting-row select {
      flex: 0 1 210px;
    }

    .custom-colors-row {
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .color-picker-input {
      width: 40px;
      height: 36px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 4px;
      background: none;
      cursor: pointer;
    }

    .preview-container {
      margin-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 0.75rem;
    }

    .preview-label {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preview-stage {
      background: #1e293b;
      background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
      background-size: 12px 12px;
      padding: 1.25rem 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80px;
    }

    /* On-Screen HUD Notification Badge (visual only) */
    .status-toast {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(11, 37, 69, 0.94);
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 1.15rem;
      font-weight: 700;
      pointer-events: none;
      z-index: 150;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
      border: 2px solid rgba(255, 255, 255, 0.35);
      text-align: center;
      min-width: 140px;
    }

    /* Focus Ring on all interactive controls */
    .ctrl-btn:focus-visible,
    .ctrl-slider:focus-visible,
    .ctrl-select:focus-visible,
    .close-help-btn:focus-visible,
    .close-captions-btn:focus-visible,
    .close-prefs-btn:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
    }

    /* Player Controls Bar */
    .player-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      background: var(--savanna-ctrl-bg, #0b192c);
      color: var(--savanna-ctrl-text, #ffffff);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      box-sizing: border-box;
    }

    .ctrl-btn {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--savanna-btn-bg, rgba(255, 255, 255, 0.12));
      color: var(--savanna-ctrl-text, #ffffff);
      border: 1px solid var(--savanna-btn-border, rgba(255, 255, 255, 0.25));
      border-radius: var(--savanna-radius, 4px);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0 0.5rem;
      box-sizing: border-box;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .ctrl-btn:hover {
      background: var(--savanna-btn-hover, rgba(255, 255, 255, 0.24));
      border-color: rgba(255, 255, 255, 0.45);
    }

    /* Tab bar in Preferences Dialog */
    .prefs-tab-bar {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .prefs-tab-btn {
      flex: 1;
      min-height: 40px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--savanna-radius, 4px);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }

    .prefs-tab-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    .prefs-tab-btn.is-active-tab,
    .prefs-tab-btn[aria-selected='true'] {
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
      border-color: #ffffff;
    }

    :host([data-theme='high-contrast']) .prefs-tab-btn.is-active-tab,
    :host([data-theme='high-contrast']) .prefs-tab-btn[aria-selected='true'] {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
      font-weight: 700;
    }

    .prefs-tab-btn:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
    }

    .btn-reset-prefs {
      margin-top: 0.5rem;
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
      color: #fca5a5;
    }

    .btn-reset-prefs:hover {
      background: rgba(239, 68, 68, 0.35);
      color: #ffffff;
    }

    .ctrl-btn.active,
    .ctrl-btn[aria-pressed='true'] {
      background: var(--savanna-accent, #0f4c81);
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
    }

    :host([data-theme='high-contrast']) .ctrl-btn.active,
    :host([data-theme='high-contrast']) .ctrl-btn[aria-pressed='true'] {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
      font-weight: 700;
    }

    .ctrl-btn.is-disabled,
    .ctrl-btn[aria-disabled='true'] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .ctrl-select {
      min-height: 44px;
      background: rgba(17, 24, 39, 0.95);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--savanna-radius, 4px);
      padding: 0 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      box-sizing: border-box;
    }

    .ctrl-slider {
      min-height: 44px;
      cursor: pointer;
      accent-color: var(--savanna-accent, #0f4c81);
    }

    .slider-seek {
      flex: 1 1 140px;
    }

    .slider-volume {
      width: 75px;
    }

    .time-display {
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
      color: #cbd5e1;
      padding: 0 0.25rem;
      white-space: nowrap;
    }

    /* Speed Menu Popover (SRS FR-P9) */
    .speed-menu-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .btn-speed {
      min-width: 48px;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .speed-popover {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #0b192c;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--savanna-radius, 4px);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 40;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      min-width: 140px;
    }

    :host([data-theme='light']) .speed-popover {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    :host([data-theme='high-contrast']) .speed-popover {
      background: #000000;
      border: 2px solid #ffffff;
    }

    .speed-opt-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid transparent;
      border-radius: 3px;
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.15s ease, border-color 0.15s ease;
      min-height: 36px;
      box-sizing: border-box;
    }

    :host([data-theme='light']) .speed-opt-btn {
      background: #f1f5f9;
      color: #0f172a;
    }

    .speed-opt-btn:hover,
    .speed-opt-btn:focus-visible {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      outline: 2px solid var(--savanna-focus, #005fcc);
      outline-offset: 1px;
    }

    :host([data-theme='light']) .speed-opt-btn:hover,
    :host([data-theme='light']) .speed-opt-btn:focus-visible {
      background: #e2e8f0;
      border-color: #94a3b8;
    }

    .speed-opt-btn.is-selected {
      background: var(--savanna-accent, #0f4c81);
      border-color: #ffffff;
      color: #ffffff;
      font-weight: 700;
    }

    :host([data-theme='high-contrast']) .speed-opt-btn.is-selected {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
    }

    /* Player Container Layout (Side-by-side next to video per SRS FR-P8) */
    .player-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 1.5rem;
    }

    .player-container.with-transcript {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(300px, 1fr);
      align-items: stretch;
      gap: 1.5rem;
      max-width: 100%;
    }

    .player,
    .transcript-panel {
      min-width: 0;
      max-width: 100%;
    }

    @media (max-width: 900px) {
      .player-container.with-transcript {
        display: flex;
        flex-direction: column;
      }
    }

    /* Transcript Panel (SRS FR-P8) */
    .transcript-panel {
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 520px;
      max-height: 640px;
      box-sizing: border-box;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .transcript-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #1e293b;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .transcript-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .transcript-header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .transcript-action-btn {
      min-height: 38px;
      min-width: 38px;
      padding: 0 0.65rem;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    .transcript-action-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      border-color: rgba(255, 255, 255, 0.45);
    }

    .transcript-action-btn.is-active-btn,
    .transcript-action-btn[aria-pressed='true'] {
      background: var(--savanna-accent, #0f4c81);
      border-color: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.35);
    }

    /* Redesigned Download Buttons (Requirement 2) */
    .btn-braille-transcript {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.35) !important;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
      font-weight: 700 !important;
      padding: 0 0.85rem !important;
    }

    .btn-braille-transcript:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%) !important;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.6);
      transform: translateY(-1px);
    }

    .btn-braille-badge {
      background: rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .btn-download-transcript {
      background: rgba(255, 255, 255, 0.14) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.28) !important;
      padding: 0 0.75rem !important;
    }

    .btn-download-transcript:hover {
      background: rgba(255, 255, 255, 0.24) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      transform: translateY(-1px);
    }

    .transcript-action-btn:focus-visible,
    .btn-clear-search:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
    }

    /* Manifest Error Fallback Card (SRS FR-P11, Task 1.7) */
    .manifest-error-card {
      background: #7f1d1d;
      color: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: var(--savanna-radius, 6px);
      padding: 1.5rem;
      margin: 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .error-msg {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.5;
    }

    .btn-retry {
      min-height: 44px;
      padding: 0 1.25rem;
      background: #ef4444;
      color: #ffffff;
      border: 1px solid #ffffff;
      border-radius: var(--savanna-radius, 4px);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.15s ease;
    }

    .btn-retry:hover,
    .btn-retry:focus-visible {
      background: #dc2626;
      outline: 3px solid var(--savanna-focus, #005fcc);
      outline-offset: 2px;
    }

    /* Plain-Language Summary Header (SRS FR-P8, FR-D4) */
    .transcript-summary-card {
      padding: 0.65rem 0.85rem;
      background: rgba(15, 76, 129, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .summary-badge {
      display: inline-block;
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 3px;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .summary-text {
      margin: 0;
      color: #e2e8f0;
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
    }

    /* Search Controls */
    .transcript-search-row {
      padding: 0.5rem 0.85rem;
      background: #0b192c;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      position: relative;
    }

    .transcript-search-input {
      flex: 1;
      min-height: 40px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--savanna-radius, 4px);
      color: #ffffff;
      padding: 0 2.2rem 0 0.75rem;
      font-size: 0.85rem;
      box-sizing: border-box;
      font-family: inherit;
    }

    .transcript-search-input:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 1px;
      background: rgba(255, 255, 255, 0.14);
    }

    .transcript-search-input::placeholder {
      color: #94a3b8;
    }

    .btn-clear-search {
      position: absolute;
      right: 1.15rem;
      min-height: 30px;
      min-width: 30px;
      background: transparent;
      border: none;
      color: #cbd5e1;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--savanna-radius, 4px);
    }

    .search-status-bar {
      font-size: 0.75rem;
      color: #94a3b8;
      padding: 0.25rem 0.85rem;
      background: #112239;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Scrollable Transcript Lines List */
    .transcript-lines-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.45rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .transcript-line {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.5rem 0.65rem;
      background: transparent;
      border: 1px solid transparent;
      border-left: 3px solid transparent;
      border-radius: var(--savanna-radius, 3px);
      color: #cbd5e1;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.45;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      min-height: 44px;
      box-sizing: border-box;
      width: 100%;
    }

    .transcript-line:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .transcript-line:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 1px;
      background: rgba(255, 255, 255, 0.14);
    }

    .transcript-line.is-active,
    .transcript-line[aria-current='true'] {
      background: rgba(15, 76, 129, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
      border-left: 3px solid var(--savanna-accent, #0f4c81);
      color: #ffffff;
      font-weight: 600;
    }

    .cue-timestamp {
      display: inline-block;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: #93c5fd;
      white-space: nowrap;
      margin-top: 1px;
    }

    .transcript-line.is-active .cue-timestamp,
    .transcript-line[aria-current='true'] .cue-timestamp {
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
    }

    .cue-text {
      flex: 1;
      word-break: break-word;
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
    }

    .transcript-mark {
      background: #fef08a;
      color: #0f172a;
      padding: 0 3px;
      border-radius: 2px;
      font-weight: 700;
    }

    .transcript-empty {
      padding: 1.5rem 1rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
    }
  `;

  /**
   * Resolves the active language code per Contract C4.
   * Reads component's lang attribute, falls back to document.documentElement.lang, else 'en'.
   * Normalizes 'am-ET' or any 'am*' to 'am'; any unknown code becomes 'en'.
   */
  public get activeLang(): 'en' | 'am' {
    const raw = (this.lang || (typeof document !== 'undefined' ? document.documentElement?.lang : '') || 'en')
      .trim()
      .toLowerCase();
    return raw.startsWith('am') ? 'am' : 'en';
  }

  /**
   * Looks up a translation string in the active language with English fallback,
   * replacing {placeholder} variables if provided.
   */
  public t(key: string, vars?: Record<string, string | number>): string {
    const dict = this.activeLang === 'am' ? (am as Record<string, string>) : (en as Record<string, string>);
    let text = dict[key] || (en as Record<string, string>)[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  }

  /**
   * Converts the selected caption background color and opacity to an rgba string.
   */
  private get captionBackgroundRgba(): string {
    if (this.captionBgOpacity === 0) return 'transparent';
    const hex = this.captionBgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const a = Math.max(0, Math.min(1, this.captionBgOpacity / 100));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Computes inline CSS style string for live caption rendering.
   */
  private computeCaptionStyle(): string {
    let fontRem = '1.15rem';
    if (this.captionFontSize === 150) fontRem = '1.65rem';
    else if (this.captionFontSize === 200) fontRem = '2.15rem';
    else if (this.captionFontSize === 300) fontRem = '3rem';

    return `font-size: ${fontRem}; color: ${this.captionTextColor}; background-color: ${this.captionBackgroundRgba};`;
  }

  /**
   * Loads Member 1's preferences (ui, captions) from localStorage per Contract C3.
   */
  private loadAllPreferences(): void {
    const prefs = loadPlayerPreferences();

    // 1. UI namespace
    if (prefs.ui.lang) {
      this.lang = prefs.ui.lang;
    }
    if (typeof prefs.ui.speed === 'number') {
      this.playbackRate = prefs.ui.speed;
    }
    if (prefs.ui.theme) {
      this.playerTheme = prefs.ui.theme;
      this.setAttribute('data-theme', this.playerTheme);
    }
    if (typeof prefs.ui.shortcuts === 'boolean') {
      this.disableShortcuts = !prefs.ui.shortcuts;
    }

    // 2. Captions namespace
    const c = prefs.captions;
    this.captionsShowing = c.enabled;
    this.selectedCaptionLang = c.lang;
    this.captionFontSize = c.fontSize;
    this.captionPreset = c.preset;
    this.captionTextColor = c.textColor;
    this.captionBgColor = c.bgColor;
    this.captionBgOpacity = c.bgOpacity;
    this.captionPosition = c.position;
  }

  /**
   * Persists Member 1's preferences to localStorage per Contract C3,
   * preserving all peer namespaces ('sign', 'ad', 'offline', 'jobs') untouched.
   */
  private saveAllPreferences(): void {
    const ui: UiPreferences = {
      lang: this.activeLang,
      speed: this.playbackRate,
      theme: this.playerTheme,
      shortcuts: !this.disableShortcuts,
    };
    const captions: CaptionsPreferences = {
      enabled: this.captionsShowing,
      lang: this.selectedCaptionLang,
      fontSize: this.captionFontSize,
      preset: this.captionPreset,
      textColor: this.captionTextColor,
      bgColor: this.captionBgColor,
      bgOpacity: this.captionBgOpacity,
      position: this.captionPosition,
    };
    savePlayerPreferences(ui, captions);
  }

  /** Alias for backward compatibility */
  private loadCaptionsPreferences(): void {
    this.loadAllPreferences();
  }

  /** Alias for backward compatibility */
  private saveCaptionsPreferences(): void {
    this.saveAllPreferences();
  }

  /**
   * Switches the active language per Contract C4 without requiring a page reload.
   * Fires 'savanna:lang-change' on window with detail: { lang }.
   */
  public setLanguage(newLang: 'en' | 'am'): void {
    if (this.lang === newLang) return;
    this.lang = newLang;
    this.setAttribute('lang', newLang);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = newLang;
      document.documentElement.setAttribute('lang', newLang);
    }
    this.saveAllPreferences();
    this.resolveSummary();
    this.syncTranscriptLanguage();

    // Contract C4: fires savanna:lang-change on window with detail.lang
    window.dispatchEvent(
      new CustomEvent('savanna:lang-change', {
        detail: { lang: newLang },
        bubbles: true,
        composed: true,
      })
    );

    this.announceStatus(
      this.t('player.statusLangChanged', { lang: newLang === 'am' ? 'Amharic' : 'English' }),
      newLang.toUpperCase()
    );
  }

  /**
   * Applies display theme per Contract C3 & C5 (dark, light, high-contrast).
   */
  public setTheme(newTheme: 'dark' | 'light' | 'high-contrast'): void {
    this.playerTheme = newTheme;
    this.setAttribute('data-theme', newTheme);
    this.saveAllPreferences();
    this.announceStatus(
      `Theme: ${newTheme}`,
      newTheme === 'high-contrast' ? 'AAA' : newTheme.toUpperCase()
    );
  }

  /**
   * Resets Member 1's preferences to defaults while preserving peer namespaces.
   */
  public resetPreferences(): void {
    const defaultUi = getDefaultUiPreferences();
    const defaultCap = getDefaultCaptionsPreferences();

    this.lang = defaultUi.lang;
    this.playbackRate = defaultUi.speed;
    if (this.media) this.media.playbackRate = defaultUi.speed;
    this.playerTheme = defaultUi.theme;
    this.setAttribute('data-theme', defaultUi.theme);
    this.disableShortcuts = !defaultUi.shortcuts;

    this.captionsShowing = defaultCap.enabled;
    this.selectedCaptionLang = defaultCap.lang;
    this.captionFontSize = defaultCap.fontSize;
    this.captionPreset = defaultCap.preset;
    this.captionTextColor = defaultCap.textColor;
    this.captionBgColor = defaultCap.bgColor;
    this.captionBgOpacity = defaultCap.bgOpacity;
    this.captionPosition = defaultCap.position;

    this.saveAllPreferences();
    this.resolveSummary();
    this.syncTranscriptLanguage();
    this.announceStatus(this.t('player.statusPrefsSaved'), 'Reset');
  }

  /**
   * Downloads saved preferences as JSON file (FR-A4 / NFR-S3).
   */
  public downloadMySettings(): void {
    try {
      const raw = typeof localStorage !== 'undefined' ? (localStorage.getItem('savanna.prefs.v1') || '{}') : '{}';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'savanna-preferences.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.announceStatus(this.t('player.prefDownload'), 'Export');
    } catch {
      // ignore
    }
  }

  /**
   * Clears saved preferences and resets state (FR-A4 / NFR-S3).
   */
  public deleteMySettings(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('savanna.prefs.v1');
      }
      this.resetPreferences();
      this.announceStatus(this.t('player.prefDelete'), 'Delete');
    } catch {
      // ignore
    }
  }

  /**
   * Announces an update to screen readers via a persistent polite live region
   * and optionally renders a visual HUD badge for sighted users.
   */
  public announceStatus(message: string, visualBadge?: string): void {
    // 1. Screen reader polite announcement via permanent live region
    this.liveRegionMessage = message;
    if (this.liveRegionTimeout !== null) {
      window.clearTimeout(this.liveRegionTimeout);
    }
    this.liveRegionTimeout = window.setTimeout(() => {
      this.liveRegionMessage = '';
      this.liveRegionTimeout = null;
    }, 5000);

    // 2. Visual HUD toast
    this.showToast(visualBadge || message);
  }

  private showToast(msg: string): void {
    this.statusToast = msg;
    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      this.statusToast = '';
      this.toastTimeout = null;
    }, 1500);
  }

  /**
   * Handles the global language change event per Contract C4.
   */
  private handleLangChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ lang?: string }>).detail;
    if (detail && typeof detail.lang === 'string') {
      this.lang = detail.lang;
      this.resolveSummary();
      this.syncTranscriptLanguage();
      this.requestUpdate();
    }
  };

  private handleFullscreenChange = (): void => {
    const isNowFullscreen = !!document.fullscreenElement;
    if (this.isFullscreen === isNowFullscreen) {
      return;
    }
    const wasFullscreen = this.isFullscreen;
    this.isFullscreen = isNowFullscreen;
    this.announceStatus(
      this.isFullscreen ? this.t('player.statusFullscreenOn') : this.t('player.statusFullscreenOff'),
      this.isFullscreen ? 'Fullscreen ⛶' : 'Exit Fullscreen'
    );
    // FR-P1a: Only restore focus on actual fullscreen exit/entry when focus was lost to document.body
    if (wasFullscreen !== isNowFullscreen) {
      const active = this.shadowRoot?.activeElement;
      if (!active || active === this.videoElement) {
        if (this.lastFocusedControl && this.shadowRoot?.contains(this.lastFocusedControl)) {
          this.lastFocusedControl.focus();
        } else if (this.fullscreenButtonElement) {
          this.fullscreenButtonElement.focus();
        }
      }
    }
  };

  private handleControlFocus = (e: FocusEvent): void => {
    const target = e.target as HTMLElement | null;
    if (target && (target.classList?.contains('ctrl-btn') || target.tagName === 'BUTTON' || target.tagName === 'INPUT')) {
      this.lastFocusedControl = target;
    }
  };

  /**
   * FR-P12: Formats cue text for screen readers. Bracketed non-speech cues
   * (e.g. "[music]") stay out of screen-reader live speech unless sound descriptions are enabled.
   */
  public filterCueForScreenReader(cueText: string): string {
    if (this.soundDescriptionsEnabled) {
      return cueText;
    }
    return cueText.replace(/\[.*?\]/g, '').trim();
  }

  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  private handleSeekInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const targetTime = parseFloat(input.value);
    if (!Number.isNaN(targetTime)) {
      this.seekTo(targetTime);
    }
  };

  private handleVolumeInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const pct = parseFloat(input.value);
    if (!Number.isNaN(pct) && this.media) {
      this.media.volume = Math.max(0, Math.min(1, pct / 100));
      this.volume = this.media.volume;
      if (this.media.volume > 0 && this.media.muted) {
        this.media.muted = false;
        this.isMuted = false;
      }
    }
  };

  /**
   * Toggles playback speed popover menu (SRS FR-P9).
   */
  public toggleSpeedMenu(): void {
    this.isSpeedMenuOpen = !this.isSpeedMenuOpen;
  }

  /**
   * Sets the playback rate, synchronizes media element, updates preferences and announces status (SRS FR-P9).
   */
  public setPlaybackRate(rate: number): void {
    if (Number.isNaN(rate) || rate <= 0) return;
    this.playbackRate = rate;
    if (this.media) {
      this.media.playbackRate = rate;
    }
    this.saveAllPreferences();
    this.announceStatus(this.t('player.statusSpeed', { speed: rate }), `${rate}x`);
    this.isSpeedMenuOpen = false;
  }

  private handleDocumentClick = (e: MouseEvent): void => {
    if (this.isSpeedMenuOpen) {
      const path = e.composedPath();
      const inSpeedMenu = path.some((node) => (node as HTMLElement)?.classList?.contains('speed-menu-container'));
      if (!inSpeedMenu) {
        this.isSpeedMenuOpen = false;
      }
    }
  };

  private handleWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      if (this.isSpeedMenuOpen) {
        this.isSpeedMenuOpen = false;
      }
      if (this.showHelpDialog || this.helpDialogElement?.open) {
        this.closeShortcutsDialog();
      }
      if (this.showPreferencesDialog || this.prefsDialogElement?.open) {
        this.closePreferencesDialog();
      }
    }
  };

  private handleSpeedChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const rate = parseFloat(select.value);
    if (!Number.isNaN(rate)) {
      this.setPlaybackRate(rate);
    }
  };

  /**
   * Computes human-readable wording for the position slider per SRS FR-P2.
   */
  public get positionValueText(): string {
    const cur = Math.max(0, Math.floor(this.currentTime));
    const total = Math.max(0, Math.floor(this.duration));

    if (total < 60) {
      const secUnit = cur === 1 ? this.t('player.secondSingular') : this.t('player.secondPlural');
      const totalSecUnit = total === 1 ? this.t('player.secondSingular') : this.t('player.secondPlural');
      return this.t('player.positionValueTextSeconds', {
        curSec: cur,
        secUnit,
        totalSec: total,
        totalSecUnit,
      });
    }

    const curMin = Math.floor(cur / 60);
    const curSec = cur % 60;
    const totalMin = Math.floor(total / 60);
    const minUnit = curMin === 1 ? this.t('player.minuteSingular') : this.t('player.minutePlural');
    const totalMinUnit = totalMin === 1 ? this.t('player.minuteSingular') : this.t('player.minutePlural');

    return this.t('player.positionValueText', {
      curMin,
      minUnit,
      curSec,
      totalMin,
      totalMinUnit,
    });
  }

  /**
   * Computes human-readable wording for the volume slider per SRS FR-P2.
   */
  public get volumeValueText(): string {
    const pct = this.isMuted ? 0 : Math.round(this.volume * 100);
    return this.t('player.volumeValueText', { percent: pct });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadAllPreferences();
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    this.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleWindowKeyDown);
    window.addEventListener('savanna:lang-change', this.handleLangChange);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('click', this.handleDocumentClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keydown', this.handleWindowKeyDown);
    window.removeEventListener('savanna:lang-change', this.handleLangChange);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('click', this.handleDocumentClick);
    if (this.videoElement?.textTracks) {
      this.videoElement.textTracks.removeEventListener('change', this.handleCaptionChange);
    }
    this.revokeCaptionBlobUrls();
  }

  /**
   * Safely revokes and clears any created Object URLs for caption tracks.
   */
  private revokeCaptionBlobUrls(): void {
    for (const [, blobUrl] of this.captionBlobUrls) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch { }
    }
    this.captionBlobUrls.clear();
  }

  /**
   * Ensures native text tracks remain in 'hidden' mode so that browser
   * default subtitles do not collide with our custom accessible overlay.
   */
  private suppressNativeSubtitles(): void {
    if (this.videoElement?.textTracks) {
      Array.from(this.videoElement.textTracks).forEach((t) => {
        if (t.mode === 'showing') {
          t.mode = 'hidden';
        }
      });
    }
  }

  protected override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has('lesson') || changedProps.has('api')) {
      if (this.lesson && this.api) {
        this.fetchLessonManifest();
      }
    }
    if (changedProps.has('lang')) {
      this.syncTranscriptLanguage();
    }
  }

  /**
   * Loads and parses all WebVTT caption files referenced in manifestCaptions.
   */
  private async loadVttCues(): Promise<void> {
    for (const track of this.manifestCaptions) {
      if (!track.url || this.vttCuesCache.has(track.lang)) continue;
      try {
        const resolvedUrl = resolveCaptionUrl({ urlPath: track.url, apiBase: this.api });
        const requiresAuth = shouldSendApiKey(resolvedUrl, this.apiKey, this.api);

        const result = await fetchCaptionTrack({
          url: resolvedUrl,
          apiKey: this.apiKey,
          apiBase: this.api,
          createBlobUrl: requiresAuth,
        });

        if (result.blobUrl) {
          const prevBlob = this.captionBlobUrls.get(track.lang);
          if (prevBlob) {
            try { URL.revokeObjectURL(prevBlob); } catch { }
          }
          this.captionBlobUrls.set(track.lang, result.blobUrl);
          this.requestUpdate();
        }

        const cues = parseWebVtt(result.text);
        this.vttCuesCache.set(track.lang, cues);
        if (track.lang === this.activeLang && this.transcriptLines.length === 0) {
          this.fallbackTranscriptFromCaptions();
        }
      } catch (err: any) {
        console.warn(`[savanna-player] Failed to load caption track (${track.lang}):`, err?.message || err);
      }
    }
    this.suppressNativeSubtitles();
  }

  /**
   * Fetches lesson manifest per Contract C1 & C6 and configures media sources.
   */
  private async fetchLessonManifest(): Promise<void> {
    const endpoint = `${this.api.replace(/\/$/, '')}/v1/lessons/${this.lesson}`;
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-Savanna-Key'] = this.apiKey;
      }
      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch lesson manifest: HTTP ${res.status}`);
      }
      const manifest = await res.json();
      // Cache manifest in localStorage for offline fallback (SRS FR-P11, Task 1.7)
      try {
        localStorage.setItem(`savanna.cached_manifest.${this.lesson}`, JSON.stringify(manifest));
      } catch { }

      this.manifestLoadError = false;
      this.applyManifest(manifest);
    } catch {
      // Offline fallback: check localStorage (SRS FR-P11, Task 1.7)
      let loadedFromCache = false;
      try {
        const cachedRaw = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cachedRaw) {
          const cachedManifest = JSON.parse(cachedRaw);
          this.manifestLoadError = false;
          this.applyManifest(cachedManifest);
          this.announceStatus(this.t('player.statusOfflineManifest'), 'Offline Cache');
          loadedFromCache = true;
        }
      } catch { }

      if (!loadedFromCache) {
        this.manifestLoadError = true;
        this.announceStatus(this.t('player.errorManifestLoad'), 'Network Error');
      }
    }
  }

  private applyManifest(manifest: any): void {
    this.manifestData = manifest;
    if (manifest?.title) {
      this.lessonTitle = manifest.title[this.activeLang] || manifest.title.en || '';
    }
    if (manifest?.media?.video) {
      this.src = manifest.media.video;
    }
    if (Array.isArray(manifest?.captions)) {
      this.revokeCaptionBlobUrls();
      this.manifestCaptions = manifest.captions.map((c: { lang: string; url: string }) => {
        try {
          return {
            lang: c.lang,
            url: resolveCaptionUrl({ urlPath: c.url, apiBase: this.api }),
          };
        } catch {
          return c;
        }
      });
      this.loadVttCues();
    }

    // Step 6: Derive sign and audioDescription track availability from manifest (Contract C1)
    this.hasSignTrack = manifest?.sign != null;
    this.hasAdTrack = manifest?.audioDescription != null;

    // Load interactive transcript (SRS FR-P8)
    if (manifest?.transcript?.url) {
      this.fetchTranscript(manifest.transcript.url, manifest);
    } else {
      this.fallbackTranscriptFromCaptions(manifest);
    }

    this.resolveSummary(manifest);

    // Honor null tracks by hiding/disabling slotted light DOM stubs
    if (!this.hasSignTrack) {
      const signEl = this.querySelector('savanna-sign-window, [data-sign-window]') as HTMLElement | null;
      if (signEl) signEl.hidden = true;
    }
    if (!this.hasAdTrack) {
      const adAudio = this.querySelector('audio[data-ad], audio.ad-track') as HTMLAudioElement | null;
      if (adAudio) {
        adAudio.muted = true;
        adAudio.pause();
      }
    }
  }

  /**
   * Helper to check if the active element is an editable input or textarea.
   */
  private isEditableTarget(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    );
  }

  /**
   * Accessible keyboard shortcut handler.
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // If the speed menu is open, let Escape close it
    if (this.isSpeedMenuOpen && event.key === 'Escape') {
      event.preventDefault();
      this.isSpeedMenuOpen = false;
      return;
    }

    // If the help dialog is open, let Escape or '?' close it
    if (this.showHelpDialog || this.helpDialogElement?.open) {
      if (event.key === 'Escape' || event.key === '?') {
        event.preventDefault();
        this.closeShortcutsDialog();
        return;
      }
    }

    // If the preferences / captions settings dialog is open, let Escape close it
    if (
      this.showPreferencesDialog ||
      this.prefsDialogElement?.open ||
      this.showCaptionsDialog ||
      this.captionsDialogElement?.open
    ) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closePreferencesDialog();
        return;
      }
    }

    // If the transcript panel is open, let Escape close it
    if (this.isTranscriptOpen && event.key === 'Escape') {
      event.preventDefault();
      this.toggleTranscript();
      return;
    }

    if (this.disableShortcuts) {
      return;
    }

    // Do not intercept if browser/OS modifier keys are held (Ctrl, Alt, Meta)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const target = (event.composedPath()[0] || event.target) as HTMLElement | null;

    // 1. Safety: Ignore all shortcuts if user is typing in form/editable controls
    if (this.isEditableTarget(target)) {
      return;
    }

    // 2. Safety: If focus is on a button, preserve Space and Enter for native button click
    if (target instanceof HTMLButtonElement) {
      if (event.key === ' ' || event.key === 'Enter') {
        return;
      }
    }

    switch (event.key) {
      // Play / Pause (Space or K)
      case ' ':
      case 'k':
      case 'K': {
        event.preventDefault();
        this.togglePlay();
        break;
      }

      // Seeking -5s / +5s (Left / Right Arrow)
      case 'ArrowLeft': {
        event.preventDefault();
        this.seekBy(-5);
        break;
      }

      case 'ArrowRight': {
        event.preventDefault();
        this.seekBy(5);
        break;
      }

      // Seeking -10s / +10s (J / L)
      case 'j':
      case 'J': {
        event.preventDefault();
        this.seekBy(-10);
        break;
      }

      case 'l':
      case 'L': {
        event.preventDefault();
        this.seekBy(10);
        break;
      }

      // Volume Controls (Up / Down Arrow)
      case 'ArrowUp': {
        event.preventDefault();
        this.changeVolume(0.1);
        break;
      }

      case 'ArrowDown': {
        event.preventDefault();
        this.changeVolume(-0.1);
        break;
      }

      // Mute / Unmute (M)
      case 'm':
      case 'M': {
        event.preventDefault();
        this.toggleMute();
        break;
      }

      // Toggle Captions (C)
      case 'c':
      case 'C': {
        event.preventDefault();
        this.toggleCaptions();
        break;
      }

      // Toggle Sign Window (S)
      case 's':
      case 'S': {
        event.preventDefault();
        this.toggleSignWindow();
        break;
      }

      // Toggle Audio Description (D)
      case 'd':
      case 'D': {
        event.preventDefault();
        this.toggleAudioDescription();
        break;
      }

      // Toggle Interactive Transcript (T)
      case 't':
      case 'T': {
        event.preventDefault();
        this.toggleTranscript();
        break;
      }

      // Toggle Fullscreen (F)
      case 'f':
      case 'F': {
        event.preventDefault();
        this.toggleFullscreen();
        break;
      }

      // Toggle Preferences Dialog (P)
      case 'p':
      case 'P': {
        event.preventDefault();
        this.togglePreferences('general');
        break;
      }

      // Keyboard Shortcuts Help (?)
      case '?': {
        event.preventDefault();
        this.toggleShortcutsHelp();
        break;
      }

      // Home: Seek to beginning (clamped to 0)
      case 'Home': {
        event.preventDefault();
        this.seekTo(0);
        this.announceStatus(this.t('player.statusSeek', { time: this.formatTime(0) }), '0:00 ⏪');
        break;
      }

      // End: Seek to end of video
      case 'End': {
        event.preventDefault();
        if (this.media && Number.isFinite(this.media.duration)) {
          const end = this.media.duration;
          this.seekTo(end);
          this.announceStatus(this.t('player.statusSeek', { time: this.formatTime(end) }), `${this.formatTime(end)} ⏩`);
        }
        break;
      }
    }
  };

  /**
   * Toggles play and pause on the underlying media element.
   */
  public togglePlay(): void {
    if (!this.media) return;
    if (this.media.paused || this.media.ended) {
      this.media.play().catch(() => { });
      this.isPlaying = true;
      this.announceStatus(this.t('player.statusPlay'), 'Play ▶');
    } else {
      this.media.pause();
      this.isPlaying = false;
      this.announceStatus(this.t('player.statusPause'), 'Pause ⏸');
    }
  }

  /**
   * Adjusts the volume by delta (-1.0 to 1.0) and un-mutes if volume increases.
   */
  public changeVolume(delta: number): void {
    if (!this.media) return;
    const current = this.media.volume;
    const next = Math.max(0, Math.min(1, current + delta));
    this.media.volume = Number(next.toFixed(2));
    this.volume = this.media.volume;
    if (this.media.volume > 0 && this.media.muted) {
      this.media.muted = false;
      this.isMuted = false;
    }
    const pct = Math.round(this.media.volume * 100);
    this.announceStatus(
      this.t('player.statusVolume', { percent: pct }),
      `Volume: ${pct}% 🔊`
    );
  }

  /**
   * Toggles audio mute state on the media element.
   */
  public toggleMute(): void {
    if (!this.media) return;
    this.media.muted = !this.media.muted;
    this.isMuted = this.media.muted;
    const isMutedNow = this.media.muted;
    this.announceStatus(
      isMutedNow ? this.t('player.statusMuted') : this.t('player.statusUnmuted'),
      isMutedNow ? 'Muted 🔇' : 'Unmuted 🔊'
    );
  }

  /**
   * Toggles captions display across available text tracks and fires C2 savanna:caption-change.
   */
  public toggleCaptions(): void {
    if (this.manifestCaptions.length === 0 && (!this.videoElement?.textTracks || this.videoElement.textTracks.length === 0)) {
      this.announceStatus(this.t('player.captionsUnavailable'), 'No Captions Track');
      return;
    }

    this.captionsShowing = !this.captionsShowing;

    if (this.captionsShowing) {
      if (this.selectedCaptionLang === 'off') {
        this.selectedCaptionLang = this.activeLang;
      }
      const label = this.selectedCaptionLang === 'am' ? 'Amharic' : 'English';
      this.announceStatus(this.t('player.statusCaptionsOn'), `Captions: ${label} ON`);
    } else {
      this.currentCueText = '';
      this.announceStatus(this.t('player.statusCaptionsOff'), 'Captions: OFF');
    }

    // Hide native browser cues so only our custom overlay renders
    if (this.videoElement?.textTracks) {
      Array.from(this.videoElement.textTracks).forEach((t) => (t.mode = 'hidden'));
    }

    this.saveCaptionsPreferences();
    this.emitEvent('savanna:caption-change');
  }

  /**
   * Opens the Preferences modal dialog (Contract C3/C4 & Task 1.6).
   */
  public openPreferencesDialog(tab: 'general' | 'captions' = 'general'): void {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (!dialog) return;
    this.activePrefsTab = tab;
    this.triggerElementBeforeDialog =
      (this.shadowRoot?.activeElement as HTMLElement) || this.prefsBtnElement || this.captionsSettingsBtnElement;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      this.showPreferencesDialog = true;
      this.showCaptionsDialog = true;
      const closeBtn = dialog.querySelector('.close-prefs-btn, .close-captions-btn') as HTMLElement | null;
      closeBtn?.focus();
    }
  }

  /**
   * Closes the Preferences modal dialog.
   */
  public closePreferencesDialog(): void {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (!dialog) return;
    if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
    this.showPreferencesDialog = false;
    this.showCaptionsDialog = false;
  }

  public togglePreferences(tab: 'general' | 'captions' = 'general'): void {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (dialog?.open) {
      this.closePreferencesDialog();
    } else {
      this.openPreferencesDialog(tab);
    }
  }

  /** Backward-compatibility aliases for captions settings dialog */
  public openCaptionsDialog(): void {
    this.openPreferencesDialog('captions');
  }

  public closeCaptionsDialog(): void {
    this.closePreferencesDialog();
  }

  public toggleCaptionsSettings(): void {
    this.togglePreferences('captions');
  }

  private handlePrefsDialogClose = (): void => {
    this.showPreferencesDialog = false;
    this.showCaptionsDialog = false;
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    const active = this.shadowRoot?.activeElement;
    if (!active || active === dialog || dialog?.contains(active)) {
      if (this.triggerElementBeforeDialog) {
        this.triggerElementBeforeDialog.focus();
      } else if (this.prefsBtnElement) {
        this.prefsBtnElement.focus();
      } else if (this.captionsSettingsBtnElement) {
        this.captionsSettingsBtnElement.focus();
      }
    }
    this.triggerElementBeforeDialog = null;
  };

  private handlePrefsDialogClick = (event: MouseEvent): void => {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      this.closePreferencesDialog();
    }
  };

  private handleCaptionsDialogClose = this.handlePrefsDialogClose;
  private handleCaptionsDialogClick = this.handlePrefsDialogClick;

  private handlePrefLangChange = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value as 'en' | 'am';
    this.setLanguage(val);
  };

  private handlePrefSpeedChange = (e: Event): void => {
    const val = parseFloat((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(val)) {
      this.playbackRate = val;
      if (this.media) {
        this.media.playbackRate = val;
      }
      this.saveAllPreferences();
      this.announceStatus(this.t('player.statusSpeed', { speed: val }), `${val}x`);
    }
  };

  private handlePrefThemeChange = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value as 'dark' | 'light' | 'high-contrast';
    this.setTheme(val);
  };

  private handlePrefShortcutsChange = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value === 'true';
    this.disableShortcuts = !val;
    this.saveAllPreferences();
    this.announceStatus(
      val ? this.t('player.prefShortcutsOn') : this.t('player.prefShortcutsOff'),
      val ? 'Keys: ON' : 'Keys: OFF'
    );
  };

  private handlePrefSignChange = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value === 'true';
    if (this.showSignWindow !== val) {
      this.toggleSignWindow();
    }
  };

  private handlePrefAdChange = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value === 'true';
    if (this.audioDescriptionEnabled !== val) {
      this.toggleAudioDescription();
    }
  };

  private handleCaptionTrackSelect = (e: Event): void => {
    const val = (e.target as HTMLSelectElement).value as 'en' | 'am' | 'off';
    if (val === 'off') {
      this.captionsShowing = false;
      this.selectedCaptionLang = 'off';
      this.currentCueText = '';
      this.announceStatus(this.t('player.statusCaptionsOff'), 'Captions: OFF');
    } else {
      this.selectedCaptionLang = val;
      this.captionsShowing = true;
      const label = val === 'am' ? 'Amharic' : 'English';
      this.announceStatus(this.t('player.statusCaptionsOn'), `Captions: ${label}`);
      // Refresh current cue immediately
      const cues = this.vttCuesCache.get(val) || [];
      this.currentCueText = getActiveCueText(cues, this.currentTime);
    }
    this.saveCaptionsPreferences();
    this.emitEvent('savanna:caption-change');
  };

  private handleCaptionSizeSelect = (e: Event): void => {
    const size = parseInt((e.target as HTMLSelectElement).value, 10);
    if (!Number.isNaN(size)) {
      this.captionFontSize = size;
      this.saveCaptionsPreferences();
      // FR-P3a: Polite live region announcement in active language
      const msg = this.activeLang === 'am'
        ? `የግርጌ ጽሑፍ መጠን ${size} በመቶ`
        : `Caption size ${size} percent`;
      this.announceStatus(msg);
    }
  };

  private handleCaptionPresetSelect = (e: Event): void => {
    const preset = (e.target as HTMLSelectElement).value as 'white-black' | 'yellow-black' | 'black-white' | 'custom';
    this.captionPreset = preset;
    if (preset === 'white-black') {
      this.captionTextColor = '#ffffff';
      this.captionBgColor = '#000000';
    } else if (preset === 'yellow-black') {
      this.captionTextColor = '#ffff00';
      this.captionBgColor = '#000000';
    } else if (preset === 'black-white') {
      this.captionTextColor = '#000000';
      this.captionBgColor = '#ffffff';
    }
    this.saveCaptionsPreferences();
    // FR-P3a: Polite announcement of caption style change
    const presetName = preset === 'yellow-black'
      ? (this.activeLang === 'am' ? 'ቢጫ በጥቁር ላይ' : 'Yellow on black')
      : preset === 'white-black'
        ? (this.activeLang === 'am' ? 'ነጭ በጥቁር ላይ' : 'White on black')
        : (this.activeLang === 'am' ? 'ጥቁር በነጭ ላይ' : 'Black on white');
    const msg = this.activeLang === 'am'
      ? `የግርጌ ጽሑፍ ገጽታ ${presetName}`
      : `Caption style ${presetName}`;
    this.announceStatus(msg);
  };

  private handleCaptionTextColorChange = (e: Event): void => {
    this.captionTextColor = (e.target as HTMLInputElement).value;
    this.captionPreset = 'custom';
    this.saveCaptionsPreferences();
  };

  private handleCaptionBgColorChange = (e: Event): void => {
    this.captionBgColor = (e.target as HTMLInputElement).value;
    this.captionPreset = 'custom';
    this.saveCaptionsPreferences();
  };

  private handleCaptionOpacitySelect = (e: Event): void => {
    const op = parseInt((e.target as HTMLSelectElement).value, 10);
    if (!Number.isNaN(op)) {
      this.captionBgOpacity = op;
      this.saveCaptionsPreferences();
    }
  };

  private handleCaptionPositionSelect = (e: Event): void => {
    const pos = (e.target as HTMLSelectElement).value as 'bottom' | 'top';
    this.captionPosition = pos;
    this.saveCaptionsPreferences();
  };

  /**
   * Toggles sign window visibility on any slotted sign window component (Step 6 null-safe).
   */
  public toggleSignWindow(): void {
    if (!this.hasSignTrack) {
      this.announceStatus(this.t('player.signUnavailable'), this.t('player.signUnavailable'));
      return;
    }
    this.showSignWindow = !this.showSignWindow;
    const signElement = this.querySelector(
      'savanna-sign-window, [data-sign-window]'
    ) as HTMLElement | null;
    if (signElement) {
      signElement.hidden = !this.showSignWindow;
    }
    this.announceStatus(
      this.showSignWindow ? this.t('player.statusSignOn') : this.t('player.statusSignOff'),
      this.showSignWindow ? 'Sign Window: Visible 🤟' : 'Sign Window: Hidden'
    );
  }

  /**
   * Toggles audio description state on any slotted/child audio description element (Step 6 null-safe).
   */
  public toggleAudioDescription(): void {
    if (!this.hasAdTrack) {
      this.announceStatus(this.t('player.adUnavailable'), this.t('player.adUnavailable'));
      return;
    }
    this.audioDescriptionEnabled = !this.audioDescriptionEnabled;
    const adAudio = this.querySelector(
      'audio[data-ad], audio.ad-track'
    ) as HTMLAudioElement | null;
    if (adAudio) {
      adAudio.muted = !this.audioDescriptionEnabled;
      if (this.audioDescriptionEnabled && this.media && !this.media.paused) {
        adAudio.currentTime = this.media.currentTime;
        adAudio.play().catch(() => { });
      } else {
        adAudio.pause();
      }
    }
    this.announceStatus(
      this.audioDescriptionEnabled ? this.t('player.statusAdOn') : this.t('player.statusAdOff'),
      this.audioDescriptionEnabled ? 'Audio Description: ON 🎙️' : 'Audio Description: OFF'
    );
  }

  /**
   * Toggles fullscreen on the player container.
   */
  public toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      this.requestFullscreen().catch(() => {
        if (this.videoElement && this.videoElement.requestFullscreen) {
          this.videoElement.requestFullscreen().catch(() => { });
        }
      });
    }
  }

  /**
   * Opens the keyboard shortcuts help modal dialog (Step 7).
   */
  public openShortcutsDialog(): void {
    if (!this.helpDialogElement) return;
    this.triggerElementBeforeDialog =
      (this.shadowRoot?.activeElement as HTMLElement) || this.helpButtonElement;
    if (!this.helpDialogElement.open) {
      if (typeof this.helpDialogElement.showModal === 'function') {
        this.helpDialogElement.showModal();
      } else {
        this.helpDialogElement.setAttribute('open', '');
      }
      this.showHelpDialog = true;
      const closeBtn = this.helpDialogElement.querySelector('.close-help-btn') as HTMLElement | null;
      closeBtn?.focus();
    }
  }

  /**
   * Closes the keyboard shortcuts help modal dialog (Step 7).
   */
  public closeShortcutsDialog(): void {
    if (!this.helpDialogElement) return;
    if (this.helpDialogElement.open) {
      if (typeof this.helpDialogElement.close === 'function') {
        this.helpDialogElement.close();
      } else {
        this.helpDialogElement.removeAttribute('open');
      }
    }
    this.showHelpDialog = false;
  }

  /**
   * Displays or closes the keyboard shortcuts help dialog.
   */
  public toggleShortcutsHelp(): void {
    if (this.helpDialogElement?.open) {
      this.closeShortcutsDialog();
    } else {
      this.openShortcutsDialog();
    }
  }

  private handleDialogClose = (): void => {
    this.showHelpDialog = false;
    // Restore focus to trigger element only if focus is still on/inside the dialog or lost
    const active = this.shadowRoot?.activeElement;
    if (!active || active === this.helpDialogElement || this.helpDialogElement?.contains(active)) {
      if (this.triggerElementBeforeDialog) {
        this.triggerElementBeforeDialog.focus();
      } else if (this.helpButtonElement) {
        this.helpButtonElement.focus();
      }
    }
    this.triggerElementBeforeDialog = null;
  };

  private handleDialogClick = (event: MouseEvent): void => {
    if (!this.helpDialogElement) return;
    const rect = this.helpDialogElement.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      this.closeShortcutsDialog();
    }
  };

  /**
   * Seeks relatively by a given number of seconds.
   */
  public seekBy(deltaSeconds: number): void {
    if (!this.media) return;
    const duration = Number.isFinite(this.media.duration) ? this.media.duration : Infinity;
    const newTime = Math.max(0, Math.min(this.media.currentTime + deltaSeconds, duration));
    this.media.currentTime = newTime;
    this.announceStatus(
      this.t('player.statusSeek', { time: this.formatTime(newTime) }),
      deltaSeconds > 0 ? `+${deltaSeconds}s ⏩` : `${deltaSeconds}s ⏪`
    );
  }

  /**
   * Seeks to an absolute timestamp in seconds.
   */
  public seekTo(targetSeconds: number): void {
    if (!this.media) return;
    const duration = Number.isFinite(this.media.duration) ? this.media.duration : 0;
    const newTime = Math.max(0, Math.min(targetSeconds, duration));
    this.media.currentTime = newTime;
    this.currentTime = newTime;
    const activeIdx = findActiveTranscriptLineIndex(this.transcriptLines, newTime);
    if (activeIdx !== this.activeTranscriptIndex) {
      this.activeTranscriptIndex = activeIdx;
      if (this.transcriptAutoScroll && this.isTranscriptOpen && activeIdx >= 0) {
        this.scrollActiveLineIntoView(activeIdx);
      }
    }
  }

  // Dispatch events that other components can listen to (Contract C2).
  private emitEvent(
    eventName: string,
    detail?: Record<string, unknown>,
  ): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // 1. Video starts playing.
  private handlePlay = (): void => {
    this.isPlaying = true;
    this.emitEvent('savanna:play');
  };

  // 2. Video is paused.
  private handlePause = (): void => {
    this.isPlaying = false;
    this.emitEvent('savanna:pause');
  };

  // 3. User seeks to another position (Contract C2: detail.time in seconds).
  private handleSeek = (): void => {
    if (this.media) {
      this.currentTime = this.media.currentTime;
    }
    this.emitEvent('savanna:seek', {
      time: this.media ? this.media.currentTime : 0,
    });
  };

  // 4. Playback position changes (Contract C2: detail: { time, paused, rate }).
  private handleTimeUpdate = (): void => {
    if (this.media) {
      this.currentTime = this.media.currentTime;
      if (Number.isFinite(this.media.duration) && this.media.duration > 0) {
        this.duration = this.media.duration;
      }
      // Update active caption cue from parsed VTT cues
      if (this.captionsShowing && this.selectedCaptionLang !== 'off') {
        const cues = this.vttCuesCache.get(this.selectedCaptionLang) || [];
        this.currentCueText = getActiveCueText(cues, this.currentTime);
      } else {
        this.currentCueText = '';
      }

      // Update active transcript line (SRS FR-P8)
      const activeIdx = findActiveTranscriptLineIndex(this.transcriptLines, this.currentTime);
      if (activeIdx !== this.activeTranscriptIndex) {
        this.activeTranscriptIndex = activeIdx;
        if (this.transcriptAutoScroll && this.isTranscriptOpen && activeIdx >= 0) {
          this.scrollActiveLineIntoView(activeIdx);
        }
      }
    }
    this.emitEvent('savanna:timeupdate', {
      time: this.media ? this.media.currentTime : 0,
      paused: this.media ? this.media.paused : true,
      rate: this.media ? this.media.playbackRate : 1,
    });
  };

  // 5. Active caption track changes.
  private handleCaptionChange = (): void => {
    if (this.videoElement?.textTracks) {
      const tracks = Array.from(this.videoElement.textTracks);
      tracks.forEach((t) => {
        if (t.mode === 'showing') {
          t.mode = 'hidden';
          this.captionsShowing = true;
        }
      });
    }
    this.emitEvent('savanna:caption-change');
  };

  // 6. Video encounters an error.
  private handleError = (): void => {
    this.emitEvent('savanna:error');
  };

  // Runs after Lit completes the first render.
  protected firstUpdated(): void {
    if (this.videoElement?.textTracks) {
      this.videoElement.textTracks.addEventListener(
        'change',
        this.handleCaptionChange,
      );
    }

    if (this.videoElement) {
      if (this.playbackRate) {
        this.videoElement.playbackRate = this.playbackRate;
      }
      this.videoElement.addEventListener('volumechange', () => {
        this.volume = this.videoElement.volume;
        this.isMuted = this.videoElement.muted;
      });

      this.videoElement.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(this.videoElement.duration)) {
          this.duration = this.videoElement.duration;
        }
        if (this.playbackRate) {
          this.videoElement.playbackRate = this.playbackRate;
        }
      });
    }

    if (this.lesson && this.api) {
      this.fetchLessonManifest();
    } else {
      // Standalone mode: detect light DOM slotted stubs
      this.hasSignTrack = Boolean(this.querySelector('savanna-sign-window, [data-sign-window]'));
      this.hasAdTrack = Boolean(this.querySelector('audio[data-ad], audio.ad-track'));
    }

    this.emitEvent('savanna:ready');
  }

  /**
   * Fetches transcript from the API endpoint per Contract C1 or falls back to VTT cues.
   */
  private async fetchTranscript(url: string, manifest?: any): Promise<void> {
    let targetUrl: string;
    try {
      targetUrl = resolveCaptionUrl({ urlPath: url, apiBase: this.api });
      const parsed = new URL(targetUrl);
      parsed.searchParams.set('lang', this.activeLang);
      targetUrl = parsed.href;
    } catch {
      targetUrl = url;
    }

    try {
      const headers: Record<string, string> = {};
      if (this.apiKey && shouldSendApiKey(targetUrl, this.apiKey, this.api)) {
        headers['X-Savanna-Key'] = this.apiKey;
      }
      const res = await fetch(targetUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.lines) && data.lines.length > 0) {
          const matchingVtt = this.vttCuesCache.get(this.activeLang);

          // If the API returned a different language than requested, prefer authentic VTT cues
          if (data.lang && data.lang !== this.activeLang && matchingVtt && matchingVtt.length > 0) {
            this.transcriptLines = matchingVtt.map((c) => ({ start: c.start, end: c.end, text: c.text }));
            this.resolveSummary(manifest);
            return;
          }

          // If VTT cues have more complete coverage than a partial API transcript, prefer VTT cues
          if (matchingVtt && matchingVtt.length > data.lines.length) {
            this.transcriptLines = matchingVtt.map((c) => ({ start: c.start, end: c.end, text: c.text }));
            this.resolveSummary(manifest);
            return;
          }

          // Otherwise use data.lines
          this.transcriptLines = data.lines;
          this.resolveSummary(manifest);
          return;
        }
      }
    } catch { }

    this.fallbackTranscriptFromCaptions(manifest);
  }

  /**
   * Fallback: populates transcript lines from cached or fetched WebVTT cues (FR-P8).
   */
  private fallbackTranscriptFromCaptions(manifest?: any): void {
    const cues = this.vttCuesCache.get(this.activeLang);
    if (cues && cues.length > 0) {
      this.transcriptLines = cues.map((c) => ({ start: c.start, end: c.end, text: c.text }));
    } else {
      const track = this.manifestCaptions.find((c) => c.lang === this.activeLang) || this.manifestCaptions[0];
      if (track?.url) {
        const resolvedUrl = resolveCaptionUrl({ urlPath: track.url, apiBase: this.api });
        fetchCaptionTrack({
          url: resolvedUrl,
          apiKey: this.apiKey,
          apiBase: this.api,
        })
          .then((res) => {
            const parsed = parseWebVtt(res.text);
            this.vttCuesCache.set(track.lang, parsed);
            this.transcriptLines = parsed.map((c) => ({ start: c.start, end: c.end, text: c.text }));
          })
          .catch(() => { });
      }
    }
    this.resolveSummary(manifest);
  }

  /**
   * Resolves plain-language summary and lesson title for current language (SRS FR-P8, FR-D4).
   */
  private resolveSummary(manifest?: any): void {
    const m = manifest || this.manifestData;
    let resolved = '';
    if (m?.summary) {
      if (typeof m.summary === 'object') {
        resolved = m.summary[this.activeLang] || m.summary.en || '';
      } else if (typeof m.summary === 'string') {
        resolved = m.summary;
      }
    }
    this.transcriptSummary = resolved || this.t('player.defaultSummary');
    if (m?.title) {
      this.lessonTitle = m.title[this.activeLang] || m.title.en || '';
    }
  }

  /**
   * Dynamically evaluates the plain-language summary according to current active language (SRS FR-P8, FR-P10).
   */
  private getEffectiveSummary(): string {
    const m = this.manifestData;
    if (m?.summary) {
      if (typeof m.summary === 'object') {
        return m.summary[this.activeLang] || m.summary.en || '';
      } else if (typeof m.summary === 'string') {
        return m.summary;
      }
    }
    return this.t('player.defaultSummary');
  }

  /**
   * Synchronizes transcript content when the UI language changes (Contract C4).
   */
  private syncTranscriptLanguage(): void {
    if (this.manifestData?.transcript?.url) {
      this.fetchTranscript(this.manifestData.transcript.url, this.manifestData);
    } else {
      this.fallbackTranscriptFromCaptions(this.manifestData);
    }
  }

  private scrollActiveLineIntoView(index: number): void {
    const el = this.shadowRoot?.querySelector(`.transcript-line[data-index="${index}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  public toggleTranscript = (): void => {
    this.isTranscriptOpen = !this.isTranscriptOpen;
    if (this.isTranscriptOpen) {
      if (this.transcriptLines.length === 0) {
        if (this.manifestData?.transcript?.url) {
          this.fetchTranscript(this.manifestData.transcript.url, this.manifestData);
        } else {
          this.fallbackTranscriptFromCaptions(this.manifestData);
        }
      }
      this.announceStatus(
        this.t('player.statusTranscriptOpen'),
        'Transcript 📝'
      );
      this.updateComplete.then(() => {
        this.transcriptSearchInput?.focus();
      });
    } else {
      this.announceStatus(
        this.t('player.statusTranscriptClosed'),
        'Transcript Closed'
      );
      this.transcriptBtnElement?.focus();
    }
  };

  private handleTranscriptSearchInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    this.transcriptSearchQuery = input.value;
    const filtered = filterTranscriptLines(this.transcriptLines, this.transcriptSearchQuery);
    if (this.transcriptSearchQuery.trim()) {
      if (filtered.length === 0) {
        this.announceStatus(this.t('player.transcriptNoMatches'));
      } else {
        this.announceStatus(this.t('player.transcriptMatches', { count: filtered.length }));
      }
    }
  };

  private clearTranscriptSearch = (): void => {
    this.transcriptSearchQuery = '';
    this.transcriptSearchInput?.focus();
  };

  private seekFromTranscript(start: number): void {
    this.seekTo(start);
    this.announceStatus(this.t('player.statusSeek', { time: this.formatTime(start) }));
  }

  private downloadTranscript = (): void => {
    const title = this.lessonTitle || (this.manifestData?.title ? this.manifestData.title[this.activeLang] || this.manifestData.title.en : 'Lesson');
    const content = formatTranscriptForDownload(
      title,
      this.activeLang,
      this.transcriptSummary,
      this.transcriptLines,
      (sec) => this.formatTime(sec)
    );
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.lesson || 'lesson'}-transcript-${this.activeLang}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.announceStatus(this.t('player.transcriptDownloaded'));
  };

  /**
   * Generates and downloads the transcript as a standard 40 cells x 25 lines
   * ASCII Braille (.brf) document with mandatory draft watermark notice (SRS FR-S1, Task 1.8).
   */
  private downloadBrailleTranscript = (): void => {
    const title = this.lessonTitle || (this.manifestData?.title ? this.manifestData.title[this.activeLang] || this.manifestData.title.en : 'Lesson');
    const content = formatTranscriptToBrf(
      title,
      this.activeLang,
      this.getEffectiveSummary(),
      this.transcriptLines,
      (sec) => this.formatTime(sec)
    );
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.lesson || 'lesson'}-transcript-${this.activeLang}.brf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.announceStatus(this.t('player.statusBrailleDownloaded'), 'BRF (.brf)');
  };

  private renderCueText(text: string, query: string) {
    if (!query || !query.trim()) {
      return text;
    }
    const parts = splitTextByMatch(text, query);
    return parts.map((part) =>
      part.isMatch
        ? html`<mark class="transcript-mark">${part.text}</mark>`
        : part.text
    );
  }

  private renderTranscriptPanel() {
    if (!this.isTranscriptOpen) return '';

    const filteredItems = filterTranscriptLines(this.transcriptLines, this.transcriptSearchQuery);
    const isSearching = Boolean(this.transcriptSearchQuery.trim());

    return html`
      <section
        id="transcript-panel"
        class="transcript-panel"
        aria-label=${this.t('player.transcriptTitle')}
        lang=${this.activeLang}
      >
        <!-- Panel Header -->
        <div class="transcript-header">
          <h2 class="transcript-title">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            ${this.t('player.transcriptTitle')}
          </h2>

          <div class="transcript-header-actions">
            <!-- Auto-scroll Toggle -->
            <button
              type="button"
              class="transcript-action-btn ${this.transcriptAutoScroll ? 'is-active-btn' : ''}"
              @click=${() => {
        this.transcriptAutoScroll = !this.transcriptAutoScroll;
        this.announceStatus(
          this.transcriptAutoScroll ? 'Auto-scroll on' : 'Auto-scroll off'
        );
      }}
              aria-pressed=${this.transcriptAutoScroll ? 'true' : 'false'}
              aria-label=${this.t('player.transcriptAutoScroll')}
              title=${this.t('player.transcriptAutoScroll')}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>

            <!-- Download Transcript Button (SRS FR-P8) -->
            <button
              type="button"
              class="transcript-action-btn btn-download-transcript"
              @click=${this.downloadTranscript}
              aria-label=${this.t('player.transcriptDownload')}
              title=${this.t('player.transcriptDownload')}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>${this.t('player.transcriptDownload')}</span>
            </button>

            <!-- Download Braille (.brf) Button (SRS FR-S1, Task 1.8) -->
            <button
              type="button"
              class="transcript-action-btn btn-braille-transcript"
              @click=${this.downloadBrailleTranscript}
              aria-label=${this.t('player.transcriptDownloadBraille')}
              title=${this.t('player.transcriptDownloadBraille')}
            >
              <span class="btn-braille-badge" aria-hidden="true">⠃⠗</span>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>${this.t('player.transcriptDownloadBraille')}</span>
            </button>

            <!-- Close Panel Button -->
            <button
              type="button"
              class="transcript-action-btn btn-close-transcript"
              @click=${this.toggleTranscript}
              aria-label="${this.t('player.transcriptClose')} ✕"
              title="${this.t('player.transcriptClose')} (Esc)"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Plain-Language Summary Header (SRS FR-P8 & FR-D4) -->
        ${this.getEffectiveSummary()
        ? html`
              <div class="transcript-summary-card" role="region" aria-label=${this.t('player.transcriptSummaryTitle')}>
                <span class="summary-badge">${this.t('player.transcriptSummaryTitle')}</span>
                <p class="summary-text">${this.getEffectiveSummary()}</p>
              </div>
            `
        : ''}

        <!-- Search Bar (SRS FR-P8) -->
        <div class="transcript-search-row">
          <label for="transcript-search-input" class="sr-only">
            ${this.t('player.transcriptSearch')}
          </label>
          <input
            id="transcript-search-input"
            type="search"
            class="transcript-search-input"
            placeholder=${this.t('player.transcriptSearchPlaceholder')}
            .value=${this.transcriptSearchQuery}
            @input=${this.handleTranscriptSearchInput}
          />
          ${this.transcriptSearchQuery
        ? html`
                <button
                  type="button"
                  class="btn-clear-search"
                  @click=${this.clearTranscriptSearch}
                  aria-label="${this.t('player.transcriptClearSearch')} ✕"
                >
                  ✕
                </button>
              `
        : ''}
        </div>

        ${isSearching
        ? html`
              <div class="search-status-bar" aria-live="polite">
                ${filteredItems.length === 0
            ? this.t('player.transcriptNoMatches')
            : this.t('player.transcriptMatches', { count: filteredItems.length })}
              </div>
            `
        : ''}

        <!-- Timed Cue Lines List (SRS FR-P8) -->
        <div class="transcript-lines-container" aria-label=${this.t('player.transcript')}>
          ${filteredItems.length === 0
        ? html`<div class="transcript-empty">${this.t('player.transcriptNoMatches')}</div>`
        : filteredItems.map(
          ({ line, originalIndex }) => {
            const isActive = originalIndex === this.activeTranscriptIndex;
            return html`
                    <button
                      type="button"
                      class="transcript-line ${isActive ? 'is-active' : ''}"
                      data-index=${originalIndex}
                      aria-current=${isActive ? 'true' : 'false'}
                      @click=${() => this.seekFromTranscript(line.start)}
                    >
                      <span class="cue-timestamp">${this.formatTime(line.start)}</span>
                      <span class="cue-text">${this.renderCueText(line.text, this.transcriptSearchQuery)}</span>
                    </button>
                  `;
          }
        )}
        </div>
      </section>
    `;
  }

  render() {
    return html`
      <div class="player-container ${this.isTranscriptOpen ? 'with-transcript' : ''}">
        <div class="player" @click=${() => this.focus()}>
        ${this.manifestLoadError && !this.src
        ? html`
              <div class="manifest-error-card" role="alert" aria-live="assertive">
                <p class="error-msg">⚠️ ${this.t('player.errorManifestLoad')}</p>
                <button
                  type="button"
                  class="btn-retry"
                  @click=${() => this.fetchLessonManifest()}
                  aria-label=${this.t('player.retry')}
                >
                  🔄 ${this.t('player.retry')}
                </button>
              </div>
            `
        : ''}
        <video
          src=${this.src}
          @play=${this.handlePlay}
          @pause=${this.handlePause}
          @seeking=${this.handleSeek}
          @timeupdate=${this.handleTimeUpdate}
          @error=${this.handleError}
        >
          ${this.manifestCaptions.map(
          (c) => html`
              <track
                kind="subtitles"
                srclang=${c.lang}
                src=${this.captionBlobUrls.get(c.lang) || c.url}
                label=${c.lang === 'am' ? 'Amharic' : 'English'}
                ?default=${c.lang === this.lang}
              />
            `
        )}
        </video>

        <div class="overlay">
          <slot name="overlay"></slot>
        </div>

        <!-- Custom Accessible Captions Overlay (SRS FR-P3) -->
        <div
          class="caption-overlay pos-${this.captionPosition}"
          ?hidden=${!this.captionsShowing || !this.currentCueText}
          aria-hidden="true"
        >
          <div
            class="caption-cue"
            style=${this.computeCaptionStyle()}
          >
            ${this.currentCueText}
          </div>
        </div>

        <!-- Custom Native Accessible Controls Bar (SRS FR-P2) -->
        <div
          class="player-controls"
          aria-label=${this.t('player.controlsLabel')}
          lang=${this.activeLang}
          @focusin=${this.handleControlFocus}
        >
          <!-- Play / Pause (Toggle) -->
          <button
            type="button"
            class="ctrl-btn btn-play"
            @click=${this.togglePlay}
            aria-label=${this.isPlaying ? this.t('player.pause') : this.t('player.play')}
            aria-pressed=${this.isPlaying ? 'true' : 'false'}
            title="${this.isPlaying ? this.t('player.pause') : this.t('player.play')} (K)"
          >
            ${this.isPlaying
              ? html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>`
              : html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>`
            }
          </button>

          <!-- Rewind 10s (Action) -->
          <button
            type="button"
            class="ctrl-btn btn-back10"
            @click=${() => this.seekBy(-10)}
            aria-label="${this.t('player.back10')} 10s"
            title="${this.t('player.back10')} (J)"
          >
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 2px;"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
            <span style="font-size: 0.8rem; font-weight: 700;">10s</span>
          </button>

          <!-- Position Slider -->
          <input
            type="range"
            class="ctrl-slider slider-seek"
            min="0"
            max=${Number.isFinite(this.duration) && this.duration > 0 ? this.duration : 100}
            step="0.1"
            .value=${String(this.currentTime)}
            @input=${this.handleSeekInput}
            aria-label=${this.t('player.seekSlider')}
            aria-valuetext=${this.positionValueText}
          />

          <!-- Elapsed / Total time display -->
          <span class="time-display" aria-hidden="true">
            ${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}
          </span>

          <!-- Mute Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-mute"
            @click=${this.toggleMute}
            aria-label=${this.t('player.mute')}
            aria-pressed=${this.isMuted || (this.media ? this.media.muted : false) ? 'true' : 'false'}
            title="${this.t('player.mute')} (M)"
          >
            ${this.isMuted || this.volume === 0
              ? html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>`
              : html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>`
            }
          </button>

          <!-- Volume Slider -->
          <input
            type="range"
            class="ctrl-slider slider-volume"
            min="0"
            max="100"
            step="1"
            .value=${String(this.isMuted ? 0 : Math.round(this.volume * 100))}
            @input=${this.handleVolumeInput}
            aria-label=${this.t('player.volumeSlider')}
            aria-valuetext=${this.volumeValueText}
          />

          <!-- Playback Speed Menu (SRS FR-P9 & Stable Popover Buttons) -->
          <div class="speed-menu-container">
            <button
              type="button"
              class="ctrl-btn btn-speed ${this.isSpeedMenuOpen ? 'active' : ''}"
              @click=${this.toggleSpeedMenu}
              aria-haspopup="menu"
              aria-expanded=${this.isSpeedMenuOpen ? 'true' : 'false'}
              aria-label="${this.t('player.speed')}: ${this.playbackRate === 1 ? '1.0x' : this.playbackRate + 'x'}"
              title="${this.t('player.speed')}"
            >
              ${this.playbackRate === 1 ? '1.0x' : this.playbackRate + 'x'}
            </button>
            ${this.isSpeedMenuOpen
        ? html`
                  <div
                    class="speed-popover"
                    role="menu"
                    aria-label=${this.t('player.speed')}
                  >
                    ${[0.5, 0.75, 1, 1.25, 1.5, 2].map(
          (rate) => html`
                        <button
                          type="button"
                          role="menuitemradio"
                          class="speed-opt-btn ${this.playbackRate === rate ? 'is-selected' : ''}"
                          aria-checked=${this.playbackRate === rate ? 'true' : 'false'}
                          @click=${() => this.setPlaybackRate(rate)}
                        >
                          ${rate === 1 ? `1.0x (${this.t('player.speedNormal')})` : `${rate}x`}
                        </button>
                      `
        )}
                  </div>
                `
        : ''}
          </div>

          <!-- Captions Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-captions ${this.captionsShowing ? 'active' : ''}"
            @click=${this.toggleCaptions}
            aria-label="${this.t('player.captions')} CC"
            aria-pressed=${this.captionsShowing ? 'true' : 'false'}
            aria-expanded=${this.captionsShowing ? 'true' : 'false'}
            title="${this.t('player.captions')} (C)"
            style="position: relative;"
          >
            <span style="font-weight: 800; font-size: 0.85rem; border: 1.5px solid currentColor; border-radius: 3px; padding: 1px 4px; line-height: 1;">CC</span>
            ${this.captionsShowing ? html`<span style="position: absolute; bottom: 4px; left: 10px; right: 10px; height: 2px; background: #e11d48; border-radius: 1px;"></span>` : ''}
          </button>

          <!-- Preferences / Caption Settings Dialog Trigger (SRS FR-P3, FR-P3a, Contract C3/C4) -->
          <button
            type="button"
            class="ctrl-btn btn-preferences btn-captions-settings ${this.showPreferencesDialog ? 'active' : ''}"
            @click=${() => this.togglePreferences('general')}
            aria-label=${this.t('player.captionsSettings')}
            aria-haspopup="dialog"
            aria-expanded=${this.showPreferencesDialog ? 'true' : 'false'}
            title="${this.t('player.captionsSettings')} (P)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          <!-- Interactive Transcript Toggle Button (SRS FR-P8) -->
          <button
            type="button"
            class="ctrl-btn btn-transcript ${this.isTranscriptOpen ? 'active' : ''}"
            @click=${this.toggleTranscript}
            aria-label="${this.t('player.transcript')} 📝"
            aria-expanded=${this.isTranscriptOpen ? 'true' : 'false'}
            aria-controls="transcript-panel"
            aria-pressed=${this.isTranscriptOpen ? 'true' : 'false'}
            title="${this.t('player.transcript')} (T)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </button>

          <!-- Sign Language Window Toggle (Step 6 Null-Safe) -->
          <button
            type="button"
            class="ctrl-btn btn-sign ${!this.hasSignTrack ? 'is-disabled' : ''} ${this.hasSignTrack && this.showSignWindow ? 'active' : ''}"
            @click=${this.toggleSignWindow}
            aria-label=${this.hasSignTrack
        ? `${this.t('player.sign')} ESL`
        : `${this.t('player.sign')} ESL ${this.t('player.notAvailableSuffix')}`.trim()}
            aria-disabled=${!this.hasSignTrack ? 'true' : 'false'}
            aria-expanded=${this.hasSignTrack && this.showSignWindow ? 'true' : 'false'}
            aria-pressed=${this.hasSignTrack && this.showSignWindow ? 'true' : 'false'}
            title="${this.t('player.sign')} (S)${!this.hasSignTrack ? ' ' + this.t('player.notAvailableSuffix') : ''}"
          >
            <span style="font-weight: 800; font-size: 0.8rem; border: 1.5px solid currentColor; border-radius: 4px; padding: 1px 4px; line-height: 1;">ESL</span>
          </button>

          <!-- Audio Description Toggle (Step 6 Null-Safe) -->
          <button
            type="button"
            class="ctrl-btn btn-ad ${!this.hasAdTrack ? 'is-disabled' : ''} ${this.hasAdTrack && this.audioDescriptionEnabled ? 'active' : ''}"
            @click=${this.toggleAudioDescription}
            aria-label=${this.hasAdTrack
        ? `${this.t('player.audioDescription')} AD`
        : `${this.t('player.audioDescription')} AD ${this.t('player.notAvailableSuffix')}`.trim()}
            aria-disabled=${!this.hasAdTrack ? 'true' : 'false'}
            aria-expanded=${this.hasAdTrack && this.audioDescriptionEnabled ? 'true' : 'false'}
            aria-pressed=${this.hasAdTrack && this.audioDescriptionEnabled ? 'true' : 'false'}
            title="${this.t('player.audioDescription')} (D)${!this.hasAdTrack ? ' ' + this.t('player.notAvailableSuffix') : ''}"
          >
            <span style="font-weight: 800; font-size: 0.8rem; border: 1.5px solid currentColor; border-radius: 4px; padding: 1px 4px; line-height: 1;">AD</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-fullscreen"
            @click=${this.toggleFullscreen}
            aria-label=${this.t('player.fullscreen')}
            aria-pressed=${this.isFullscreen ? 'true' : 'false'}
            title="${this.t('player.fullscreen')} (F)"
          >
            ${this.isFullscreen
              ? html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>`
              : html`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>`
            }
          </button>

          <!-- Keyboard Shortcuts Help (Step 7) -->
          <button
            type="button"
            class="ctrl-btn btn-help ${this.showHelpDialog ? 'active' : ''}"
            @click=${this.toggleShortcutsHelp}
            aria-label=${this.t('player.help')}
            aria-haspopup="dialog"
            aria-expanded=${this.showHelpDialog ? 'true' : 'false'}
            title="${this.t('player.help')} (?)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>

        <!-- Step 5: Persistent Polite Live Region (Screen Reader Only) -->
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          ${this.liveRegionMessage}
        </div>

        <!-- Step 5: Visual On-Screen HUD Notification (aria-hidden) -->
        ${this.statusToast
        ? html`<div class="status-toast" aria-hidden="true">${this.statusToast}</div>`
        : ''}

        <!-- Step 7: Native Accessible Keyboard Shortcuts Dialog Modal -->
        <dialog
          class="shortcuts-dialog"
          aria-labelledby="shortcuts-dialog-title"
          @close=${this.handleDialogClose}
          @click=${this.handleDialogClick}
        >
          <div class="shortcuts-header">
            <h2 id="shortcuts-dialog-title">${this.t('player.helpTitle')}</h2>
            <button
              type="button"
              class="close-help-btn"
              @click=${this.closeShortcutsDialog}
              aria-label=${this.t('player.closeHelp')}
            >
              ${this.t('player.closeHelp')} (Esc)
            </button>
          </div>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th scope="col">${this.t('player.helpHeaderKey')}</th>
                <th scope="col">${this.t('player.helpHeaderAction')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd>Space</kbd> / <kbd>K</kbd></td>
                <td>${this.t('player.shortcutPlayPause')}</td>
              </tr>
              <tr>
                <td><kbd>←</kbd> / <kbd>→</kbd></td>
                <td>${this.t('player.shortcutSeek5')}</td>
              </tr>
              <tr>
                <td><kbd>J</kbd> / <kbd>L</kbd></td>
                <td>${this.t('player.shortcutSeek10')}</td>
              </tr>
              <tr>
                <td><kbd>↑</kbd> / <kbd>↓</kbd></td>
                <td>${this.t('player.shortcutVolume')}</td>
              </tr>
              <tr>
                <td><kbd>M</kbd></td>
                <td>${this.t('player.shortcutMute')}</td>
              </tr>
              <tr>
                <td><kbd>C</kbd></td>
                <td>${this.t('player.shortcutCaptions')}</td>
              </tr>
              <tr>
                <td><kbd>S</kbd></td>
                <td>${this.t('player.shortcutSign')}</td>
              </tr>
              <tr>
                <td><kbd>D</kbd></td>
                <td>${this.t('player.shortcutAudioDescription')}</td>
              </tr>
              <tr>
                <td><kbd>T</kbd></td>
                <td>${this.t('player.shortcutTranscript')}</td>
              </tr>
              <tr>
                <td><kbd>F</kbd></td>
                <td>${this.t('player.shortcutFullscreen')}</td>
              </tr>
              <tr>
                <td><kbd>P</kbd></td>
                <td>${this.t('player.shortcutPreferences')}</td>
              </tr>
              <tr>
                <td><kbd>?</kbd></td>
                <td>${this.t('player.shortcutHelp')}</td>
              </tr>
              <tr>
                <td><kbd>Home</kbd> / <kbd>End</kbd></td>
                <td>${this.t('player.shortcutStartEnd')}</td>
              </tr>
            </tbody>
          </table>
        </dialog>

        <!-- Preferences Modal Dialog (Contract C3/C4, Task 1.6 & SRS FR-P9) -->
        <dialog
          class="prefs-dialog captions-dialog"
          aria-labelledby="prefs-dialog-title"
          @close=${this.handlePrefsDialogClose}
          @click=${this.handlePrefsDialogClick}
        >
          <div class="prefs-header captions-header">
            <h2 id="prefs-dialog-title">${this.t('player.preferencesTitle')}</h2>
            <button
              type="button"
              class="close-prefs-btn close-captions-btn"
              @click=${this.closePreferencesDialog}
              aria-label="${this.t('player.closePreferences')} (Esc)"
            >
              ${this.t('player.closePreferences')} (Esc)
            </button>
          </div>

          <!-- Tab list -->
          <div class="prefs-tab-bar" role="tablist" aria-label=${this.t('player.preferences')}>
            <button
              type="button"
              role="tab"
              id="tab-general"
              aria-controls="panel-general"
              aria-selected=${this.activePrefsTab === 'general' ? 'true' : 'false'}
              class="prefs-tab-btn ${this.activePrefsTab === 'general' ? 'is-active-tab' : ''}"
              @click=${() => { this.activePrefsTab = 'general'; }}
            >
              ${this.t('player.prefSectionGeneral')}
            </button>
            <button
              type="button"
              role="tab"
              id="tab-captions"
              aria-controls="panel-captions"
              aria-selected=${this.activePrefsTab === 'captions' ? 'true' : 'false'}
              class="prefs-tab-btn ${this.activePrefsTab === 'captions' ? 'is-active-tab' : ''}"
              @click=${() => { this.activePrefsTab = 'captions'; }}
            >
              ${this.t('player.prefSectionCaptions')}
            </button>
          </div>

          <!-- General Preferences Panel -->
          <div
            id="panel-general"
            role="tabpanel"
            aria-labelledby="tab-general"
            class="prefs-settings-body"
            ?hidden=${this.activePrefsTab !== 'general'}
          >
            <!-- Language Selection (Contract C4) -->
            <div class="setting-row">
              <label for="pref-lang-select">${this.t('player.prefLanguage')}:</label>
              <select
                id="pref-lang-select"
                class="ctrl-select"
                @change=${this.handlePrefLangChange}
              >
                <option value="en" ?selected=${this.activeLang === 'en'}>
                  ${this.t('player.prefLanguageEn')}
                </option>
                <option value="am" ?selected=${this.activeLang === 'am'}>
                  ${this.t('player.prefLanguageAm')}
                </option>
              </select>
            </div>

            <!-- Playback Speed -->
            <div class="setting-row">
              <label for="pref-speed-select">${this.t('player.prefSpeed')}:</label>
              <select
                id="pref-speed-select"
                class="ctrl-select"
                @change=${this.handlePrefSpeedChange}
              >
                <option value="0.5" ?selected=${this.playbackRate === 0.5}>0.5x</option>
                <option value="0.75" ?selected=${this.playbackRate === 0.75}>0.75x</option>
                <option value="1" ?selected=${this.playbackRate === 1}>1.0x (${this.t('player.speedNormal')})</option>
                <option value="1.25" ?selected=${this.playbackRate === 1.25}>1.25x</option>
                <option value="1.5" ?selected=${this.playbackRate === 1.5}>1.5x</option>
                <option value="2" ?selected=${this.playbackRate === 2}>2.0x</option>
              </select>
            </div>

            <!-- Display Theme (Contract C3/C5) -->
            <div class="setting-row">
              <label for="pref-theme-select">${this.t('player.prefTheme')}:</label>
              <select
                id="pref-theme-select"
                class="ctrl-select"
                @change=${this.handlePrefThemeChange}
              >
                <option value="dark" ?selected=${this.playerTheme === 'dark'}>
                  ${this.t('player.prefThemeDark')}
                </option>
                <option value="light" ?selected=${this.playerTheme === 'light'}>
                  ${this.t('player.prefThemeLight')}
                </option>
                <option value="high-contrast" ?selected=${this.playerTheme === 'high-contrast'}>
                  ${this.t('player.prefThemeHighContrast')}
                </option>
              </select>
            </div>

            <!-- Keyboard Shortcuts Toggle -->
            <div class="setting-row">
              <label for="pref-shortcuts-select">${this.t('player.prefShortcuts')}:</label>
              <select
                id="pref-shortcuts-select"
                class="ctrl-select"
                @change=${this.handlePrefShortcutsChange}
              >
                <option value="true" ?selected=${!this.disableShortcuts}>
                  ${this.t('player.prefShortcutsOn')}
                </option>
                <option value="false" ?selected=${this.disableShortcuts}>
                  ${this.t('player.prefShortcutsOff')}
                </option>
              </select>
            </div>

            <!-- Sign Language Window (SRS FR-P9) -->
            <div class="setting-row">
              <label for="pref-sign-select">${this.t('player.prefSignWindow')}:</label>
              <select
                id="pref-sign-select"
                class="ctrl-select"
                @change=${this.handlePrefSignChange}
                ?disabled=${!this.hasSignTrack}
              >
                <option value="true" ?selected=${this.hasSignTrack && this.showSignWindow}>
                  ${this.t('player.prefEnabled')}
                </option>
                <option value="false" ?selected=${!this.hasSignTrack || !this.showSignWindow}>
                  ${this.t('player.prefDisabled')} ${!this.hasSignTrack ? `(${this.t('player.notAvailableSuffix')})` : ''}
                </option>
              </select>
            </div>

            <!-- Audio Description (SRS FR-P9) -->
            <div class="setting-row">
              <label for="pref-ad-select">${this.t('player.prefAudioDescription')}:</label>
              <select
                id="pref-ad-select"
                class="ctrl-select"
                @change=${this.handlePrefAdChange}
                ?disabled=${!this.hasAdTrack}
              >
                <option value="true" ?selected=${this.hasAdTrack && this.audioDescriptionEnabled}>
                  ${this.t('player.prefEnabled')}
                </option>
                <option value="false" ?selected=${!this.hasAdTrack || !this.audioDescriptionEnabled}>
                  ${this.t('player.prefDisabled')} ${!this.hasAdTrack ? `(${this.t('player.notAvailableSuffix')})` : ''}
                </option>
              </select>
            </div>

            <!-- Reset, Download, Delete Buttons (FR-A4) -->
            <div class="setting-row" style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.resetPreferences}
                aria-label=${this.t('player.prefReset')}
              >
                🔄 ${this.t('player.prefReset')}
              </button>
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.downloadMySettings}
                aria-label=${this.t('player.prefDownload')}
              >
                💾 ${this.t('player.prefDownload')}
              </button>
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.deleteMySettings}
                aria-label=${this.t('player.prefDelete')}
              >
                🗑️ ${this.t('player.prefDelete')}
              </button>
            </div>
          </div>

          <!-- Captions Preferences Panel -->
          <div
            id="panel-captions"
            role="tabpanel"
            aria-labelledby="tab-captions"
            class="captions-settings-body"
            ?hidden=${this.activePrefsTab !== 'captions'}
          >
            <!-- Language Track Selection -->
            <div class="setting-row">
              <label for="cap-track-select">${this.t('player.captionsTrack')}:</label>
              <select
                id="cap-track-select"
                class="ctrl-select"
                @change=${this.handleCaptionTrackSelect}
              >
                <option value="off" ?selected=${!this.captionsShowing || this.selectedCaptionLang === 'off'}>
                  ${this.t('player.captionsTrackOff')}
                </option>
                <option value="en" ?selected=${this.captionsShowing && this.selectedCaptionLang === 'en'}>
                  ${this.t('player.captionsTrackEn')}
                </option>
                <option value="am" ?selected=${this.captionsShowing && this.selectedCaptionLang === 'am'}>
                  ${this.t('player.captionsTrackAm')}
                </option>
              </select>
            </div>

            <!-- Font Size (100% to 300%) -->
            <div class="setting-row">
              <label for="cap-size-select">${this.t('player.captionsSize')}:</label>
              <select
                id="cap-size-select"
                class="ctrl-select"
                @change=${this.handleCaptionSizeSelect}
              >
                <option value="100" ?selected=${this.captionFontSize === 100}>100% (Standard)</option>
                <option value="150" ?selected=${this.captionFontSize === 150}>150% (Medium)</option>
                <option value="200" ?selected=${this.captionFontSize === 200}>200% (Large)</option>
                <option value="300" ?selected=${this.captionFontSize === 300}>300% (Extra Large)</option>
              </select>
            </div>

            <!-- Color Presets (>= 7:1 Contrast) -->
            <div class="setting-row">
              <label for="cap-preset-select">${this.t('player.captionsColor')}:</label>
              <select
                id="cap-preset-select"
                class="ctrl-select"
                @change=${this.handleCaptionPresetSelect}
              >
                <option value="white-black" ?selected=${this.captionPreset === 'white-black'}>
                  ${this.t('player.captionsPresetWhiteBlack')} (21:1)
                </option>
                <option value="yellow-black" ?selected=${this.captionPreset === 'yellow-black'}>
                  ${this.t('player.captionsPresetYellowBlack')} (19.5:1)
                </option>
                <option value="black-white" ?selected=${this.captionPreset === 'black-white'}>
                  ${this.t('player.captionsPresetBlackWhite')} (21:1)
                </option>
                <option value="custom" ?selected=${this.captionPreset === 'custom'}>
                  ${this.t('player.captionsPresetCustom')}
                </option>
              </select>
            </div>

            ${this.captionPreset === 'custom'
        ? html`
                  <div class="setting-row custom-colors-row">
                    <label for="cap-custom-text">${this.t('player.captionsTextColor')}:</label>
                    <input
                      id="cap-custom-text"
                      type="color"
                      class="color-picker-input"
                      .value=${this.captionTextColor}
                      @input=${this.handleCaptionTextColorChange}
                      aria-label=${this.t('player.captionsTextColor')}
                    />
                    <label for="cap-custom-bg">${this.t('player.captionsBgColor')}:</label>
                    <input
                      id="cap-custom-bg"
                      type="color"
                      class="color-picker-input"
                      .value=${this.captionBgColor}
                      @input=${this.handleCaptionBgColorChange}
                      aria-label=${this.t('player.captionsBgColor')}
                    />
                  </div>
                `
        : ''}

            <!-- Background Opacity -->
            <div class="setting-row">
              <label for="cap-opacity-select">${this.t('player.captionsOpacity')}:</label>
              <select
                id="cap-opacity-select"
                class="ctrl-select"
                @change=${this.handleCaptionOpacitySelect}
              >
                <option value="100" ?selected=${this.captionBgOpacity === 100}>100%</option>
                <option value="75" ?selected=${this.captionBgOpacity === 75}>75%</option>
                <option value="50" ?selected=${this.captionBgOpacity === 50}>50%</option>
                <option value="0" ?selected=${this.captionBgOpacity === 0}>0% (Transparent)</option>
              </select>
            </div>

            <!-- Position (Bottom / Top) -->
            <div class="setting-row">
              <label for="cap-pos-select">${this.t('player.captionsPosition')}:</label>
              <select
                id="cap-pos-select"
                class="ctrl-select"
                @change=${this.handleCaptionPositionSelect}
              >
                <option value="bottom" ?selected=${this.captionPosition === 'bottom'}>
                  ${this.t('player.captionsPositionBottom')}
                </option>
                <option value="top" ?selected=${this.captionPosition === 'top'}>
                  ${this.t('player.captionsPositionTop')}
                </option>
              </select>
            </div>

            <!-- Live Preview -->
            <div class="preview-container">
              <span class="preview-label">${this.t('player.captionsPreview')}:</span>
              <div class="preview-stage">
                <div class="caption-cue" style=${this.computeCaptionStyle()}>
                  ${this.selectedCaptionLang === 'am'
        ? 'ወደ ትምህርቱ እንኳን በደህና መጡ።'
        : 'Welcome to the lesson.'}
                </div>
              </div>
            </div>
          </div>
        </dialog>
      </div>

      ${this.renderTranscriptPanel()}
    </div>
    `;
  }
}
