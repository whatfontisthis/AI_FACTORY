import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('C:\\Dev\\AI_FACTORY\\Week_4\\Q02_online-shopping-mall\\scripts\\scraped-products.json', 'utf-8'));

function cleanProductName(rawName) {
  let name = rawName;

  // Remove "상품명" / "상품정보" anywhere — if it appears mid-string, keep the part after it
  const midIdx = name.lastIndexOf('상품명');
  if (midIdx > 0) {
    name = name.substring(midIdx);
  }
  name = name.replace(/^상품(명|정보)\s*/, '');

  // Remove promotional prefixes like [최종XX만+...], [혜.택.가 XX만], etc
  name = name.replace(/\[.*?\]/g, '');

  // Remove "구매 X천+프로모션 정보" etc
  name = name.replace(/구매\s*[\d,]+[천만백]?\+?프로모션\s*정보/g, '');

  // Remove "브랜드명XXX"
  name = name.replace(/브랜드명\S+/g, '');

  // Remove "11번가 최저가" and similar badges
  name = name.replace(/11번가\s*최저가/g, '');
  name = name.replace(/30일\s*내\s*최저가\s*안내/g, '');

  // Cut at first price pattern (digits + 원)
  const priceIdx = name.search(/[\d,]{3,}원/);
  if (priceIdx > 10) {
    name = name.substring(0, priceIdx);
  }

  // Cut at common suffix patterns
  const cutPatterns = [
    /할인율\d/,
    /판매가/,
    /배송비/,
    /배송정보/,
    /최대할인/,
    /판매자평점/,
    /혜택/,
    /11pay/,
    /카드\/페이/,
    /쿠폰/,
  ];
  for (const pattern of cutPatterns) {
    const match = name.search(pattern);
    if (match > 10) {
      name = name.substring(0, match);
    }
  }

  // Clean up
  name = name.replace(/\s+/g, ' ').trim();

  // Remove trailing special chars and leftover fragments
  name = name.replace(/[~\-\/\|,]+$/, '').trim();
  name = name.replace(/30일 내 최저가$/, '').trim();
  name = name.replace(/\(LIVE체감.*?원대\)/, '').trim();

  return name;
}

const cleaned = raw.map((p, i) => {
  const cleanName = cleanProductName(p.name);

  // Fix prices: if discount is very close to price (within 1%), probably not a real discount
  let { price, discountPrice } = p;
  if (discountPrice && price && (price - discountPrice) / price < 0.01) {
    discountPrice = null;
  }

  // Ensure price is the larger one
  if (discountPrice && discountPrice > price) {
    [price, discountPrice] = [discountPrice, price];
  }

  return {
    name: cleanName || `상품 ${i + 1}`,
    price,
    discountPrice,
    imageUrl: p.imageUrl,
    rating: p.rating,
    reviewCount: p.reviewCount,
    isRocketDelivery: p.isRocketDelivery,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
  };
});

// Filter out items with very short names (likely garbage)
const valid = cleaned.filter(p => p.name.length >= 5 && p.price >= 1000);

console.log(`Cleaned: ${valid.length}/${raw.length} products\n`);

// Print a sample per category
const byCategory = {};
for (const p of valid) {
  if (!byCategory[p.categoryName]) byCategory[p.categoryName] = [];
  byCategory[p.categoryName].push(p);
}

for (const [cat, products] of Object.entries(byCategory)) {
  console.log(`\n[${cat}] (${products.length})`);
  for (const p of products.slice(0, 3)) {
    const disc = p.discountPrice ? ` (할인: ${p.discountPrice.toLocaleString()}원)` : '';
    console.log(`  - ${p.name.substring(0, 60)} | ${p.price.toLocaleString()}원${disc}`);
  }
  if (products.length > 3) console.log(`  ... +${products.length - 3} more`);
}

// Save cleaned JSON
writeFileSync(
  'C:\\Dev\\AI_FACTORY\\Week_4\\Q02_online-shopping-mall\\scripts\\cleaned-products.json',
  JSON.stringify(valid, null, 2),
  'utf-8'
);

// Generate SQL
generateSQL(valid);

function generateSQL(products) {
  const esc = (s) => s.replace(/'/g, "''");

  let sql = `-- Scraped & Cleaned Products (${products.length} items)\n`;
  sql += `-- Source: 11st.co.kr | Generated: ${new Date().toISOString()}\n\n`;
  sql += `-- Clear existing product-related data\n`;
  sql += `DELETE FROM order_items;\n`;
  sql += `DELETE FROM cart_items;\n`;
  sql += `DELETE FROM orders;\n`;
  sql += `DELETE FROM products;\n\n`;

  for (const p of products) {
    const rating = p.rating
      ? Math.min(5.0, Math.max(1.0, p.rating)).toFixed(1)
      : (3.5 + Math.random() * 1.4).toFixed(1);
    const reviewCount = p.reviewCount || Math.floor(50 + Math.random() * 5000);
    const stock = Math.floor(10 + Math.random() * 490);
    const isRocket = p.isRocketDelivery || Math.random() > 0.4; // ~60% rocket

    sql += `INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES (\n`;
    sql += `  '${esc(p.name.substring(0, 300))}',\n`;
    sql += `  '${esc(p.name.substring(0, 150))}',\n`;
    sql += `  ${p.price},\n`;
    sql += `  ${p.discountPrice || 'NULL'},\n`;
    sql += `  '${esc(p.imageUrl)}',\n`;
    sql += `  ARRAY['${esc(p.imageUrl)}'],\n`;
    sql += `  '${p.categoryId}',\n`;
    sql += `  ${rating},\n`;
    sql += `  ${reviewCount},\n`;
    sql += `  ${isRocket},\n`;
    sql += `  ${stock}\n`;
    sql += `);\n\n`;
  }

  writeFileSync(
    'C:\\Dev\\AI_FACTORY\\Week_4\\Q02_online-shopping-mall\\scripts\\seed-scraped.sql',
    sql,
    'utf-8'
  );
  console.log('\nSaved seed-scraped.sql');
}
