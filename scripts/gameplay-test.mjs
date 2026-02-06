import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('ERROR: ' + msg.text());
});
page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

await page.goto('http://localhost:3000/clawmageddon/');
await page.waitForTimeout(2000);

// Click to start game
await page.click('canvas');
await page.waitForTimeout(500);

// Play for a few seconds (tap multiple times to jump/shoot)
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
}

// Wait for game elements
await page.waitForTimeout(2000);

await page.screenshot({ path: '/tmp/claw-gameplay-test.png', fullPage: true });
await browser.close();

if (errors.length > 0) {
  console.log('ERRORS:', errors);
} else {
  console.log('Gameplay test complete - no errors');
}
