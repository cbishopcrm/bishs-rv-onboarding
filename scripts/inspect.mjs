import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();

await page.goto('https://bishsrv.thecrm.com/login/', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));
const loginInfo = await page.evaluate(() => {
  const input = document.querySelector('input[placeholder="Username"]');
  if (!input) return null;
  const chain = [];
  let el = input;
  for (let i = 0; i < 8 && el.parentElement; i++) {
    el = el.parentElement;
    const r = el.getBoundingClientRect();
    chain.push({ tag: el.tagName, id: el.id, cls: (el.className.toString ? el.className.toString() : '').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) });
  }
  return chain;
});
console.log('LOGIN chain:');
loginInfo.forEach(c => console.log('  ', JSON.stringify(c)));

await page.goto('https://bishsrv.thecrm.com/signup/', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));
const sign1 = await page.evaluate(() => {
  const input = document.querySelector('input[placeholder="Password"]') || document.querySelector('form input');
  if (!input) return null;
  const chain = [];
  let el = input;
  for (let i = 0; i < 8 && el.parentElement; i++) {
    el = el.parentElement;
    const r = el.getBoundingClientRect();
    chain.push({ tag: el.tagName, id: el.id, cls: (el.className.toString ? el.className.toString() : '').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) });
  }
  return chain;
});
console.log('\nSIGNUP (password) chain:');
sign1.forEach(c => console.log('  ', JSON.stringify(c)));

// Now submit the password and inspect the user info form
await page.type('input[placeholder="Password"]', 'GoTheCRM');
const btns = await page.$$('button');
for (const b of btns) {
  const t = await (await b.getProperty('textContent')).jsonValue();
  if ((t || '').trim().toLowerCase().includes('continue')) { await b.click(); break; }
}
await new Promise(r => setTimeout(r, 4500));
await page.evaluate(() => {
  document.querySelectorAll('button').forEach(b => { if ((b.textContent || '').trim().toLowerCase() === 'close') b.click(); });
});
await new Promise(r => setTimeout(r, 1000));

const sign2 = await page.evaluate(() => {
  const input = document.querySelector('input[placeholder="First Name"]');
  if (!input) return null;
  const chain = [];
  let el = input;
  for (let i = 0; i < 10 && el.parentElement; i++) {
    el = el.parentElement;
    const r = el.getBoundingClientRect();
    chain.push({ tag: el.tagName, id: el.id, cls: (el.className.toString ? el.className.toString() : '').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) });
  }
  return chain;
});
console.log('\nSIGNUP (user info) chain:');
sign2.forEach(c => console.log('  ', JSON.stringify(c)));

await browser.close();
