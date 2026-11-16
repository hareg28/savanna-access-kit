import { createServer } from "node:http";
import { randomBytes, createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { qrSvg } from "./qr.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = process.env.VERCEL === "1" ? process.cwd() : path.resolve(here, "../../..");
const fixtures = path.join(repo, "contracts/fixtures/v1");
const port = Number(process.env.PORT ?? 4020);
const publicBaseUrl =
  process.env.PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);
const PK = "pk_live_demo";
const SK = "sk_live_demo";
const credFile = path.join(repo, "demo/sandbox-career/harness/credentials-db.json");
const amharicContent = JSON.parse(
  readFileSync(path.join(repo, "api/src/routes/member3-amharic.json"), "utf8"),
);

// Plug-in Level 2 (deck s12): a REST API described by OpenAPI so another
// platform's engineers can integrate it. Mirrors the route-module OpenAPI
// definitions in api/src/routes/*.ts.
const openApiDoc = {
  openapi: "3.1.0",
  info: {
    title: "Savanna Career Gateway API",
    version: "1.0.0",
    description:
      "Job postings (schema.org/JobPosting), verifiable credentials (Open Badges 3.0) and hosted verification. Present a key in X-Savanna-Key.",
  },
  servers: [{ url: publicBaseUrl }],
  components: {
    securitySchemes: {
      SavannaKey: { type: "apiKey", in: "header", name: "X-Savanna-Key" },
    },
    parameters: {
      SavannaKey: {
        name: "X-Savanna-Key",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
    },
  },
  paths: {
    "/v1/jobs": {
      get: {
        summary: "List jobs",
        tags: ["Jobs"],
        parameters: [{ $ref: "#/components/parameters/SavannaKey" }],
        responses: { 200: { description: "Job list" } },
      },
    },
    "/v1/jobs/{id}": {
      get: {
        summary: "Get a job",
        tags: ["Jobs"],
        parameters: [
          { $ref: "#/components/parameters/SavannaKey" },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Job" }, 404: { description: "Missing" } },
      },
    },
    "/v1/jobs/{id}.jsonld": {
      get: {
        summary: "Job as schema.org/JobPosting JSON-LD",
        tags: ["Jobs"],
        parameters: [
          { $ref: "#/components/parameters/SavannaKey" },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "JobPosting" } },
      },
    },
    "/v1/credentials": {
      post: {
        summary: "Issue a credential (secret key)",
        tags: ["Credentials"],
        responses: { 201: { description: "Issued OpenBadgeCredential" } },
      },
    },
    "/v1/credentials/{id}": {
      get: {
        summary: "Fetch a credential as JSON-LD",
        tags: ["Credentials"],
        responses: { 200: { description: "OpenBadgeCredential" } },
      },
    },
    "/v1/credentials/{id}/pdf": {
      get: {
        summary: "Tagged certificate PDF (FR-D3)",
        tags: ["Credentials"],
        responses: { 200: { description: "application/pdf" } },
      },
    },
    "/v1/credentials/{id}/revoke": {
      post: {
        summary: "Revoke a credential (secret key)",
        tags: ["Credentials"],
        responses: { 200: { description: "Revoked" } },
      },
    },
    "/verify/{id}": {
      get: {
        summary: "Human verify page or OpenBadgeCredential JSON-LD",
        tags: ["Credentials"],
        responses: { 200: { description: "HTML or JSON-LD" } },
      },
    },
    "/verify/{id}/pdf": {
      get: {
        summary: "Public tagged certificate PDF",
        tags: ["Credentials"],
        responses: { 200: { description: "application/pdf" } },
      },
    },
  },
};

const jobsList = JSON.parse(readFileSync(path.join(fixtures, "jobs.json"), "utf8"));

// The localized fields also carry both languages under `i18n` so the demo can be
// read in Amharic or English. The flat fields stay Amharic to match the API contract.
function bilingual(en, am) {
  if (en == null && am == null) return null;
  return { en: en ?? am ?? null, am: am ?? en ?? null };
}

const jobs = Object.fromEntries(
  jobsList.jobs.map((j) => {
    const base = JSON.parse(readFileSync(path.join(fixtures, "jobs", `${j.id}.json`), "utf8"));
    const am = amharicContent.jobs[j.id] ?? {};
    return [
      j.id,
      {
        ...base,
        ...am,
        i18n: {
          title: bilingual(base.title, am.title),
          employer: bilingual(base.employer, am.employer),
          location: bilingual(base.location, am.location),
          payText: bilingual(base.payText, am.payText),
        },
      },
    ];
  }),
);
const rawSeed = JSON.parse(readFileSync(path.join(fixtures, "credentials", "C-7.json"), "utf8"));
const seedAm = amharicContent.credentials[rawSeed.id] ?? {};
const seed = {
  ...rawSeed,
  ...seedAm,
  i18n: {
    achievement: bilingual(rawSeed.achievement, seedAm.achievement),
    recipientName: bilingual(rawSeed.recipientName, seedAm.recipientName),
  },
};
let credentials = { [seed.id]: seed };
if (existsSync(credFile)) {
  credentials = { ...credentials, ...JSON.parse(readFileSync(credFile, "utf8")) };
}
if (credentials[seed.id]) {
  credentials[seed.id] = { ...credentials[seed.id], ...seedAm, i18n: seed.i18n };
}

const DEMO_JWK = {
  kty: "OKP",
  crv: "Ed25519",
  d: "nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A",
  x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
};

function saveCreds() {
  mkdirSync(path.dirname(credFile), { recursive: true });
  writeFileSync(credFile, JSON.stringify(credentials, null, 2));
}

function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const keys = Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
}

function signPayload(payload) {
  const key = createPrivateKey({ key: { ...DEMO_JWK }, format: "jwk" });
  const signature = sign(null, Buffer.from(canonical(payload)), key);
  return {
    type: "DataIntegrityProof",
    cryptosuite: "eddsa-rdfc-2022",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: "did:web:localhost%3A4020#key-1",
    proofValue: `z${signature.toString("base64url")}`,
    warning:
      "የሃካቶን ማረጋገጫ፦ ኤድ25519 በተደራጀ JSON ላይ ተመስርቷል፤ ሙሉ RDFC-1.0 አይደለም። በአገልጋይ ላይ ማረጋገጥ የሚደገፈው መንገድ ነው።",
  };
}

function statusOf(record) {
  if (record.status === "revoked") return "revoked";
  if (record.expiresAt && Date.parse(record.expiresAt) < Date.now()) return "expired";
  return "valid";
}

const PAGE_TEXT = {
  am: {
    language: "ቋንቋ",
    verifyTitle: "የምስክር ወረቀት ማረጋገጫ",
    status: "ሁኔታ",
    achievement: "ስኬት",
    recipient: "ተቀባይ",
    privateRecipient: "ስሙ በግል ተጠብቋል",
    issued: "የተሰጠበት ቀን",
    issuer: "ሰጪ",
    id: "መለያ",
    explanation: "ይህ ማረጋገጫ የምስክር ወረቀቱን ሁኔታ በሰጪው አገልጋይ ላይ ይፈትሻል።",
    proofWarning: "የኤድ25519 ፊርማው የሙከራ ስሪት ነው፤ ሙሉ RDFC-1.0 አይደለም።",
    qr: "የፈጣን ምላሽ ኮድ፤ የማረጋገጫ አገናኝ",
    copy: "የማረጋገጫ አገናኝ ቅዳ",
    copied: "አገናኙ ተቀድቷል።",
    download: "ምስክር ወረቀቱን አውርድ",
    valid: "ትክክለኛ",
    revoked: "ተሰርዟል",
    expired: "ጊዜው አልፏል",
    applyTitle: "ለሥራ ያመልክቱ",
    noTimeLimit: "በዚህ ቅጽ ላይ የጊዜ ገደብ የለም። መረጃውን አስቀምጠው በኋላ መመለስ ይችላሉ።",
    fullName: "ሙሉ ስም",
    contact: "ኢሜይል ወይም ስልክ",
    why: "ለምን ይህን ሥራ መረጡ? (በቀላል ቋንቋ መጻፍ ይችላሉ)",
    submit: "ማመልከቻውን ላክ",
    required: "እባክዎ ይሙሉ",
    submitted: "ማመልከቻው ለማሳያው በአካባቢው ተመዝግቧል። እናመሰግናለን።",
  },
  en: {
    language: "Language",
    verifyTitle: "Certificate verification",
    status: "Status",
    achievement: "Achievement",
    recipient: "Recipient",
    privateRecipient: "Name withheld for privacy",
    issued: "Issue date",
    issuer: "Issuer",
    id: "Credential ID",
    explanation: "This page checks the credential status with the issuer's server.",
    proofWarning: "The Ed25519 proof is a demo using canonical JSON, not full RDFC-1.0.",
    qr: "QR code linking to the credential verification page",
    copy: "Copy verification link",
    copied: "Link copied.",
    download: "Download certificate",
    valid: "Valid",
    revoked: "Revoked",
    expired: "Expired",
    applyTitle: "Apply for a job",
    noTimeLimit: "There is no time limit on this form. You can save the information and return later.",
    fullName: "Full name",
    contact: "Email or phone",
    why: "Why did you choose this job? (Plain language is welcome.)",
    submit: "Submit application",
    required: "Please complete",
    submitted: "Your demo application was saved locally. Thank you.",
  },
};

function pageLanguage(value) {
  return value === "en" ? "en" : "am";
}

function statusLabel(record, lang = "am") {
  const status = statusOf(record);
  const text = PAGE_TEXT[lang];
  return status === "valid" ? text.valid : status === "revoked" ? text.revoked : text.expired;
}

function toBadge(record) {
  const status = statusOf(record);
  const verifyUrl = `${publicBaseUrl}/verify/${record.id}`;
  const body = {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    ],
    id: verifyUrl,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    name: record.achievement,
    ...(record.i18n
      ? {
          i18n: {
            ...record.i18n,
            issuerName: {
              en: "Savanna Access Kit",
              am: amharicContent.issuerName,
            },
          },
        }
      : {}),
    issuer: { id: "did:web:localhost%3A4020", type: ["Profile"], name: amharicContent.issuerName },
    validFrom: record.validFrom,
    credentialStatus: {
      id: `${publicBaseUrl}/v1/credentials/${record.id}`,
      type: "BitstringStatusListEntry",
      statusPurpose: "revocation",
      status,
    },
    credentialSubject: {
      id: record.recipientRef,
      type: ["AchievementSubject"],
      identifier: record.recipientRef,
      name: record.recipientName ?? undefined,
      achievement: {
        id: `${publicBaseUrl}/achievements/${encodeURIComponent(record.achievement)}`,
        type: ["Achievement"],
        name: record.achievement,
        description: "ኮርሱን ከጨረሰ በኋላ በሳቫና ተደራሽነት ኪት የተሰጠ።",
        achievementType: "Certificate",
      },
    },
  };
  return {
    ...body,
    proof: record.proof ?? {
      type: "DataIntegrityProof",
      cryptosuite: "eddsa-rdfc-2022",
      proofPurpose: "assertionMethod",
      verificationMethod: "did:web:localhost%3A4020#key-1",
      warning:
        "በአገልጋይ ላይ ማረጋገጥ የሚደገፈው መንገድ ነው። POST /v1/credentials የኤድ25519 ማረጋገጫ ፊርማ ያያይዛል።",
    },
  };
}

function jobLd(job) {
  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    identifier: job.id,
    title: job.title,
    description: job.description.am,
    datePosted: "2026-11-12",
    validThrough: job.validThrough,
    employmentType: job.employmentType || "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.employer },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "ET" },
    },
    jobLocationType: job.remote ? "TELECOMMUTE" : "ON_SITE",
    url: `${publicBaseUrl}${job.applyUrl}`,
    directApply: true,
  };
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  const data = Buffer.isBuffer(body) || typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": type,
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, Accept, X-Savanna-Key",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

function problem(res, status, title, detail) {
  send(
    res,
    status,
    { type: "about:blank", title, status, detail },
    "application/problem+json; charset=utf-8",
  );
}

function keyOf(req) {
  return (
    req.headers["x-savanna-key"] ||
    new URL(req.url, publicBaseUrl).searchParams.get("api-key") ||
    ""
  );
}

function needPub(req, res) {
  if (keyOf(req) === PK || keyOf(req) === SK) return true;
  problem(res, 401, "Unauthorized", "Provide a valid X-Savanna-Key.");
  return false;
}

function needSec(req, res) {
  if (keyOf(req) === SK) return true;
  problem(res, 401, "Unauthorized", "A secret key is required for this action.");
  return false;
}

function mime(file) {
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".wav")) return "audio/wav";
  if (file.endsWith(".mp3")) return "audio/mpeg";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function verifyHtml(record, lang = "am") {
  const text = PAGE_TEXT[lang];
  const status = statusOf(record);
  const url = `${publicBaseUrl}/verify/${record.id}?lang=${lang}`;
  const qr = qrSvg(url, 160);
  const issued = new Date(record.issuedAt).toLocaleDateString(lang === "am" ? "am-ET-u-ca-ethiopic" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const achievement = record.i18n?.achievement?.[lang] ?? record.achievement;
  const recipient = record.i18n?.recipientName?.[lang] ?? record.recipientName ?? text.privateRecipient;
  const issuer = lang === "am" ? amharicContent.issuerName : "Savanna Access Kit";
  const pdfUrl = `/verify/${encodeURIComponent(record.id)}/pdf?lang=${lang}`;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${text.verifyTitle} — ${esc(achievement)}</title>
<style>
body{margin:0;font:1.125rem/1.5 "Noto Sans Ethiopic",Nyala,system-ui,sans-serif;color:#111;padding:1.25rem;max-width:40rem}
.status{display:inline-block;padding:.35rem .7rem;border-radius:.35rem;font-weight:700;min-height:44px;line-height:1.8}
.valid{background:#d7f5d7;color:#064b06}.revoked,.expired{background:#fde8e8;color:#7a1010}
*,*::before,*::after{box-sizing:border-box}
dl{display:grid;grid-template-columns:1fr;gap:.35rem} dt{font-weight:700;margin-top:.75rem} dd{margin:0;overflow-wrap:anywhere}
nav{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
nav a{display:inline-flex;align-items:center;min-width:44px;min-height:44px;padding:.35rem .6rem}
nav a[aria-current=page]{font-weight:700}
    button,a.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;
padding:.5rem 1rem;margin:.5rem .5rem 0 0;font:inherit;color:#fff;background:#0b5cab;border:0;border-radius:.4rem;
text-decoration:none;cursor:pointer}
:focus{outline:3px solid #0b5cab;outline-offset:2px}
</style></head><body><main>
<nav aria-label="${text.language}"><a lang="am" href="/verify/${encodeURIComponent(record.id)}?lang=am"${lang === "am" ? ' aria-current="page"' : ""}>አማርኛ</a>
<a lang="en" href="/verify/${encodeURIComponent(record.id)}?lang=en"${lang === "en" ? ' aria-current="page"' : ""}>English</a></nav>
<h1>${text.verifyTitle}</h1>
<p><span class="status ${esc(status)}">${text[status]}</span></p>
<dl>
<dt>${text.achievement}</dt><dd>${esc(achievement)}</dd>
<dt>${text.recipient}</dt><dd>${esc(recipient)}</dd>
<dt>${text.issued}</dt><dd>${esc(issued)}</dd>
<dt>${text.issuer}</dt><dd>${esc(issuer)}</dd>
<dt>${text.status}</dt><dd>${text[status]}</dd>
<dt>${text.id}</dt><dd><code>${esc(record.id)}</code></dd>
</dl>
<p>${text.explanation} ${text.proofWarning}</p>
<div>${qr}</div>
<p><button type="button" id="copy">${text.copy}</button>
<a class="button" href="${pdfUrl}">${text.download}</a></p>
<p id="copied" role="status" aria-live="polite"></p>
</main>
<script>
const url = ${JSON.stringify(url)};
document.getElementById("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(url); document.getElementById("copied").textContent = ${JSON.stringify(text.copied)}; }
  catch { document.getElementById("copied").textContent = url; }
});
</script></body></html>`;
}

function applyHtml(jobId, lang = "am") {
  const text = PAGE_TEXT[lang];
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${text.applyTitle} — ${esc(jobId)}</title>
<style>*,*::before,*::after{box-sizing:border-box}
body{font:1.125rem/1.5 "Noto Sans Ethiopic",Nyala,system-ui,sans-serif;margin:0;padding:1.25rem;max-width:40rem}
label{display:block;font-weight:700;margin-top:1rem} input,textarea{width:100%;min-height:44px;font:inherit;padding:.4rem}
button{min-height:44px;min-width:44px;font:inherit;margin-top:1rem;padding:.5rem 1rem}
.error{color:#7a1010;background:#fde8e8;padding:.75rem}:focus{outline:3px solid #0b5cab;outline-offset:2px}
nav{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
nav a{display:inline-flex;align-items:center;min-width:44px;min-height:44px;padding:.35rem .6rem}
nav a[aria-current=page]{font-weight:700}</style>
</head><body><main><nav aria-label="${text.language}"><a lang="am" href="?lang=am"${lang === "am" ? ' aria-current="page"' : ""}>አማርኛ</a>
<a lang="en" href="?lang=en"${lang === "en" ? ' aria-current="page"' : ""}>English</a></nav>
<h1>${lang === "am" ? `ለ ${esc(jobId)} የሥራ ዕድል ያመልክቱ` : `Apply for job ${esc(jobId)}`}</h1>
<p>${text.noTimeLimit}</p>
<div id="errors" class="error" hidden role="alert"></div>
<form id="apply" novalidate>
<label for="name">${text.fullName}</label><input id="name" name="name" required autocomplete="name">
<label for="contact">${text.contact}</label><input id="contact" name="contact" required autocomplete="email">
<label for="why">${text.why}</label>
<textarea id="why" name="why" rows="5" required></textarea>
<button type="submit">${text.submit}</button>
</form><p id="done" role="status" aria-live="polite"></p></main>
<script>
const form=document.getElementById("apply"); const errors=document.getElementById("errors");
const requiredText=${JSON.stringify(text.required)};
form.addEventListener("submit",(ev)=>{ev.preventDefault();
const missing=[...form.querySelectorAll("[required]")].filter(el=>!el.value.trim());
if(missing.length){errors.hidden=false; errors.textContent=requiredText+": "+missing.map(el=>{
  const label=form.querySelector("label[for='"+el.id+"']"); return label?label.textContent:el.id;
}).join(", "); missing[0].focus(); return;}
errors.hidden=true; document.getElementById("done").textContent=${JSON.stringify(text.submitted)}; form.reset();});
</script></body></html>`;
}

function sandboxHtml() {
  const jobCards = jobsList.jobs
    .map(
      (job) =>
        `<savanna-job-card job="${esc(job.id)}" api="${publicBaseUrl}" api-key="${PK}" lang="am"></savanna-job-card>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="am"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>የሳቫና የሥራ መግቢያ ማሳያ</title>
<style>
body{margin:0;font:1.125rem/1.5 "Noto Sans Ethiopic",Nyala,system-ui,sans-serif;color:#111;background:#f7f7f7}
header,main{max-width:42rem;margin:0 auto;padding:1rem}
button{min-height:44px;min-width:44px;font:inherit;margin-right:.5rem}
nav{display:flex;flex-wrap:wrap;gap:.5rem}
savanna-job-card,savanna-credential{display:block;margin:1rem 0}
:focus-visible{outline:3px solid #0b5cab;outline-offset:2px}
</style></head><body>
<header>
<nav aria-label="ቋንቋ / Language">
<button type="button" data-lang="am" lang="am" aria-pressed="true">አማርኛ</button>
<button type="button" data-lang="en" lang="en" aria-pressed="false">English</button>
</nav>
<h1 data-am="የሳቫና የሥራ መግቢያ ማሳያ" data-en="Savanna Career Gateway demo">የሳቫና የሥራ መግቢያ ማሳያ</h1>
</header>
<main>
<h2 data-am="የሥራ ዕድሎች" data-en="Job opportunities">የሥራ ዕድሎች</h2>
${jobCards}
<h2 data-am="የምስክር ወረቀት" data-en="Credential">የምስክር ወረቀት</h2>
<savanna-credential id="C-7" credential="C-7" api="${publicBaseUrl}" api-key="${PK}" lang="am"></savanna-credential>
</main>
<script type="module" src="/components/job-card.ce.js"></script>
<script type="module" src="/components/credential.ce.js"></script>
<script type="module">
const buttons = [...document.querySelectorAll("button[data-lang]")];
function setLang(lang) {
  document.documentElement.lang = lang;
  try { localStorage.setItem("savanna-career-lang", lang); } catch {}
  document.title = lang === "am" ? "የሳቫና የሥራ መግቢያ ማሳያ" : "Savanna Career Gateway demo";
  document.querySelectorAll("[data-am][data-en]").forEach((element) => {
    element.textContent = element.dataset[lang];
  });
  document.querySelectorAll("savanna-job-card, savanna-credential").forEach((element) => {
    element.setAttribute("lang", lang);
  });
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === lang)));
  window.dispatchEvent(new CustomEvent("savanna:lang-change", { detail: { lang } }));
}
document.querySelector("nav")?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lang]");
  if (button) setLang(button.dataset.lang);
});
let preferredLang = "am";
try { preferredLang = localStorage.getItem("savanna-career-lang") === "en" ? "en" : "am"; } catch {}
setLang(preferredLang);
</script>
</body></html>`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const staticFiles = {
  "/components/job-card.ce.js": path.join(repo, "module/src/job-card/job-card.ce.js"),
  "/components/credential.ce.js": path.join(
    repo,
    "module/src/credential/credential.ce.js",
  ),
};

export const handleRequest = async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      send(res, 204, "");
      return;
    }
    const url = new URL(req.url, publicBaseUrl);
    const p = url.pathname;

    if (req.method === "GET" && (p === "/" || p === "/index.html")) {
      send(res, 200, sandboxHtml(), "text/html; charset=utf-8");
      return;
    }
    if (req.method === "GET" && staticFiles[p]) {
      send(res, 200, readFileSync(staticFiles[p]), mime(staticFiles[p]));
      return;
    }
    if (req.method === "GET" && p.startsWith("/media/jobs/")) {
      const file = path.join(here, "../media/jobs", path.basename(p));
      if (!existsSync(file)) {
        problem(res, 404, "Not Found", "Audio file missing. Run node scripts/write-wav.mjs");
        return;
      }
      send(res, 200, readFileSync(file), mime(file));
      return;
    }
    if (req.method === "GET" && p === "/v1/health") {
      send(res, 200, { ok: true, slice: "career" });
      return;
    }
    if (req.method === "GET" && p === "/openapi.json") {
      send(res, 200, openApiDoc);
      return;
    }
    if (req.method === "GET" && p === "/.well-known/did.json") {
      send(
        res,
        200,
        {
          "@context": ["https://www.w3.org/ns/did/v1"],
          id: "did:web:localhost%3A4020",
          verificationMethod: [
            {
              id: "did:web:localhost%3A4020#key-1",
              type: "Multikey",
              controller: "did:web:localhost%3A4020",
              publicKeyJwk: { kty: "OKP", crv: "Ed25519", x: DEMO_JWK.x },
            },
          ],
          assertionMethod: ["did:web:localhost%3A4020#key-1"],
        },
        "application/did+json",
      );
      return;
    }
    if (req.method === "GET" && p === "/v1/jobs") {
      if (!needPub(req, res)) return;
      send(res, 200, {
        jobs: Object.values(jobs).map((job) => ({
          id: job.id,
          title: job.title,
          employer: job.employer,
          location: job.location,
          remote: job.remote,
        })),
      });
      return;
    }
    const jsonld = p.match(/^\/v1\/jobs\/([^/]+)\.jsonld$/);
    if (req.method === "GET" && jsonld) {
      if (!needPub(req, res)) return;
      const job = jobs[jsonld[1]];
      if (!job) return problem(res, 404, "Not Found", `Job ${jsonld[1]} was not found.`);
      send(res, 200, jobLd(job), "application/ld+json; charset=utf-8");
      return;
    }
    const jobOne = p.match(/^\/v1\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobOne) {
      if (!needPub(req, res)) return;
      const job = jobs[jobOne[1]];
      if (!job) return problem(res, 404, "Not Found", `Job ${jobOne[1]} was not found.`);
      send(res, 200, job);
      return;
    }
    const apply = p.match(/^\/apply\/([^/]+)$/);
    if (req.method === "GET" && apply) {
      send(res, 200, applyHtml(apply[1], pageLanguage(url.searchParams.get("lang"))), "text/html; charset=utf-8");
      return;
    }
    const credPdf = p.match(/^\/(?:v1\/credentials|verify)\/([^/]+)\/pdf$/);
    if (req.method === "GET" && credPdf) {
      if (p.startsWith("/v1/") && !needPub(req, res)) return;
      const record = credentials[credPdf[1]];
      if (!record) return problem(res, 404, "Not Found", "Credential was not found.");
      const lang = pageLanguage(url.searchParams.get("lang"));
      const { chromium } = await import("playwright");
      const launchOptions = { headless: true };
      try {
        // Use Chrome if available
        launchOptions.channel = "chrome";
      } catch {}
      const browser = await chromium.launch(launchOptions);
      try {
        const page = await browser.newPage();
        const achievement = record.i18n?.achievement?.[lang] ?? record.achievement;
        const recipient = record.i18n?.recipientName?.[lang] ?? record.recipientName ?? PAGE_TEXT[lang].privateRecipient;
        const certificateText =
          lang === "en"
            ? `<p>This certificate confirms that ${esc(recipient)} earned this achievement.</p>`
            : `<p>${esc(recipient)} ከላይ የተጠቀሰውን ስኬት እንዳጠናቀቀ ይህ ሰነድ ያረጋግጣል።</p>`;
        const certificate = verifyHtml(record, lang).replace(
          "<main>",
          `<main><article lang="${lang}"><h1>${esc(achievement)}</h1>${certificateText}<p>${PAGE_TEXT[lang].status}: ${statusLabel(record, lang)}. ${esc(`${publicBaseUrl}/verify/${record.id}?lang=${lang}`)}</p></article>`,
        );
        await page.setContent(certificate, { waitUntil: "load" });
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          displayHeaderFooter: false,
          tagged: true,
          outline: true,
        });
        res.writeHead(200, {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="credential-${record.id}-${lang}.pdf"`,
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "Content-Type, Accept, X-Savanna-Key",
          "access-control-allow-methods": "GET,POST,OPTIONS",
        });
        res.end(pdf);
      } finally {
        await browser.close();
      }
      return;
    }
    if (req.method === "POST" && p === "/v1/credentials") {
      if (!needSec(req, res)) return;
      const body = await readBody(req);
      if (!body.recipientRef || !body.achievement) {
        return problem(res, 400, "Invalid request", "Check recipientRef and achievement.");
      }
      const now = new Date().toISOString();
      const record = {
        id: randomBytes(16).toString("hex"),
        recipientRef: String(body.recipientRef),
        recipientName: body.recipientName ?? null,
        achievement: String(body.achievement),
        i18n:
          body.i18n && typeof body.i18n === "object"
            ? {
                achievement: body.i18n.achievement,
                recipientName: body.i18n.recipientName,
              }
            : undefined,
        issuedAt: now,
        validFrom: now,
        expiresAt: body.expiresAt ?? null,
        status: "valid",
        proof: null,
      };
      const badge = toBadge(record);
      record.proof = badge.proof;
      credentials[record.id] = record;
      saveCreds();
      send(res, 201, toBadge(record), "application/ld+json; charset=utf-8");
      return;
    }
    const credHtml = p.match(/^\/v1\/credentials\/([^/]+)\/html-certificate$/);
    if (req.method === "GET" && credHtml) {
      if (!needPub(req, res)) return;
      const record = credentials[credHtml[1]];
      if (!record) return problem(res, 404, "Not Found", "Credential was not found.");
      send(
        res,
        200,
        verifyHtml(record).replace(
          "<h1>የምስክር ወረቀት ማረጋገጫ</h1>",
          `<h1>${esc(record.achievement)}</h1><p>ይህን ገጽ እንደ PDF ያትሙ። ቀጥታ ሁኔታ፦ ${statusLabel(record)}።</p><h2>የምስክር ወረቀት ማረጋገጫ</h2>`,
        ),
        "text/html; charset=utf-8",
      );
      return;
    }
    const credRevoke = p.match(/^\/v1\/credentials\/([^/]+)\/revoke$/);
    if (req.method === "POST" && credRevoke) {
      if (!needSec(req, res)) return;
      const record = credentials[credRevoke[1]];
      if (!record) return problem(res, 404, "Not Found", "Credential was not found.");
      record.status = "revoked";
      saveCreds();
      send(res, 200, { id: record.id, status: statusOf(record) });
      return;
    }
    const credOne = p.match(/^\/v1\/credentials\/([^/]+)$/);
    if (req.method === "GET" && credOne) {
      if (!needPub(req, res)) return;
      const record = credentials[credOne[1]];
      if (!record) return problem(res, 404, "Not Found", "Credential was not found.");
      send(res, 200, toBadge(record), "application/ld+json; charset=utf-8");
      return;
    }
    const verify = p.match(/^\/verify\/([^/]+)$/);
    if (req.method === "GET" && verify) {
      const record = credentials[verify[1]];
      if (!record) {
        const accept = req.headers.accept || "";
        if (accept.includes("ld+json"))
          return problem(res, 404, "Not Found", "Credential was not found.");
        const lang = pageLanguage(url.searchParams.get("lang"));
        const missing =
          lang === "en"
            ? `<html lang="en"><head><meta charset="utf-8"><title>Credential not found</title></head><body><main><h1>Credential not found</h1><p>Check the link and try again.</p><a href="?lang=am" lang="am">አማርኛ</a></main></body></html>`
            : `<html lang="am"><head><meta charset="utf-8"><title>አልተገኘም</title></head><body><main><h1>የምስክር ወረቀቱ አልተገኘም</h1><p>አገናኙን ያረጋግጡና እንደገና ይሞክሩ።</p><a href="?lang=en" lang="en">English</a></main></body></html>`;
        send(
          res,
          404,
          missing,
          "text/html; charset=utf-8",
        );
        return;
      }
      if ((req.headers.accept || "").includes("ld+json")) {
        send(res, 200, toBadge(record), "application/ld+json; charset=utf-8");
        return;
      }
      send(res, 200, verifyHtml(record, pageLanguage(url.searchParams.get("lang"))), "text/html; charset=utf-8");
      return;
    }
    problem(res, 404, "Not Found", p);
  } catch (err) {
    console.error(err);
    problem(res, 500, "Server error", "The career API hit an unexpected error.");
  }
};

const server = createServer(handleRequest);

if (process.env.VERCEL !== "1") {
  server.listen(port, () => {
    console.log(`Career Gateway on ${publicBaseUrl}`);
  });
}
