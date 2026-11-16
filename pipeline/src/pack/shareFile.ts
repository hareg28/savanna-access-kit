import { createHash } from "node:crypto";

export interface CueItem {
  start: number;
  end: number;
  text: string;
}

export interface ShareLessonData {
  id: string;
  title: { en: string; am: string };
  durationSec: number;
  audioBase64: string; // Base64-encoded audio/opus data
  mimeType?: string; // e.g. "audio/opus" or "audio/ogg; codecs=opus"
  summary?: { en?: string; am?: string };
  captions?: {
    en?: CueItem[];
    am?: CueItem[];
  };
  glossary?: Array<{ term: string; definition: string }>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseVttToCues(vttText: string): CueItem[] {
  const cues: CueItem[] = [];
  const clean = vttText.replace(/\r/g, "");
  const blocks = clean.split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const timingIdx = lines.findIndex((l) => l.includes("-->"));
    if (timingIdx === -1) continue;
    const [startStr, endStr] = lines[timingIdx]!.split("-->").map((s) => s.trim().split(" ")[0]);
    if (!startStr || !endStr) continue;

    const toSec = (t: string) => {
      const parts = t.split(":");
      let s = 0;
      if (parts.length === 3) {
        s = Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
      } else if (parts.length === 2) {
        s = Number(parts[0]) * 60 + Number(parts[1]);
      }
      return Number.isFinite(s) ? s : 0;
    };

    const text = lines
      .slice(timingIdx + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text) {
      cues.push({
        start: toSec(startStr),
        end: toSec(endStr),
        text,
      });
    }
  }
  return cues;
}

export function buildShareHtml(data: ShareLessonData): string {
  const mime = data.mimeType || "audio/ogg; codecs=opus";
  const audioDataUri = `data:${mime};base64,${data.audioBase64}`;
  const enCues = data.captions?.en || [];
  const amCues = data.captions?.am || [];

  const enSummary = data.summary?.en || "In this lesson you learn about core concepts and fundamentals.";
  const amSummary = data.summary?.am || "በዚህ ትምህርት ውስጥ መሰረታዊ ጽንሰ-ሀሳቦችን ይማራሉ።";

  const payloadJson = JSON.stringify({
    title: {
      en: data.title.en,
      am: data.title.am,
    },
    summary: {
      en: enSummary,
      am: amSummary,
    },
    hints: {
      en: "You can send this file to a friend. It works without internet.",
      am: "ይህን ፋይል ለጓደኛዎ መላክ ይችላሉ። ያለ ኢንተርኔት ይሰራል።",
    },
    cues: {
      en: enCues,
      am: amCues,
    },
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title id="page-title">${escapeHtml(data.title.en)} - Savanna Lesson</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #0f172a;
      --card-bg: #f8fafc;
      --border: #cbd5e1;
      --primary: #0369a1;
      --focus: #0284c7;
      --cue-active: #e0f2fe;
      --cue-active-text: #0369a1;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b192c;
        --text: #f1f5f9;
        --card-bg: #132438;
        --border: #334155;
        --primary: #38bdf8;
        --focus: #7dd3fc;
        --cue-active: #1e3a5f;
        --cue-active-text: #e0f2fe;
      }
    }
    * { box-sizing: border-box; }
    body {
      max-width: 50rem;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      line-height: 1.6;
      background: var(--bg);
      color: var(--text);
    }
    body[lang="am"] {
      line-height: 1.75;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 2px solid var(--border);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    h1 {
      margin: 0;
      font-size: 1.6rem;
      color: var(--text);
    }
    .lang-switcher {
      display: flex;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.5rem 0.9rem;
      font-size: 0.95rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text);
      border-radius: 4px;
      cursor: pointer;
    }
    .btn:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
    .btn[aria-pressed="true"] {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }
    .banner {
      background: var(--card-bg);
      border-left: 4px solid var(--primary);
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: 0 4px 4px 0;
      font-size: 0.95rem;
    }
    .summary-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
    }
    .summary-card h2 {
      margin-top: 0;
      font-size: 1.15rem;
    }
    .player-section {
      margin-bottom: 1.5rem;
    }
    audio {
      width: 100%;
      height: 48px;
      margin-top: 0.5rem;
    }
    .caption-box {
      min-height: 2.8rem;
      padding: 0.6rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .transcript-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .cue-btn {
      width: 100%;
      text-align: left;
      padding: 0.6rem 0.8rem;
      font-size: 0.95rem;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      display: flex;
      gap: 0.75rem;
      transition: background 0.15s;
    }
    .cue-btn:hover {
      background: var(--card-bg);
    }
    .cue-btn:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 1px;
    }
    .cue-btn[aria-current="true"] {
      background: var(--cue-active);
      color: var(--cue-active-text);
      font-weight: 600;
      border-color: var(--primary);
    }
    .cue-time {
      font-family: monospace;
      opacity: 0.75;
      flex-shrink: 0;
    }
  </style>
</head>
<body lang="en">
  <header>
    <h1 id="lesson-h1">${escapeHtml(data.title.en)}</h1>
    <div class="lang-switcher" role="group" aria-label="Language switch">
      <button id="btn-en" class="btn" aria-pressed="true" onclick="setLang('en')">English</button>
      <button id="btn-am" class="btn" aria-pressed="false" onclick="setLang('am')">አማርኛ</button>
    </div>
  </header>

  <aside class="banner" id="download-hint" role="note">
    You can send this file to a friend. It works without internet.
  </aside>

  <section class="summary-card" aria-labelledby="summary-heading">
    <h2 id="summary-heading">Summary</h2>
    <p id="summary-text">${escapeHtml(enSummary)}</p>
  </section>

  <section class="player-section" aria-label="Audio player and live captions">
    <div class="caption-box" id="caption-live" aria-live="polite">
      (Captions will appear here when audio plays)
    </div>
    <audio id="lesson-audio" controls preload="metadata" src="${audioDataUri}">
      Your browser does not support audio playback.
    </audio>
  </section>

  <section aria-labelledby="transcript-heading">
    <h2 id="transcript-heading">Interactive Transcript</h2>
    <ul class="transcript-list" id="transcript-list" role="list">
    </ul>
  </section>

  <script id="lesson-payload" type="application/json">${payloadJson}</script>
  <script>
    (function() {
      var data = JSON.parse(document.getElementById('lesson-payload').textContent);
      var currentLang = 'en';
      var audio = document.getElementById('lesson-audio');
      var captionLive = document.getElementById('caption-live');
      var transcriptList = document.getElementById('transcript-list');
      var lessonH1 = document.getElementById('lesson-h1');
      var pageTitle = document.getElementById('page-title');
      var summaryText = document.getElementById('summary-text');
      var summaryHeading = document.getElementById('summary-heading');
      var transcriptHeading = document.getElementById('transcript-heading');
      var downloadHint = document.getElementById('download-hint');
      var btnEn = document.getElementById('btn-en');
      var btnAm = document.getElementById('btn-am');

      function formatTime(sec) {
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }

      window.setLang = function(lang) {
        currentLang = lang;
        document.body.setAttribute('lang', lang);
        document.documentElement.setAttribute('lang', lang);
        btnEn.setAttribute('aria-pressed', lang === 'en');
        btnAm.setAttribute('aria-pressed', lang === 'am');

        var title = data.title[lang] || data.title.en;
        lessonH1.textContent = title;
        pageTitle.textContent = title + ' - Savanna Lesson';

        summaryHeading.textContent = lang === 'am' ? 'ማጠቃለያ' : 'Summary';
        summaryText.textContent = data.summary[lang] || data.summary.en;
        transcriptHeading.textContent = lang === 'am' ? 'የጽሑፍ ግልባጭ' : 'Interactive Transcript';
        downloadHint.textContent = data.hints[lang] || data.hints.en;

        renderTranscript();
        updateActiveCue();
      };

      function renderTranscript() {
        transcriptList.innerHTML = '';
        var cues = data.cues[currentLang] || data.cues.en || [];
        cues.forEach(function(cue, index) {
          var li = document.createElement('li');
          var btn = document.createElement('button');
          btn.className = 'cue-btn';
          btn.id = 'cue-btn-' + index;
          btn.setAttribute('aria-current', 'false');
          btn.onclick = function() {
            audio.currentTime = cue.start + 0.05;
            audio.play();
          };

          var timeSpan = document.createElement('span');
          timeSpan.className = 'cue-time';
          timeSpan.textContent = '[' + formatTime(cue.start) + ']';

          var textSpan = document.createElement('span');
          textSpan.textContent = cue.text;

          btn.appendChild(timeSpan);
          btn.appendChild(textSpan);
          li.appendChild(btn);
          transcriptList.appendChild(li);
        });
      }

      function updateActiveCue() {
        var t = audio.currentTime;
        var cues = data.cues[currentLang] || data.cues.en || [];
        var activeCue = null;
        var activeIdx = -1;

        for (var i = 0; i < cues.length; i++) {
          var c = cues[i];
          var btn = document.getElementById('cue-btn-' + i);
          if (t >= c.start && t < c.end) {
            activeCue = c;
            activeIdx = i;
            if (btn) btn.setAttribute('aria-current', 'true');
          } else {
            if (btn) btn.setAttribute('aria-current', 'false');
          }
        }

        if (activeCue) {
          captionLive.textContent = activeCue.text;
        } else {
          captionLive.textContent = currentLang === 'am' ? '(ድምጽ ሲጫወት ንዑስ ርዕሶች እዚህ ይታያሉ)' : '(Captions will appear here when audio plays)';
        }
      }

      audio.addEventListener('timeupdate', updateActiveCue);
      window.setLang('en');
    })();
  </script>
</body>
</html>`;
}

export function computeFileChecksum(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
