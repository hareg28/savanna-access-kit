# Savanna Access Kit — Integration Guide (Levels 1, 2, 3)

The Savanna Access Kit is designed as an un-opinionated, lightweight module that integrates cleanly at three levels:
- **Level 1 (Script Tag):** Drop-in custom elements on any client web page with zero host dependencies.
- **Level 2 (REST API):** Typed, versioned backend endpoints with an OpenAPI 3.1 contract and SDK.
- **Level 3 (Open Standards):** Cryptographic Open Badges 3.0 verifiable credentials and schema.org JobPosting JSON-LD.

---

## Level 1: Client Web Components (Script Tag)

### 1. Installation
Include the single production module bundle in your HTML `<head>`:

```html
<!-- Load the unified component bundle -->
<script type="module" src="https://cdn.example.org/savanna-access.v1.js"></script>
```

### 2. Placement

#### A. Accessible Learning Media (`<savanna-player>`)
```html
<savanna-player
  id="lesson-player"
  lesson="L-102"
  lang="am"
  api="https://api.example.org"
  api-key="pk_live_xxx"
>
  <!-- Slotted Ethiopian Sign Language Window -->
  <savanna-sign-window slot="overlay"></savanna-sign-window>

  <!-- Synchronized Audio Description -->
  <savanna-audio-description></savanna-audio-description>

  <!-- Offline Pack Downloader -->
  <savanna-offline api="https://api.example.org" api-key="pk_live_xxx" lesson-id="L-102"></savanna-offline>
</savanna-player>
```

**Attributes:**
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `lesson` | string | required | Lesson identifier (e.g. `L-102`). |
| `lang` | string | `"en"` | Active language (`"am"` or `"en"`). Spoken captions and UI adapt instantly. |
| `api` | string | `""` | Base URL of the Access API. |
| `api-key` | string | `""` | Publishable key (origin-restricted, e.g. `pk_live_...`). |

#### B. Career Gateway (`<savanna-job-card>` & `<savanna-credential>`)
```html
<!-- Accessible Job Card with pre-rendered Audio Summary -->
<savanna-job-card
  job="J-9"
  lang="am"
  api="https://api.example.org"
  api-key="pk_live_xxx"
></savanna-job-card>

<!-- Cryptographic Verifiable Credential Badge -->
<savanna-credential
  id="C-7"
  lang="am"
  api="https://api.example.org"
  api-key="pk_live_xxx"
></savanna-credential>
```

### 3. Events Out (Contract C2)
All components dispatch bubbles & composed CustomEvents that the host can listen for:

```javascript
// Listen to media lifecycle events
document.addEventListener('savanna:ready', (e) => console.log('Player initialized', e.detail));
document.addEventListener('savanna:play', () => console.log('Playback started'));
document.addEventListener('savanna:pause', () => console.log('Playback paused'));
document.addEventListener('savanna:seek', (e) => console.log('Seeked to second:', e.detail.time));
document.addEventListener('savanna:timeupdate', (e) => {
  // e.detail: { time, paused, rate }
});
document.addEventListener('savanna:caption-change', (e) => console.log('Caption track:', e.detail.lang));
document.addEventListener('savanna:complete', () => console.log('Lesson completed'));
document.addEventListener('savanna:error', (e) => console.error('Player error:', e.detail));

// Listen to host-wide language switch
window.addEventListener('savanna:lang-change', (e) => {
  console.log('Language switched to:', e.detail.lang);
});
```

### 4. Theming (CSS Custom Properties)
All elements use Shadow DOM. You can customize branding by setting tokens on the host or `:root`:

```css
:root {
  --savanna-accent: #0284c7;  /* Primary brand color */
  --savanna-font: system-ui, sans-serif; /* Host typography */
  --savanna-radius: 8px;     /* Corner radii */
  --savanna-focus: #f59e0b;   /* High-contrast focus outline */
}
```
*Accessibility Clamp:* Focus rings and minimum text contrasts are strictly clamped to WCAG AA thresholds inside the Shadow DOM and cannot be overridden below 4.5:1 (text) or 3:1 (controls).

---

## Level 2: Access REST API

The API provides structured JSON endpoints with RFC 9457 `application/problem+json` error semantics.

- **Base URL:** `http://localhost:4010/v1` (or production host)
- **OpenAPI 3.1 Spec:** `GET /v1/openapi.json`
- **Interactive Swagger UI:** `GET /docs`
- **Auth Header:** `X-Savanna-Key: pk_live_xxx` (or `pk_dev_local` in dev)

### Core Endpoints

#### 1. Get Lesson Manifest
```bash
curl -H "X-Savanna-Key: pk_dev_local" http://localhost:4010/v1/lessons/L-102
```

#### 2. Get Timed Captions (WebVTT)
```bash
curl -H "X-Savanna-Key: pk_dev_local" http://localhost:4010/v1/lessons/L-102/captions/am.vtt
```

#### 3. Download Offline Pack
```bash
curl -H "X-Savanna-Key: pk_dev_local" http://localhost:4010/v1/lessons/L-102/pack.zip -o lesson-pack.zip
```

#### 4. Fetch Job with JSON-LD
```bash
curl -H "X-Savanna-Key: pk_dev_local" -H "Accept: application/ld+json" http://localhost:4010/v1/jobs/J-9
```

#### 5. Verify Credential
```bash
curl http://localhost:4010/v1/credentials/C-7
```

### Generated TypeScript SDK (`@savanna/sdk`)
Install and use the generated typed client:

```typescript
import { createClient } from "@savanna/sdk";

const client = createClient({
  baseUrl: "http://localhost:4010",
  headers: { "X-Savanna-Key": "pk_dev_local" },
});

const { data: lesson } = await client.GET("/v1/lessons/{id}", {
  params: { path: { id: "L-102" } },
});
console.log(lesson.title.am, lesson.durationSec);
```

---

## Level 3: Open Standards

1. **schema.org/JobPosting:** Embedded as JSON-LD in all job cards and accessible at `/v1/jobs/{id}.jsonld` for immediate ingestion by external job boards, Google Jobs, and career aggregators.
2. **Open Badges 3.0 / W3C Verifiable Credentials:**
   - Compliant with W3C VC Data Model 2.0.
   - Hosted verification at `/verify/{id}` with QR code and accessible fallback.
   - Cryptographic proof verification using Ed25519 signatures and `did:web` identifier discovery.
