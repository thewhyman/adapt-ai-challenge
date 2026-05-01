/**
 * demo-record.ts — Playwright demo recorder for xTeamOS campaign engine
 *
 * Records a full walkthrough:
 * 1. Opens the Vercel site
 * 2. Switches to Campaign Generator tab
 * 3. Clicks the Gaia Dynamics demo card
 * 4. Runs the full pipeline (ingestion → persona → campaign)
 * 5. Shows swarm review results
 * 6. Downloads the campaign markdown
 *
 * Usage:
 *   npx ts-node scripts/demo-record.ts [--url https://adapt-ai-challenge.vercel.app] [--video]
 *   npx ts-node scripts/demo-record.ts --url http://localhost:3000 --video
 *
 * Output:
 *   scripts/demo-output/demo-YYYY-MM-DD.webm  (video)
 *   scripts/demo-output/screenshots/          (PNG per step)
 *   scripts/demo-output/campaign.md            (downloaded campaign doc)
 */

import { chromium, Browser, BrowserContext, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.argv.find((a) => a.startsWith("http")) || "https://adapt-ai-challenge.vercel.app";
const RECORD_VIDEO = process.argv.includes("--video");

const OUTPUT_DIR = path.join(__dirname, "demo-output");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "screenshots");

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 ${name}`);
  return file;
}

async function runDemo() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  let browser: Browser;
  let context: BrowserContext;

  const launchOptions = {
    headless: false, // Visible for demo — shows the real product
    slowMo: 80,      // Slightly slowed for legibility
    args: ["--window-size=1440,900"],
  };

  browser = await chromium.launch(launchOptions);

  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(RECORD_VIDEO ? {
      recordVideo: {
        dir: OUTPUT_DIR,
        size: { width: 1440, height: 900 },
      },
    } : {}),
  });

  const page = await context.newPage();

  try {
    console.log(`\n🎬 Starting demo — ${BASE_URL}\n`);

    // ── Step 1: Load the site ──────────────────────────────────────────────────
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await sleep(1500);
    await screenshot(page, "01-home");
    console.log("✅ Step 1: Site loaded");

    // ── Step 2: Switch to Campaign Generator tab ───────────────────────────────
    await page.click("button:has-text('Campaign Generator')");
    await sleep(1000);
    await screenshot(page, "02-campaign-tab");
    console.log("✅ Step 2: Campaign Generator tab active");

    // ── Step 3: Click Gaia Dynamics demo card ─────────────────────────────────
    const gaiaCard = page.locator("button:has-text('Gaia Dynamics')").first();
    await gaiaCard.waitFor({ state: "visible", timeout: 10000 });
    await gaiaCard.click();
    await sleep(600);
    await screenshot(page, "03-gaia-selected");
    console.log("✅ Step 3: Gaia Dynamics demo selected");

    // ── Step 4: Start persona build ────────────────────────────────────────────
    const learnButton = page.locator("button:has-text('Learn company voice')");
    await learnButton.waitFor({ state: "visible", timeout: 5000 });
    await learnButton.click();
    await screenshot(page, "04-persona-building-started");
    console.log("⏳ Step 4: Building company persona...");

    // Wait for persona result (up to 60s)
    await page.waitForSelector("button:has-text('Generate campaign')", {
      timeout: 60_000,
    });
    await sleep(1500);
    await screenshot(page, "05-persona-ready");
    console.log("✅ Step 5: Company persona built — hub + audiences visible");

    // ── Step 5: Generate campaign ──────────────────────────────────────────────
    await page.click("button:has-text('Generate campaign')");
    await screenshot(page, "06-campaign-generating");
    console.log("⏳ Step 6: Generating campaign (Claude + Codex + Gemini swarm)...");

    // Wait for campaign result (up to 120s — swarm review adds time)
    await page.waitForSelector("button:has-text('Download .md')", {
      timeout: 120_000,
    });
    await sleep(2000);
    await screenshot(page, "07-campaign-ready");
    console.log("✅ Step 7: Campaign generated — platform assets visible");

    // ── Step 6: Show swarm review tab ─────────────────────────────────────────
    const reviewTab = page.locator("button:has-text('Swarm Review')");
    if (await reviewTab.isVisible()) {
      await reviewTab.click();
      await sleep(1500);
      await screenshot(page, "08-swarm-review");
      console.log("✅ Step 8: Swarm review — Codex issues + Gemini scores visible");
    }

    // ── Step 7: Show campaign plan tab ────────────────────────────────────────
    const planTab = page.locator("button:has-text('Campaign Plan')");
    if (await planTab.isVisible()) {
      await planTab.click();
      await sleep(1500);
      await screenshot(page, "09-campaign-plan");
      console.log("✅ Step 9: Campaign plan — publishing schedule visible");
    }

    // ── Step 8: Download the markdown ─────────────────────────────────────────
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      page.click("button:has-text('Download .md')"),
    ]);
    const downloadPath = path.join(OUTPUT_DIR, "campaign.md");
    await download.saveAs(downloadPath);
    await sleep(800);
    await screenshot(page, "10-downloaded");
    console.log(`✅ Step 10: Campaign downloaded → ${downloadPath}`);

    // ── Final wide shot ────────────────────────────────────────────────────────
    await page.locator("button:has-text('Platform Assets')").first().click();
    await sleep(1000);
    await screenshot(page, "11-final");

    console.log("\n🎉 Demo complete!");
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log(`📸 Screenshots: ${SCREENSHOT_DIR}`);
    if (RECORD_VIDEO) console.log(`🎬 Video: ${OUTPUT_DIR}/*.webm (saved on context close)`);

  } catch (err) {
    console.error("\n❌ Demo failed:", err);
    await screenshot(page, "error-state");
    throw err;
  } finally {
    await sleep(2000); // Let video flush
    await context.close();
    await browser.close();
  }
}

runDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
