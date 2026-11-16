/**
 * Automated axe-core accessibility audit (NFR-G3).
 * Verifies zero critical and zero serious accessibility issues on:
 * - demo/blank.html (blank page proof)
 * - savanna/pages/concept-with-navigation.html (Savanna demo)
 * - demo/caption-editor/index.html (caption editor)
 */
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

// Locate playwright and axe-core
async function loadModules() {
  const playwrightPath = path.resolve(root, "api/node_modules/playwright/index.mjs");
  const axePath = path.resolve(
    root,
    "node_modules/.pnpm/@axe-core+playwright@4.14.0_playwright-core@1.65.1/node_modules/@axe-core/playwright/dist/index.js"
  );
  const { chromium } = await import(pathToFileURL(playwrightPath).href);
  const AxeBuilder = (await import(pathToFileURL(axePath).href)).default;
  return { chromium, AxeBuilder };
}

// Minimal static server for audit
function createServer() {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".vtt": "text/vtt; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI((req.url || "/").split("?")[0]);
    if (reqPath === "/") reqPath = "/index.html";
    const filePath = path.join(root, reqPath.replace(/^\//, ""));

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function main() {
  console.log("🚀 Starting axe-core accessibility audit (NFR-G3)...");
  const { chromium, AxeBuilder } = await loadModules();
  const { server, port } = await createServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const pagesToTest = [
    { name: "Blank Demo Proof", path: "/demo/blank.html" },
    { name: "Caption Editor", path: "/demo/caption-editor/index.html" },
    { name: "Savanna Integration Demo", path: "/savanna/pages/concept-with-navigation.html" },
  ];

  let hasFailures = false;

  for (const pageInfo of pagesToTest) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const targetUrl = `${baseUrl}${pageInfo.path}`;

    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      // Allow custom elements to render
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      console.log(`\n📄 Auditing: ${pageInfo.name} (${pageInfo.path})`);
      console.log(`   Total rules checked: ${results.passes.length + results.violations.length}`);
      console.log(`   Violations total: ${results.violations.length}`);
      console.log(`   Critical / Serious issues: ${blocking.length}`);

      if (blocking.length > 0) {
        hasFailures = true;
        console.error(`❌ Gate Failure: Found ${blocking.length} critical/serious issues on ${pageInfo.name}:`);
        for (const v of blocking) {
          console.error(`   - [${v.impact.toUpperCase()}] ${v.id}: ${v.help}`);
          console.error(`     Help URL: ${v.helpUrl}`);
          for (const node of v.nodes) {
            console.error(`     Target: ${node.target.join(", ")}`);
            console.error(`     Summary: ${node.failureSummary}`);
          }
        }
      } else {
        console.log(`✅ Gate Pass: 0 critical and 0 serious issues on ${pageInfo.name}`);
      }
    } catch (err) {
      console.error(`❌ Error auditing ${pageInfo.name}:`, err.message);
      hasFailures = true;
    } finally {
      await context.close();
    }
  }

  await browser.close();
  server.close();

  if (hasFailures) {
    console.error("\n❌ axe audit failed: critical or serious accessibility issues detected.");
    process.exit(1);
  } else {
    console.log("\n🎉 axe audit passed: All tested pages have ZERO critical and ZERO serious issues!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
