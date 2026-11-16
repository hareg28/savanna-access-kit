# Savanna Host Platform: Accessibility Defects Audit & Remediation Backlog

> **Requirement Reference:** SRS v1.0 Section 5.5 (FR-I5) & ALX Digital Bridge Team Technical Guide Section 2.
>
> Per the hackathon guidelines, the host starter was treated as external third-party software and was **not modified** directly. The three critical accessibility barriers identified below are documented here for the post-hackathon hardening sprint.

---

## 1. Non-Semantic Menu Button (`div.hamburger` with Click Handler)
* **Location:** All starter header pages:
  - `savanna/pages/concept-with-navigation.html` (Line 508)
  - `savanna/pages/homepage-v1-paced.html`
  - `savanna/pages/homepage-v1-self-paced.html`
* **Defect:**
  ```html
  <div class="hamburger mb-0 p-2 color-primary" style="cursor: pointer; font-size: 24px">
    <i class="fa fa-hamburger"></i>
  </div>
  ```
  The toggle is an unadorned `<div>` element attached to a mouse click event listener in `assets/js/static-page.js`.
* **WCAG 2.2 AA Violations:**
  - **4.1.2 Name, Role, Value (Level A):** No accessible role (`role="button"`) or accessible name (`aria-label="Toggle navigation menu"`). Screen readers announce it as plain text or ignore it entirely.
  - **2.1.1 Keyboard (Level A):** A `<div>` is not reachable via `Tab` key navigation and cannot be triggered via `Enter` or `Space`.
* **Savanna Access Kit Protection:**
  - All Access Kit components use native `<button>` and `<input>` elements inside Shadow DOM with distinct accessible names, `:focus-visible` rings (minimum 3:1 contrast), and 44×44px touch targets.
* **Proposed Hardening Fix:**
  ```html
  <button type="button" class="hamburger mb-0 p-2 color-primary" aria-label="Toggle navigation menu" aria-expanded="false">
    <i class="fa fa-hamburger" aria-hidden="true"></i>
  </button>
  ```

---

## 2. Missing ARIA States & Live Announcements on Dynamic Modals and Tabs
* **Location:** Module switcher, week strip navigation, and programme modals.
* **Defect:**
  - Active tabs and collapsible sections change state dynamically via JavaScript class toggling (`active`, `expanded`) without updating ARIA states (`aria-selected`, `aria-expanded`, or `aria-controls`).
  - Screen reader users receive no spoken feedback when selecting a different week or opening modal dialogues.
* **WCAG 2.2 AA Violations:**
  - **1.3.1 Info and Relationships (Level A):** Tablist structure lacks `role="tablist"`, `role="tab"`, and `role="tabpanel"`.
  - **4.1.2 Name, Role, Value (Level A):** Expanded/collapsed state is invisible to assistive technology.
  - **4.1.3 Status Messages (Level AA):** Asynchronous content updates occur without polite live regions (`role="status"` / `aria-live="polite"`).
* **Savanna Access Kit Protection:**
  - All status changes in `<savanna-player>`, `<savanna-sign-window>`, `<savanna-audio-description>`, and `<savanna-offline>` announce state changes via dedicated polite `aria-live` regions without stealing user focus.
* **Proposed Hardening Fix:**
  Add WAI-ARIA Tabs design pattern markup and replace custom modal div overlays with native `<dialog>` elements or proper `aria-modal="true"` dialog containers with focus traps.

---

## 3. Absence of Keyboard Bypass Mechanism ("Skip to Content" Link) & Unfocused Headings
* **Location:** Header and sidebar across all learner pages.
* **Defect:**
  - There is no `<a class="skip-link" href="#content">` at the start of the document. Keyboard-only and screen reader learners must tab through over 20 redundant header items before reaching the lesson or concept body.
  - Heading tags (`<h4>`, `<h2>`) frequently lack descriptive context or contain inert `<a>` tags with empty `title=""` attributes.
* **WCAG 2.2 AA Violations:**
  - **2.4.1 Bypass Blocks (Level A):** No mechanism exists to bypass repetitive navigation blocks.
  - **2.4.6 Headings and Labels (Level AA):** Empty anchor tags nested inside headings trigger confusing screen reader announcements.
* **Savanna Access Kit Protection:**
  - `<savanna-player>` provides direct single-key global shortcuts (Space/K for play/pause, J/L for seeking, C for captions, S for sign language, D for audio description, ? for shortcut guide) and places primary focus indicators prominently.
* **Proposed Hardening Fix:**
  Insert a skip-to-content anchor as the first child of `<body>`:
  ```html
  <a href="#curriculum_navigation_content" class="visually-hidden-focusable btn btn-primary">
    Skip to main content
  </a>
  ```
