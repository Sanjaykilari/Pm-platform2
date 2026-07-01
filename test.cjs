const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
    const content = await page.content();
    if (content.includes('id="root"></div>')) {
      console.log('[BROWSER DOM] Contains empty root div');
    }
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    if (!rootHtml.trim()) {
      console.log('[BROWSER DOM] #root is completely empty (blank page)');
    } else {
      console.log('[BROWSER DOM] #root has content, length:', rootHtml.length);
    }
  } catch (err) {
    console.log('[BROWSER NAV ERROR]', err.message);
  }
  
  await browser.close();
})();
