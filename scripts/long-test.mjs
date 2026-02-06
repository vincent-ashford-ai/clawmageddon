import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

await page.goto('http://localhost:3000/clawmageddon/');
await page.waitForTimeout(1500);

// Start game
await page.click('canvas');
await page.waitForTimeout(300);

// Play for longer - tap periodically
for (let i = 0; i < 30; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
}

await page.screenshot({ path: '/tmp/claw-long-play.png' });
await browser.close();
console.log('Done - check /tmp/claw-long-play.png');
