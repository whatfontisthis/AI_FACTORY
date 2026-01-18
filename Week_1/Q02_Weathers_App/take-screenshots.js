const puppeteer = require('/Users/woobinlee/.npm-global/lib/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1200, height: 800 });
  
  // Open the HTML file
  const htmlPath = path.join(__dirname, 'test-autocomplete.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take initial screenshot
  await page.screenshot({
    path: '.agent-screenshots/autocomplete-initial.png',
    fullPage: false
  });
  
  // Type in search box to trigger autocomplete
  await page.type('#searchInput', '서울');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Take screenshot with autocomplete visible
  await page.screenshot({
    path: '.agent-screenshots/autocomplete-seoul.png',
    fullPage: false
  });
  
  // Clear and type another search
  await page.click('#searchInput', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('#searchInput', '부산');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Take screenshot with Busan results
  await page.screenshot({
    path: '.agent-screenshots/autocomplete-busan.png',
    fullPage: false
  });
  
  // Select an item
  await page.click('div[onclick*="부산광역시"]');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Take screenshot after selection
  await page.screenshot({
    path: '.agent-screenshots/autocomplete-selected.png',
    fullPage: false
  });
  
  await browser.close();
  console.log('Screenshots taken successfully!');
})();