import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
  args: ['--hide-scrollbars', '--disable-gpu']
});

try {
  const page = await browser.newPage();

  // Step 1: login page
  await page.goto('https://bishsrv.thecrm.com/login/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'step1-login.png'), fullPage: false });
  console.log('step1-login.png saved');

  // Step 2: signup / registration password gate
  await page.goto('https://bishsrv.thecrm.com/signup/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'step2-register-password.png'), fullPage: false });
  console.log('step2-register-password.png saved');

  // Step 3: fill the dealership password and continue to the user info form
  const pwSelector = 'input[type="password"], input[placeholder="Password"]';
  await page.waitForSelector(pwSelector, { timeout: 15000 });
  await page.type(pwSelector, 'GoTheCRM');

  // Click the Continue button
  const buttons = await page.$$('button, input[type="submit"]');
  for (const b of buttons) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    const val = await (await b.getProperty('value')).jsonValue();
    if ((txt || val || '').trim().toLowerCase().includes('continue')) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));

  // Try to dismiss any error modal (username-check popup)
  try {
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if ((b.textContent || '').trim().toLowerCase() === 'close') b.click();
      });
      // Also clear any pre-filled username/password so form looks clean
      document.querySelectorAll('input').forEach(i => {
        if (['text','password','tel','email'].includes(i.type)) i.value = '';
      });
    });
  } catch {}

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'step3-user-info-form.png'), fullPage: false });
  console.log('step3-user-info-form.png saved');

} catch (err) {
  console.error('Error:', err);
} finally {
  await browser.close();
}
