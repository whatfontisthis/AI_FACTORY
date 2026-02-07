import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const CATEGORIES = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: '스마트폰',
    queries: [
      '갤럭시 S24 공기계', '아이폰 15 공기계', '갤럭시 Z플립',
      '샤오미 스마트폰', '갤럭시 S23', '아이폰 14',
      '구글 픽셀', '갤럭시 Z폴드', '아이폰 13'
    ],
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: '노트북/PC',
    queries: [
      'LG그램 노트북', '맥북 에어', 'ROG 게이밍노트북',
      '삼성 갤럭시북', '레노버 씽크패드', 'MSI 게이밍',
      '에이수스 노트북', 'HP 노트북', '델 노트북'
    ],
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: '태블릿',
    queries: [
      '아이패드 프로', '갤럭시탭 S9', '샤오미 패드',
      '아이패드 에어', '갤럭시탭 A9', '서피스 프로',
      '아이패드 미니', '화웨이 패드', '레노버 탭'
    ],
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: '이어폰/헤드폰',
    queries: [
      '에어팟 프로', '갤럭시버즈', '소니 헤드폰',
      '보스 이어폰', 'JBL 이어폰', '젠하이저 헤드폰',
      '삼성 버즈', '샤오미 이어폰', '앱코 이어폰'
    ],
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: '스마트워치',
    queries: [
      '애플워치 울트라', '갤럭시워치6', '샤오미 워치',
      '애플워치 SE', '갤럭시워치5', '화웨이 워치',
      '가민 스마트워치', '핏빗 워치', 'TicWatch'
    ],
  },
];

const TARGET_PER_CATEGORY = 30; // Increased from 10 to 30

// Keywords to exclude accessories/cases
const EXCLUDE_KEYWORDS = [
  '케이스', '커버', '보호필름', '충전기', '케이블', '어댑터',
  '밴드', '스트랩', '시계줄', '거치대', '파우치', '가방',
  '스킨', '스티커', '액정보호', '강화유리', '필름',
  '젤리', '범퍼', '하드', '실리콘', '가죽케이스',
  '클리어커버', '투명케이스', '풀커버', '하이브리드',
];

async function extractProducts(page) {
  return await page.evaluate((excludeKeywords) => {
    const products = [];
    const candidates = document.querySelectorAll('li');

    for (const li of candidates) {
      try {
        const text = li.innerText || '';
        if (!/[\d,]+원/.test(text)) continue;
        if (text.length < 20 || text.length > 1000) continue;

        const img = li.querySelector('img[src*="http"], img[data-src*="http"]');
        if (!img) continue;
        let imgSrc = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        if (!imgSrc.startsWith('http') || imgSrc.includes('icon') || imgSrc.includes('logo') || imgSrc.includes('blank')) continue;

        const nameLink = li.querySelector('a[title], a[class*="name"], a[class*="title"]');
        let name = nameLink?.getAttribute('title') || nameLink?.textContent?.trim() || '';

        if (!name || name.length < 5) {
          const textNodes = [];
          li.querySelectorAll('a, span, p, div, strong, em').forEach(el => {
            const t = el.textContent?.trim() || '';
            if (t.length >= 5 && t.length < 200 && !/^[\d,]+원?$/.test(t) && !t.includes('쿠폰') && !t.includes('무료배송')) {
              textNodes.push(t);
            }
          });
          name = textNodes.sort((a, b) => b.length - a.length)[0] || '';
        }

        if (!name || name.length < 5) continue;

        // Skip accessories
        const nameLower = name.toLowerCase();
        if (excludeKeywords.some(kw => nameLower.includes(kw.toLowerCase()))) continue;

        name = name.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);

        const priceMatches = text.match(/([\d,]+)원/g) || [];
        const prices = priceMatches.map(p => parseInt(p.replace(/[^0-9]/g, ''))).filter(p => p > 100);

        if (prices.length === 0) continue;

        let price, discountPrice = null;
        if (prices.length >= 2) {
          const sorted = [...prices].sort((a, b) => b - a);
          price = sorted[0];
          discountPrice = sorted[1] !== sorted[0] ? sorted[1] : null;
        } else {
          price = prices[0];
        }

        if (price < 1000 || price > 50000000) continue;

        const hasRocket = /로켓|슈팅|당일|내일|익일|새벽/.test(text);

        const ratingMatch = text.match(/(\d\.\d)\s*[점/]/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        const reviewMatch = text.match(/리뷰\s*([\d,]+)|후기\s*([\d,]+)|\(([\d,]+)\)/);
        const reviewCount = reviewMatch
          ? parseInt((reviewMatch[1] || reviewMatch[2] || reviewMatch[3]).replace(/,/g, ''))
          : null;

        products.push({
          name,
          price,
          discountPrice,
          imageUrl: imgSrc,
          rating,
          reviewCount,
          isRocketDelivery: hasRocket,
        });
      } catch (e) {
        // skip
      }
    }

    return products;
  }, EXCLUDE_KEYWORDS);
}

async function main() {
  console.log('=== 11st Electronics/Cellphone Scraper v3 (30 per category) ===\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'ko-KR',
    viewport: { width: 1920, height: 1080 },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const page = await context.newPage();

  const allProducts = [];

  for (const cat of CATEGORIES) {
    console.log(`\n[${cat.name}] - Target: ${TARGET_PER_CATEGORY}`);
    let catProducts = [];

    for (const query of cat.queries) {
      if (catProducts.length >= TARGET_PER_CATEGORY) break;

      const url = `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(query)}`;
      console.log(`  Searching: "${query}"... (collected: ${catProducts.length}/${TARGET_PER_CATEGORY})`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000 + Math.random() * 2000);

        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, 800));
          await page.waitForTimeout(500);
        }
        await page.waitForTimeout(1000);

        const products = await extractProducts(page);
        console.log(`    → Found ${products.length} products (after filtering)`);

        for (const p of products) {
          if (catProducts.length >= TARGET_PER_CATEGORY) break;
          if (catProducts.some(existing => existing.name === p.name)) continue;
          catProducts.push({
            ...p,
            categoryId: cat.id,
            categoryName: cat.name,
          });
        }
      } catch (err) {
        console.log(`    ✖ Error: ${err.message}`);
      }

      await page.waitForTimeout(1500 + Math.random() * 2000);
    }

    console.log(`  ✓ Collected: ${catProducts.length} for ${cat.name}`);
    allProducts.push(...catProducts);
  }

  await browser.close();

  console.log(`\n=== Total: ${allProducts.length} products ===\n`);

  writeFileSync(
    'C:\\Dev\\AI_FACTORY\\Week_4\\Q02_online-shopping-mall\\scripts\\scraped-products.json',
    JSON.stringify(allProducts, null, 2),
    'utf-8'
  );
  console.log('✓ Saved scraped-products.json');
}

main().catch(console.error);
