/**
 * Coupang Product Image Scraper using Playwright
 * Fetches high-quality product images from Coupang search results
 */

const { chromium } = require('playwright');
const fs = require('fs');

const products = [
  { search: 'macbook air m2', ids: ['mac-air-m2-256', 'mac-air-m2-512', 'mac-air-m2-16-512'], name: 'MacBook Air M2 13"' },
  { search: 'macbook air 15', ids: ['mac-air-m3-15-256', 'mac-air-m3-15-512'], name: 'MacBook Air M3 15"' },
  { search: 'macbook pro 14', ids: ['mac-pro-14-m3-512', 'mac-pro-14-m3-1tb'], name: 'MacBook Pro M3 14"' },
  { search: 'macbook pro 16', ids: ['mac-pro-16-m3-512', 'mac-pro-16-m3-1tb'], name: 'MacBook Pro M3 16"' },
  { search: 'imac 24', ids: ['imac-24-m3-256', 'imac-24-m3-512', 'imac-24-m3-16-512'], name: 'iMac 24" M3' },
  { search: 'mac mini m2', ids: ['mac-mini-m2-256', 'mac-mini-m2-512', 'mac-mini-m2-pro'], name: 'Mac mini M2' },
  { search: 'mac studio', ids: ['mac-studio-m2-max', 'mac-studio-m2-ultra'], name: 'Mac Studio M2' },
  { search: 'mac pro', ids: ['mac-pro-m2-ultra'], name: 'Mac Pro M2 Ultra' }
];

async function scrapeCoupangImages() {
  console.log('🚀 Starting Coupang image scraper with Playwright...\n');

  const browser = await chromium.launch({
    headless: false, // Show browser to see what's happening
    args: ['--disable-blink-features=AutomationControlled'] // Avoid detection
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });

  const page = await context.newPage();
  const results = [];
  const sqlUpdates = [];

  for (const product of products) {
    try {
      console.log(`📦 Searching for: ${product.name} (${product.search})`);

      const searchUrl = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(product.search)}&traceId=mldedxzc&channel=user`;

      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for search results to load
      await page.waitForSelector('img[src*="thumbnail.coupangcdn.com"], img[data-src*="thumbnail.coupangcdn.com"]', { timeout: 10000 });

      // Extract the first product thumbnail
      const imageUrl = await page.evaluate(() => {
        // Try different selectors for product images
        const selectors = [
          'img[src*="thumbnail.coupangcdn.com"]',
          'img[data-src*="thumbnail.coupangcdn.com"]',
          'img[alt*="Product"]',
          '.search-product img',
          'li.search-product img'
        ];

        for (const selector of selectors) {
          const img = document.querySelector(selector);
          if (img) {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && src.includes('thumbnail.coupangcdn.com')) {
              // Convert to full URL
              return src.startsWith('//') ? 'https:' + src : src;
            }
          }
        }
        return null;
      });

      if (imageUrl) {
        console.log(`   ✅ Found image: ${imageUrl.substring(0, 80)}...`);

        results.push({
          name: product.name,
          search: product.search,
          ids: product.ids,
          imageUrl: imageUrl
        });

        // Generate SQL UPDATE for each product ID
        product.ids.forEach(id => {
          sqlUpdates.push(`UPDATE w4q2_products SET image_url = '${imageUrl}' WHERE id = '${id}';`);
        });

      } else {
        console.log(`   ❌ No image found for ${product.name}`);
      }

      // Wait a bit between requests to avoid rate limiting
      await page.waitForTimeout(2000);

    } catch (error) {
      console.log(`   ❌ Error for ${product.name}: ${error.message}`);
    }
  }

  await browser.close();

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully scraped: ${results.length}/${products.length} products\n`);

  results.forEach(r => {
    console.log(`${r.name}:`);
    console.log(`  Products: ${r.ids.join(', ')}`);
    console.log(`  Image: ${r.imageUrl}\n`);
  });

  // Save SQL file
  if (sqlUpdates.length > 0) {
    const sqlContent = `-- Coupang Product Image URLs
-- Auto-generated on ${new Date().toISOString()}

${sqlUpdates.join('\n')}

-- Verify updates
SELECT id, name, image_url FROM w4q2_products ORDER BY category, price;
`;

    fs.writeFileSync('database/UPDATE_COUPANG_IMAGES.sql', sqlContent);
    console.log('💾 Saved SQL file: database/UPDATE_COUPANG_IMAGES.sql\n');
    console.log('🎯 To update your database, run this SQL file in Supabase SQL Editor!');
  }

  return results;
}

// Run the scraper
scrapeCoupangImages()
  .then(results => {
    console.log('\n✅ Scraping completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  });
