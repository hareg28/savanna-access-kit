import '../../../module/src/player/savanna-player.ts';
import type { SavannaPlayer } from '../../../module/src/player/savanna-player.ts';

const player = document.getElementById('lesson-player') as SavannaPlayer | null;
const eventLog = document.getElementById('event-log');
const stateText = document.getElementById('state-text');
const timeText = document.getElementById('time-text');
const durationText = document.getElementById('duration-text');
const volumeText = document.getElementById('volume-text');
const captionsText = document.getElementById('captions-text');
const signText = document.getElementById('sign-text');
const adText = document.getElementById('ad-text');
const toggleShortcuts = document.getElementById('toggle-shortcuts') as HTMLInputElement | null;
const btnLoadMock = document.getElementById('btn-load-mock');
const btnLoadStandalone = document.getElementById('btn-load-standalone');
const btnResetChecks = document.getElementById('btn-reset-checks');
const checklistScore = document.getElementById('checklist-score');

function appendLog(message: string): void {
    if (!eventLog) return;
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${message}\n`;
    eventLog.textContent = entry + eventLog.textContent;
}

// 14-item checklist tracking
const verifiedShortcuts = new Set<string>();

function markChecked(key: string): void {
    const row = document.querySelector(`.checklist-item[data-key="${key}"]`);
    if (row && !verifiedShortcuts.has(key)) {
        verifiedShortcuts.add(key);
        row.classList.add('passed');
        const statusCell = row.querySelector('.check-status');
        if (statusCell) {
            statusCell.textContent = '✓ Verified';
        }
        if (checklistScore) {
            checklistScore.textContent = `${verifiedShortcuts.size} / 14 Verified`;
        }
    }
}

function updateStateIndicators(): void {
    if (!player || !player.media) return;
    const m = player.media;

    if (stateText) {
        stateText.textContent = m.paused ? 'Paused' : 'Playing';
    }
    if (timeText) {
        timeText.textContent = `${m.currentTime.toFixed(2)}s`;
    }
    if (durationText) {
        durationText.textContent = Number.isFinite(m.duration) ? `${m.duration.toFixed(2)}s` : '--';
    }
    if (volumeText) {
        const pct = Math.round(m.volume * 100);
        volumeText.textContent = `${pct}% (${m.muted ? 'Muted' : 'Unmuted'})`;
    }
    if (captionsText) {
        const tracks = m.textTracks ? Array.from(m.textTracks) : [];
        const active = tracks.find(t => t.mode === 'showing');
        captionsText.textContent = active ? `${active.label || active.language} (${active.mode})` : 'Off';
    }
    if (signText) {
        signText.textContent = player.showSignWindow ? 'Visible' : 'Hidden';
    }
    if (adText) {
        adText.textContent = player.audioDescriptionEnabled ? 'Enabled' : 'Disabled';
    }
}

// Listen for keyboard events on player to check off test items
if (player) {
    player.addEventListener('keydown', (e) => {
        if (player.disableShortcuts) return;
        const target = e.composedPath()[0] as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
            return;
        }

        switch (e.key) {
            case 'k':
            case 'K':
                markChecked('K');
                break;
            case ' ':
                markChecked('Space');
                break;
            case 'j':
            case 'J':
                markChecked('J');
                break;
            case 'l':
            case 'L':
                markChecked('L');
                break;
            case 'ArrowLeft':
                markChecked('ArrowLeft');
                break;
            case 'ArrowRight':
                markChecked('ArrowRight');
                break;
            case 'ArrowUp':
                markChecked('ArrowUp');
                break;
            case 'ArrowDown':
                markChecked('ArrowDown');
                break;
            case 'm':
            case 'M':
                markChecked('M');
                break;
            case 'c':
            case 'C':
                markChecked('C');
                break;
            case 's':
            case 'S':
                markChecked('S');
                break;
            case 'd':
            case 'D':
                markChecked('D');
                break;
            case 'f':
            case 'F':
                markChecked('F');
                break;
            case '?':
                markChecked('?');
                break;
        }
        setTimeout(updateStateIndicators, 50);
    });
}

// C2 Events observed from the player
const eventNames = [
    'savanna:ready',
    'savanna:play',
    'savanna:pause',
    'savanna:seek',
    'savanna:timeupdate',
    'savanna:caption-change',
    'savanna:error',
];

eventNames.forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
        const detail = (event as CustomEvent).detail;
        const detailStr = detail ? JSON.stringify(detail) : 'none';

        if (eventName === 'savanna:timeupdate') {
            updateStateIndicators();
            return;
        }

        updateStateIndicators();
        appendLog(`${eventName} | detail: ${detailStr}`);
    });
});

// Toggle shortcuts property (WCAG 2.1.4 test)
if (toggleShortcuts && player) {
    toggleShortcuts.addEventListener('change', () => {
        player.disableShortcuts = toggleShortcuts.checked;
        appendLog(`Shortcuts ${toggleShortcuts.checked ? 'DISABLED' : 'ENABLED'} via disableShortcuts attribute`);
    });
}

// Switching between L-103 (Full Lesson) and L-102 (Minimal Lesson)
const btnLoadL103 = document.getElementById('btn-load-l103');
const btnLoadL102 = document.getElementById('btn-load-l102');
const pageLessonTitle = document.getElementById('page-lesson-title');
const pageLessonTitleAm = document.getElementById('page-lesson-title-am');
const badgeLessonId = document.getElementById('badge-lesson-id');
const mockDataTitle = document.getElementById('mock-data-title');
const mockRawLink = document.getElementById('mock-raw-link') as HTMLAnchorElement | null;
const mockJsonDisplay = document.getElementById('mock-json-display');
const breadcrumbLesson = document.getElementById('breadcrumb-lesson');

if (btnLoadL103 && player) {
    btnLoadL103.addEventListener('click', async () => {
        player.lesson = 'L-103';
        player.api = 'http://localhost:4010';
        player.lang = currentHostLang;
        applyHostLanguage(currentHostLang);
        if (mockDataTitle) mockDataTitle.textContent = 'Active Mock Data (contracts/fixtures/v1/lessons/L-103.json)';
        if (mockRawLink) mockRawLink.href = 'http://localhost:4010/v1/lessons/L-103';
        appendLog('Switched to L-103 (Full Lesson: Sign, AD, Captions, Pack)');

        try {
            const res = await fetch('http://localhost:4010/v1/lessons/L-103');
            if (res.ok && mockJsonDisplay) {
                const data = await res.json();
                mockJsonDisplay.textContent = JSON.stringify(data, null, 2);
            }
        } catch { }
    });
}

if (btnLoadL102 && player) {
    btnLoadL102.addEventListener('click', async () => {
        player.lesson = 'L-102';
        player.api = 'http://localhost:4010';
        player.lang = currentHostLang;
        applyHostLanguage(currentHostLang);
        if (mockDataTitle) mockDataTitle.textContent = 'Active Mock Data (contracts/fixtures/v1/lessons/L-102.json)';
        if (mockRawLink) mockRawLink.href = 'http://localhost:4010/v1/lessons/L-102';
        appendLog('Switched to L-102 (Minimal Lesson)');

        try {
            const res = await fetch('http://localhost:4010/v1/lessons/L-102');
            if (res.ok && mockJsonDisplay) {
                const data = await res.json();
                mockJsonDisplay.textContent = JSON.stringify(data, null, 2);
            }
        } catch { }
    });
}

// Contract C4: Bilingual Host Page Localization (English <-> Amharic)
let currentHostLang: 'en' | 'am' = 'en';

const hostI18n = {
    en: {
        brand: 'Learning Portal',
        learner: 'Learner: Kidus T.',
        crumbCourses: 'Courses',
        crumbTrack: 'VA-1 Foundations',
        crumbModule: 'Module 2',
        lessonTitleL103: 'The Future of the VA Industry',
        lessonTitleL102: 'Introduction to Databases',
        badgeL103: 'Module 2 · Concept 2.1 (L-103)',
        badgeL102: 'Module 1 · Lesson 102 (Minimal)',
        durationL103: 'Duration: <strong>12s (Full Lesson)</strong>',
        durationL102: 'Duration: <strong>12s (Minimal Lesson)</strong>',
        btnBefore: '← Previous Concept',
        btnLoadL103: '★ Full Lesson (L-103)',
        btnLoadL102: 'Minimal Lesson (L-102)',
        btnAfter: 'Next Concept →',
        summaryHeading: 'Lesson Summary',
        summaryCardL103: 'The Virtual Assistant profession is evolving rapidly. As businesses adopt AI and remote-first operations, routine tasks are automated while human skills—such as client care, judgment under ambiguity, and empathetic communication—become more valuable than ever.',
        summaryCardL102: 'Databases organize structured information for fast querying and reliable storage. This lesson introduces tables, keys, and accessible relational schemas.',
        kp1: '<strong>Human-in-the-loop:</strong> AI tools assist with research, drafting, and scheduling; human professionals provide trust and critical thinking.',
        kp2: '<strong>Specialization:</strong> Growing demand for specialized remote support in digital workflows, CRM management, and project coordination.',
        kp3: '<strong>Accessibility:</strong> Press <kbd>C</kbd> for captions, <kbd>S</kbd> for sign language, and <kbd>D</kbd> for Audio Description.',
        studyNotesLabel: 'Learner Study Notes:',
        studyNotesPlaceholder: 'Type personal study notes here (player shortcuts are safely disabled while typing)...',
        studyNotesAria: 'Learner study notes',
        curriculumHeading: 'Module 2 Curriculum',
        curr0: '2.0 Module Overview',
        curr1: '2.1 Evolution of Support Roles',
        curr2: '2.2 The Future of the VA Industry',
        curr2Status: 'Current',
        curr3: '2.3 AI Tools & Prompting',
        curr3Status: 'Next',
        curr4: '2.4 Case Study & Reflection',
        curr4Status: 'Upcoming',
        curr5: '2.5 Knowledge Check',
        curr5Status: 'Locked',
        detailsHeading: 'Lesson Details',
        sideTrack: 'Track: <strong>VA Foundations</strong>',
        sideAccess: 'Accessibility: <strong>ESL, AD, Captions</strong>',
        sideHint: 'Press <kbd>?</kbd> anytime on the player for keyboard shortcuts help.',
        signTitle: 'ESL Sign Window',
        signHint: '(Press S to toggle)',
        alxHeroIntro: 'Every day, artificial intelligence transforms standard administrative routines. In modern distributed workplaces, remote Virtual Assistants pair AI automation with critical human judgment, empathetic communication, and reliable client trust.',
        objectivesHeading: 'By the end of this lesson, you should be able to:',
        obj1: 'Explain the evolving role of Virtual Assistants in AI-enabled, remote-first organizations.',
        obj2: 'Describe how human judgment and empathetic communication complement automated generative tools.',
        obj3: 'Determine the strategic value of specialized workflows, CRM administration, and project coordination.',
        obj4: 'Differentiate between raw AI-generated drafts and trustworthy, client-ready deliverables.',
        obj5: 'Leverage universal accessibility accommodations (captions, sign language, and audio description) for inclusive teamwork.',
    },
    am: {
        brand: 'የትምህርት ፖርታል',
        learner: 'ተማሪ: ኪዱስ ተ.',
        crumbCourses: 'ኮርሶች',
        crumbTrack: 'VA-1 መሠረታዊ',
        crumbModule: 'ሞጁል 2',
        lessonTitleL103: 'የቨርቹዋል ረዳት ኢንዱስትሪ የወደፊት ዕጣ ፈንታ',
        lessonTitleL102: 'የመረጃ ቋቶች መግቢያ',
        badgeL103: 'ሞጁል 2 · ጽንሰ-ሀሳብ 2.1 (L-103)',
        badgeL102: 'ሞጁል 1 · ትምህርት 102 (አነስተኛ)',
        durationL103: 'የቆይታ ጊዜ: <strong>12 ሰከንድ (ሙሉ ትምህርት)</strong>',
        durationL102: 'የቆይታ ጊዜ: <strong>12 ሰከንድ (አነስተኛ ትምህርት)</strong>',
        btnBefore: '← ያለፈው ጽንሰ-ሀሳብ',
        btnLoadL103: '★ ሙሉ ትምህርት (L-103)',
        btnLoadL102: 'አነስተኛ ትምህርት (L-102)',
        btnAfter: 'ቀጣይ ጽንሰ-ሀሳብ →',
        summaryHeading: 'የትምህርት ማጠቃለያ',
        summaryCardL103: 'የቨርቹዋል ረዳት (VA) ሙያ በፍጥነት እያደገ ነው። የንግድ ድርጅቶች አርቴፊሻል ኢንተለጀንስን እና የርቀት ሥራን ሲጠቀሙ፣ የተለመዱ ተግባራት በራስ-ሰር ይሰራሉ፤ የሰው ችሎታዎች—እንደ ደንበኛ እንክብካቤ፣ ውሳኔ አሰጣጥ እና የርኅራኄ ተግባቦት—ከምንጊዜውም በላይ አስፈላጊ ይሆናሉ።',
        summaryCardL102: 'የመረጃ ቋቶች መረጃን ለፈጣን ፍለጋ እና አስተማማኝ ማከማቻ ያደራጃሉ። ይህ ትምህርት ሰንጠረዦችን፣ ቁልፎችን እና ግንኙነቶችን ያስተዋውቃል።',
        kp1: '<strong>ሰው እና ቴክኖሎጂ:</strong> የ AI መሣሪያዎች ለምርምር፣ ለረቂቅ ጽሑፍ እና ለቀጠሮ ይረዳሉ፤ የሰው ባለሙያዎች አመኔታ እና ሂሳዊ አስተሳሰብን ይሰጣሉ።',
        kp2: '<strong>ልዩ ሙያ:</strong> በዲጂታል የሥራ ፍሰት፣ በ CRM አስተዳደር እና በፕሮጀክት ቅንጅት ውስጥ የልዩ የርቀት ድጋፍ ፍላጎት እያደገ ነው።',
        kp3: '<strong>ተደራሽነት:</strong> ለግርጌ ጽሑፍ <kbd>C</kbd>ን፣ ለምልክት ቋንቋ <kbd>S</kbd>ን፣ እና ለድምጽ ማብራሪያ <kbd>D</kbd>ን ይጫኑ።',
        studyNotesLabel: 'የተማሪው የጥናት ማስታወሻዎች:',
        studyNotesPlaceholder: 'የግል ጥናት ማስታወሻዎችን እዚህ ይጻፉ (በመጻፍ ወቅት የተጫዋች አቋራጮች በደህና ይቦዝናሉ)...',
        studyNotesAria: 'የተማሪው የጥናት ማስታወሻዎች',
        curriculumHeading: 'የሞጁል 2 ይዘቶች',
        curr0: '2.0 የሞጁል አጠቃላይ እይታ',
        curr1: '2.1 የድጋፍ ሚናዎች እድገት',
        curr2: '2.2 የቨርቹዋል ረዳት ኢንዱስትሪ የወደፊት ዕጣ ፈንታ',
        curr2Status: 'ወቅታዊ',
        curr3: '2.3 የ AI መሣሪያዎች እና መጠይቆች',
        curr3Status: 'ቀጣይ',
        curr4: '2.4 የጥናት ጉዳይ እና አስተያየት',
        curr4Status: 'መጪ',
        curr5: '2.5 የእውቀት ፍተሻ',
        curr5Status: 'የተቆለፈ',
        detailsHeading: 'የትምህርት ዝርዝሮች',
        sideTrack: 'የትምህርት መስመር: <strong>VA መሠረታዊ</strong>',
        sideAccess: 'ተደራሽነት: <strong>የምልክት ቋንቋ፣ የድምጽ ማብራሪያ፣ የግርጌ ጽሑፍ</strong>',
        sideHint: 'የቁልፍ ሰሌዳ አቋራጮች እገዛ ለማግኘት በማጫወቻው ላይ በማንኛውም ጊዜ <kbd>?</kbd>ን ይጫኑ።',
        signTitle: 'የምልክት ቋንቋ መስኮት (ESL)',
        signHint: '(ለማብራት/ማጥፋት S ይጫኑ)',
        alxHeroIntro: 'በየቀኑ፣ አርቴፊሻል ኢንተለጀንስ መደበኛ የአስተዳደር ሥራዎችን ይለውጣል። በዘመናዊ የርቀት የሥራ ቦታዎች፣ የቨርቹዋል ረዳቶች የ AI አውቶሜሽንን ከሰው ልጅ ሂሳዊ ፍርድ፣ የርኅራኄ ተግባቦት እና አስተማማኝ የደንበኛ እምነት ጋር ያጣምራሉ።',
        objectivesHeading: 'በዚህ ትምህርት መጨረሻ ላይ የሚከተሉትን ማከናወን ይችላሉ፡',
        obj1: 'በ AI በተደገፉ የርቀት ድርጅቶች ውስጥ የቨርቹዋል ረዳቶችን እያደገ የመጣ ሚና ማስረዳት።',
        obj2: 'የሰው ልጅ ውሳኔ እና የርኅራኄ ተግባቦት አውቶሜትድ የሆኑ የፈጠራ መሣሪያዎችን እንዴት እንደሚያሟሉ መግለጽ።',
        obj3: 'የተለዩ የሥራ ፍሰቶች፣ የ CRM አስተዳደር እና የፕሮጀክት ቅንጅት ስልታዊ ጠቀሜታን መወሰን።',
        obj4: 'በ AI ከተዘጋጁ ያልተጣሩ ረቂቆች እና ለደንበኛ ዝግጁ ከሆኑ አስተማማኝ ውጤቶች መካከል ያለውን ልዩነት መለየት።',
        obj5: 'ሁሉን አቀፍ የቡድን ሥራን ለማሳካት ዓለም አቀፍ የተደራሽነት ማመቻቸቶችን (የግርጌ ጽሑፍ፣ የምልክት ቋንቋ እና የድምጽ ማብራሪያ) መጠቀም።',
    }
};

function applyHostLanguage(lang: 'en' | 'am'): void {
    currentHostLang = lang;
    const t = hostI18n[lang];
    const isL102 = player?.lesson === 'L-102';

    const setHtml = (id: string, html: string) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };
    const setText = (id: string, text: string) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('nav-brand-title', t.brand);
    setText('nav-learner-badge', t.learner);
    setText('crumb-courses', t.crumbCourses);
    setText('crumb-track', t.crumbTrack);
    setText('crumb-module', t.crumbModule);
    setText('breadcrumb-lesson', isL102 ? t.lessonTitleL102 : t.lessonTitleL103);
    setText('badge-lesson-id', isL102 ? t.badgeL102 : t.badgeL103);
    setHtml('lesson-duration', isL102 ? t.durationL102 : t.durationL103);
    setText('page-lesson-title', isL102 ? t.lessonTitleL102 : t.lessonTitleL103);

    setText('btn-before', t.btnBefore);
    setText('btn-load-l103', t.btnLoadL103);
    setText('btn-load-l102', t.btnLoadL102);
    setText('btn-after', t.btnAfter);

    setText('alx-hero-intro', t.alxHeroIntro);
    setText('objectives-heading', t.objectivesHeading);
    setText('obj-1', t.obj1);
    setText('obj-2', t.obj2);
    setText('obj-3', t.obj3);
    setText('obj-4', t.obj4);
    setText('obj-5', t.obj5);

    setText('summary-heading', t.summaryHeading);
    setText('summary-card-text', isL102 ? t.summaryCardL102 : t.summaryCardL103);
    setHtml('kp-1', t.kp1);
    setHtml('kp-2', t.kp2);
    setHtml('kp-3', t.kp3);

    setText('lbl-study-notes', t.studyNotesLabel);
    const testInput = document.getElementById('test-input') as HTMLInputElement | null;
    if (testInput) {
        testInput.placeholder = t.studyNotesPlaceholder;
        testInput.setAttribute('aria-label', t.studyNotesAria);
    }

    setText('sidebar-curriculum-heading', t.curriculumHeading);
    const setCurrItem = (id: string, title: string, status?: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const spans = el.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = title;
        if (spans[1] && status) spans[1].textContent = status;
    };
    setCurrItem('curr-0', t.curr0);
    setCurrItem('curr-1', t.curr1);
    setCurrItem('curr-2', t.curr2, t.curr2Status);
    setCurrItem('curr-3', t.curr3, t.curr3Status);
    setCurrItem('curr-4', t.curr4, t.curr4Status);
    setCurrItem('curr-5', t.curr5, t.curr5Status);

    setText('sidebar-details-heading', t.detailsHeading);
    setHtml('side-track', t.sideTrack);
    setHtml('side-access', t.sideAccess);
    setHtml('side-hint', t.sideHint);

    setText('mock-sign-title', t.signTitle);
    setText('mock-sign-hint', t.signHint);

    // Update navbar language switcher pill text
    const btnLangToggle = document.getElementById('btn-lang-toggle');
    if (btnLangToggle) {
        btnLangToggle.textContent = lang === 'am' ? '🌐 English (EN)' : '🌐 አማርኛ (AM)';
    }

    // FR-P10: Screen reader lang attribute tagging
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('lang', lang);
}

// Wire navbar language switcher button
const btnLangToggle = document.getElementById('btn-lang-toggle');
if (btnLangToggle && player) {
    btnLangToggle.addEventListener('click', () => {
        const nextLang = currentHostLang === 'am' ? 'en' : 'am';
        player.setLanguage(nextLang);
    });
}

// Contract C4: Listen for global language switch event
window.addEventListener('savanna:lang-change', (event: Event) => {
    const detail = (event as CustomEvent<{ lang?: 'en' | 'am' }>).detail;
    if (detail?.lang) {
        applyHostLanguage(detail.lang);
        appendLog(`Contract C4: Host page translated to ${detail.lang.toUpperCase()}`);
    }
});

// Restore saved language preference on load
try {
    const raw = localStorage.getItem('savanna.prefs.v1');
    if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ui?.lang === 'am') {
            applyHostLanguage('am');
        }
    }
} catch { }

// Reset checklist
if (btnResetChecks) {
    btnResetChecks.addEventListener('click', () => {
        verifiedShortcuts.clear();
        document.querySelectorAll('.checklist-item').forEach((row) => {
            row.classList.remove('passed');
            const statusCell = row.querySelector('.check-status');
            if (statusCell) statusCell.textContent = '∯ Not tested';
        });
        if (checklistScore) {
            checklistScore.textContent = '0 / 14 Verified';
        }
        appendLog('Reset testing checklist score.');
    });
}
