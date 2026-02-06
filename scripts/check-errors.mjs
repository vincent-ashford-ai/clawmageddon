import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

const errors = [];
const logs = [];

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + text);
  else logs.push('[' + msg.type() + '] ' + text);
});

page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

try {
  await page.goto('http://localhost:3000/clawmageddon/', { timeout: 10000 });
  await page.waitForTimeout(5000); // Longer wait
} catch (e) {
  errors.push('NAVIGATION: ' + e.message);
}

await page.screenshot({ path: '/tmp/claw-error-check.png', fullPage: true });
await browser.close();

console.log('=== CONSOLE LOGS ===');
logs.forEach(l => console.log(l));

console.log('\n=== ERRORS ===');
if (errors.length > 0) {
  errors.forEach(e => console.log(e));
} else {
  console.log('No errors detected');
}
