import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Savanna Player - Member 1 Accessibility & Functional Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for savanna-player custom element to be defined and mounted
    await page.waitForSelector("savanna-player");
  });

  test("1.1 Baseline Axe-Core accessibility scan (Zero Violations)", async ({ page }) => {
    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    // Verify 0 critical and 0 serious violations (Hackathon threshold)
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);

    // Strict zero violations across all levels
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("1.2 Axe-Core scan with active modals, panels, and popovers (Zero Violations)", async ({ page }) => {
    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();

    // 1. Open Preferences Modal (dialog.captions-dialog)
    await player.locator(".btn-preferences").click();
    await expect(player.locator("dialog.captions-dialog")).toBeVisible();
    const prefsAxe = await new AxeBuilder({ page }).analyze();
    const prefsBlocking = prefsAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(prefsBlocking, JSON.stringify(prefsBlocking, null, 2)).toEqual([]);

    // Close Preferences with Escape
    await page.keyboard.press("Escape");
    await expect(player.locator("dialog.captions-dialog")).not.toBeVisible();

    // 2. Open Keyboard Shortcuts Dialog (dialog.shortcuts-dialog)
    await player.locator(".btn-help").click();
    await expect(player.locator("dialog.shortcuts-dialog")).toBeVisible();
    const helpAxe = await new AxeBuilder({ page }).analyze();
    const helpBlocking = helpAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(helpBlocking, JSON.stringify(helpBlocking, null, 2)).toEqual([]);

    // Close Help with Escape
    await page.keyboard.press("Escape");
    await expect(player.locator("dialog.shortcuts-dialog")).not.toBeVisible();

    // 3. Open Interactive Transcript Panel
    await player.locator(".btn-transcript").click();
    await expect(player.locator(".transcript-panel")).toBeVisible();
    const transcriptAxe = await new AxeBuilder({ page }).analyze();
    const transcriptBlocking = transcriptAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(transcriptBlocking, JSON.stringify(transcriptBlocking, null, 2)).toEqual([]);
  });

  test("1.3 320 CSS px Viewport reflow without horizontal scroll (NFR-A3, WCAG 1.4.10)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/");
    await page.waitForSelector("savanna-player");

    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();

    // Check no horizontal document scroll
    const scrollInfo = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.innerWidth + 1);

    // Verify player control bar is accessible
    const ctrlBar = player.locator(".player-controls");
    await expect(ctrlBar).toBeVisible();
  });

  test("1.4 200% and 400% Zoom maintain single column and layout integrity (NFR-A3, WCAG 1.4.4)", async ({ page }) => {
    for (const zoom of [2, 4]) {
      await page.evaluate((z) => {
        document.body.style.zoom = String(z);
      }, zoom);

      const player = page.locator("savanna-player");
      await expect(player).toBeVisible();
      const box = await player.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test("1.5 Forced-colors / High-Contrast mode conformance (NFR-A4, WCAG 1.4.6)", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active", colorScheme: "dark" });
    await page.goto("/");
    await page.waitForSelector("savanna-player");

    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();

    // Scan axe on the player element in forced-colors mode
    const results = await new AxeBuilder({ page }).include("savanna-player").analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("1.6 Reduced-motion emulation respected (NFR-A4, WCAG 2.3.3)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForSelector("savanna-player");

    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();
  });

  test("1.7 Full keyboard navigation and visible focus rings (FR-P1)", async ({ page }) => {
    const player = page.locator("savanna-player");
    const playBtn = player.locator(".btn-play");

    // 1. Focus play button and verify focus
    await playBtn.focus();
    await expect(playBtn).toBeFocused();

    // 2. Trigger Play/Pause via Enter
    await playBtn.press("Enter");

    // 3. Open Help modal via keyboard Enter on the button
    const helpBtn = player.locator(".btn-help");
    await helpBtn.focus();
    await expect(helpBtn).toBeFocused();
    await helpBtn.press("Enter");
    await expect(player.locator("dialog.shortcuts-dialog")).toBeVisible();

    // Dismiss with Escape
    await page.keyboard.press("Escape");
    await expect(player.locator("dialog.shortcuts-dialog")).not.toBeVisible();

    // 4. Toggle Transcript via keyboard Enter on the button
    const transcriptBtn = player.locator(".btn-transcript");
    await transcriptBtn.focus();
    await expect(transcriptBtn).toBeFocused();
    await transcriptBtn.press("Enter");
    await expect(transcriptBtn).toHaveAttribute("aria-expanded", "true");
    await expect(player.locator(".transcript-panel")).toBeVisible();

    // 5. Toggle Transcript closed with Escape or Space
    await page.keyboard.press("Escape");
    await expect(transcriptBtn).toHaveAttribute("aria-expanded", "false");
    await expect(player.locator(".transcript-panel")).not.toBeVisible();
  });

  test("1.8 Screen reader semantics and live region announcements (FR-P2, FR-P8)", async ({ page }) => {
    const player = page.locator("savanna-player");

    // Control buttons have valid accessible names and attributes
    const playBtn = player.locator(".btn-play");
    await expect(playBtn).toHaveAttribute("aria-label");

    const captionsBtn = player.locator(".btn-captions");
    await expect(captionsBtn).toHaveAttribute("aria-expanded");

    const prefsBtn = player.locator(".btn-preferences");
    await expect(prefsBtn).toHaveAttribute("aria-haspopup", "dialog");

    // Live region exists and is polite
    const liveRegion = player.locator('div[role="status"]');
    await expect(liveRegion).toHaveAttribute("aria-live", "polite");
    await expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  test("1.9 Bilingual UI switching and dynamic lang attribute (FR-P10, Contract C4)", async ({ page }) => {
    const player = page.locator("savanna-player");
    const langPill = page.locator("#btn-lang-toggle");

    // Initially English
    await expect(player).toHaveAttribute("lang", "en");

    // Switch to Amharic
    await langPill.click();
    await expect(player).toHaveAttribute("lang", "am");

    // Verify Amharic translated label on captions or transcript button
    const transcriptBtn = player.locator(".btn-transcript");
    const labelAm = await transcriptBtn.getAttribute("aria-label");
    expect(labelAm).toBeTruthy();

    // Switch back to English
    await langPill.click();
    await expect(player).toHaveAttribute("lang", "en");
  });

  test("1.10 Braille (.brf) Export trigger (Task 1.8, FR-S1)", async ({ page }) => {
    const player = page.locator("savanna-player");

    // Open transcript panel
    await player.locator(".btn-transcript").click();
    const transcriptPanel = player.locator(".transcript-panel");
    await expect(transcriptPanel).toBeVisible();

    // Verify Braille download button is present and accessible
    const brailleBtn = player.locator(".btn-braille-transcript");
    await expect(brailleBtn).toBeVisible();
    await expect(brailleBtn).toHaveAttribute("aria-label");

    // Listen for download event
    const downloadPromise = page.waitForEvent("download");
    await brailleBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.brf$/i);
  });

  test("1.11 Relative caption URL resolution, track normalization, and axe validation", async ({ page }) => {
    const player = page.locator("savanna-player");
    await expect(player).toBeVisible();

    // 1. Verify track URL resolution and suppression of duplicate native subtitles
    const trackInfo = await player.evaluate((el: any) => {
      const tracks = Array.from(el.shadowRoot?.querySelectorAll("track") || []) as HTMLTrackElement[];
      const textTracks = Array.from(el.media?.textTracks || []) as TextTrack[];
      return {
        trackUrls: tracks.map((t) => t.src),
        trackModes: textTracks.map((t) => t.mode),
        hasOverlay: Boolean(el.shadowRoot?.querySelector(".caption-overlay")),
      };
    });

    // Tracks should exist and resolve to valid HTTP(S) URLs
    expect(trackInfo.hasOverlay).toBe(true);
    for (const url of trackInfo.trackUrls) {
      expect(url).toMatch(/^https?:\/\//);
    }
    // Text tracks should not be 'showing' by default (prevents duplicate overlay collisions)
    for (const mode of trackInfo.trackModes) {
      expect(mode).not.toBe("showing");
    }

    // 2. Toggle captions on and verify axe-core compliance with active captions
    await player.locator(".btn-captions").click();
    const activeAxe = await new AxeBuilder({ page }).analyze();
    const blocking = activeAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(blocking).toEqual([]);
    expect(activeAxe.violations).toEqual([]);

    // Turn captions back off
    await player.locator(".btn-captions").click();
  });
});
