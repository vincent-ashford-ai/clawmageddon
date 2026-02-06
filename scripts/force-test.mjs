import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

// Force bypass cache
await page.route('**/*', route => {
  route.continue({ headers: { ...route.request().headers(), 'Cache-Control': 'no-cache' } });
});

const errors = [];
page.on('pageerror', err => errors.push('PAGE: ' + err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text().slice(0, 200));
});

await page.goto('http://localhost:3000/clawmageddon/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Click to start
await page.click('canvas');
await page.waitForTimeout(500);

// Play a bit
for (let i = 0; i < 5; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
}
await page.waitForTimeout(1500);

await page.screenshot({ path: '/tmp/claw-gameplay-final.png' });
await browser.close();

const uniqueErrors = [...new Set(errors.map(e => e.slice(0, 100)))];
if (uniqueErrors.length > 0) {
  console.log('Unique errors:', uniqueErrors.length);
  uniqueErrors.forEach(e => console.log('-', e));
} else {
  console.log('No errors! 🎉');
}
