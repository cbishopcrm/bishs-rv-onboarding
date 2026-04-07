import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 1200, deviceScaleFactor: 2 },
  args: ['--hide-scrollbars', '--disable-gpu']
});

async function clipEl(page, selector, outPath, pad = 20) {
  const rect = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    el.scrollIntoView({ block: 'start' });
    window.scrollTo(0, 0);
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
  if (!rect) throw new Error('No element for: ' + selector);
  await page.screenshot({
    path: outPath,
    clip: {
      x: Math.max(0, rect.x - pad),
      y: Math.max(0, rect.y - pad),
      width: rect.width + pad * 2,
      height: rect.height + pad * 2
    }
  });
}

try {
  const page = await browser.newPage();

  // Step 1: login card
  await page.goto('https://bishsrv.thecrm.com/login/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await clipEl(page, '.login--form', path.join(outDir, 'step1-login.png'), 24);
  console.log('step1-login.png saved');

  // Step 2: registration password card
  await page.goto('https://bishsrv.thecrm.com/signup/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await clipEl(page, '.signup--home', path.join(outDir, 'step2-register-password.png'), 24);
  console.log('step2-register-password.png saved');

  // Step 3: fill password, continue, clip the profile form
  await page.type('input[placeholder="Password"]', 'GoTheCRM');
  const buttons = await page.$$('button, input[type="submit"]');
  for (const b of buttons) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    const val = await (await b.getProperty('value')).jsonValue();
    if ((txt || val || '').trim().toLowerCase().includes('continue')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 4500));

  // Dismiss "Username already taken" modal and clear pre-filled fields
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if ((b.textContent || '').trim().toLowerCase() === 'close') b.click();
    });
    document.querySelectorAll('input').forEach(i => {
      if (['text','password','tel','email'].includes(i.type)) i.value = '';
    });
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 800));

  await clipEl(page, '.signup--form', path.join(outDir, 'step3-user-info-form.png'), 24);
  console.log('step3-user-info-form.png saved');

} catch (err) {
  console.error('Error:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
