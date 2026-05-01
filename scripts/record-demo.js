/**
 * xTeamOS Campaign Generator — Demo Recording Script
 * 
 * Records a Playwright demo of the full Gaia Dynamics campaign flow:
 *   1. Open the live Vercel site
 *   2. Click "Campaign Generator" tab
 *   3. Pre-fill with Gaia Dynamics URLs
 *   4. Run persona builder (shows loading states)
 *   5. Run campaign generator (shows all loading steps)
 *   6. Scroll through campaign output (LinkedIn, X, Reddit, Instagram, Substack)
 *   7. Download the markdown file
 *
 * Usage:
 *   node scripts/record-demo.js [--url https://adapt-ai-challenge.vercel.app]
 *
 * Output:
 *   demo/xteamos-demo-YYYY-MM-DD.webm   (video)
 *   demo/screenshots/                    (key frames)
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SITE_URL = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1]
  || "https://adapt-ai-challenge.vercel.app";

const DEMO_DIR = path.join(__dirname, "../demo");
const SCREENSHOTS_DIR = path.join(DEMO_DIR, "screenshots");

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false, // visible for recording
    slowMo: 300,     // smooth enough to follow
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: DEMO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  console.log(`Opening ${SITE_URL}...`);
  await page.goto(SITE_URL, { waitUntil: "networkidle" });
  await screenshot(page, "01-home");

  // ── Step 1: Click Campaign Generator tab ──
  console.log("Clicking Campaign Generator tab...");
  await page.click("button:has-text('Campaign Generator')");
  await page.waitForTimeout(800);
  await screenshot(page, "02-campaign-tab");

  // ── Step 2: Pre-fill Gaia Dynamics ──
  console.log("Pre-filling Gaia Dynamics...");
  await page.click("text=Pre-fill Gaia Dynamics");
  await page.waitForTimeout(600);
  await screenshot(page, "03-prefilled");

  // ── Step 3: Build Company Persona ──
  console.log("Building company persona...");
  await page.click("button:has-text('Build Company Persona')");

  // Wait for persona card to appear (persona step loads)
  await page.waitForSelector("text=Persona Ready", { timeout: 60000 });
  await screenshot(page, "04-persona-ready");

  // ── Step 4: Generate Campaign ──
  console.log("Generating campaign...");
  await page.click("button:has-text('Generate Campaign')");

  // Wait for campaign title to appear
  await page.waitForSelector("button:has-text('Download .md')", { timeout: 120000 });
  await screenshot(page, "05-campaign-done");

  // ── Step 5: Scroll through campaign output ──
  console.log("Scrolling through campaign output...");
  await page.waitForTimeout(1000);

  // Scroll to show key angles
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(800);
  await screenshot(page, "06-key-angles");

  // Scroll to show LinkedIn post
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(800);
  await screenshot(page, "07-linkedin-asset");

  // Scroll to show X thread
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(800);
  await screenshot(page, "08-twitter-thread");

  // Scroll to show Reddit + Instagram
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(800);
  await screenshot(page, "09-reddit-instagram");

  // ── Step 6: Switch to Raw Markdown tab ──
  console.log("Showing raw markdown...");
  await page.click("button:has-text('Raw Markdown')");
  await page.waitForTimeout(800);
  await screenshot(page, "10-raw-markdown");

  // ── Step 7: Download ──
  console.log("Downloading campaign markdown...");
  const downloadPromise = page.waitForEvent("download");
  await page.click("button:has-text('Download .md')");
  const download = await downloadPromise;
  await download.saveAs(path.join(DEMO_DIR, await download.suggestedFilename()));
  await screenshot(page, "11-download-complete");

  console.log("Done! Closing browser...");
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();

  const videoFiles = fs.readdirSync(DEMO_DIR).filter((f) => f.endsWith(".webm"));
  if (videoFiles.length > 0) {
    const latest = videoFiles[videoFiles.length - 1];
    const dated = `xteamos-demo-${new Date().toISOString().split("T")[0]}.webm`;
    fs.renameSync(path.join(DEMO_DIR, latest), path.join(DEMO_DIR, dated));
    console.log(`\nVideo saved: demo/${dated}`);
  }
  console.log(`Screenshots saved: demo/screenshots/`);
}

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: false,
  });
  console.log(`  Screenshot: ${name}.png`);
}

main().catch((err) => {
  console.error("Demo recording failed:", err);
  process.exit(1);
});
