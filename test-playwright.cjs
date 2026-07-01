const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.toString()));
  
  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Navigation complete');
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/Users/sanjaykilari/.gemini/antigravity-ide/brain/368fbd4b-063a-4304-910e-1da67357e356/playwright_screenshot.png' });
    console.log('Saved screenshot to playwright_screenshot.png');
    
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    if (!rootHtml.trim()) {
      console.log('[BROWSER DOM] #root is completely empty (blank page)');
    } else {
      console.log('[BROWSER DOM] #root has content, length:', rootHtml.length);
      console.log('[BROWSER DOM Snippet]', rootHtml.substring(0, 150));
    }
  } catch (err) {
    console.log('[BROWSER NAV ERROR]', err.message);
  }
  
  await browser.close();
})();
