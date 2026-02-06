import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

page.on('console', msg => {
  if (msg.text().includes('[') || msg.text().includes('Enemy') || msg.text().includes('spawn')) {
    console.log('LOG:', msg.text());
  }
});

await page.goto('http://localhost:3000/clawmageddon/');
await page.waitForTimeout(1500);

// Start game
await page.click('canvas');
await page.waitForTimeout(300);

// Play briefly
for (let i = 0; i < 15; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
}

await page.screenshot({ path: '/tmp/claw-debug.png' });
await browser.close();
console.log('Done');
