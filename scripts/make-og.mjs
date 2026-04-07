import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'assets');

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
  args: ['--hide-scrollbars', '--disable-gpu']
});

try {
  const page = await browser.newPage();
  const fileUrl = 'file:///' + path.join(__dirname, 'og-template.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  // Wait a bit for fonts
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'og-image.png'), type: 'png', omitBackground: false });
  console.log('og-image.png saved');
} finally {
  await browser.close();
}
