import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://ngfbtjndmhzgqejwglxb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZmJ0am5kbWh6Z3FlandnbHhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM3MDk2NCwiZXhwIjoyMDg1OTQ2OTY0fQ.eUEmGoYXIeiK18pdZw8vwUaMAsiEqpeDeGZfOX6IVRg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const products = JSON.parse(
  readFileSync('C:\\Dev\\AI_FACTORY\\Week_4\\Q02_online-shopping-mall\\scripts\\cleaned-products.json', 'utf-8')
);

const NEW_CATEGORIES = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: '스마트폰', image_url: 'https://placehold.co/100x100/346aff/white?text=Phone', sort_order: 1 },
  { id: 'c1000000-0000-0000-0000-000000000002', name: '노트북/PC', image_url: 'https://placehold.co/100x100/1e40af/white?text=Laptop', sort_order: 2 },
  { id: 'c1000000-0000-0000-0000-000000000003', name: '태블릿', image_url: 'https://placehold.co/100x100/3b82f6/white?text=Tablet', sort_order: 3 },
  { id: 'c1000000-0000-0000-0000-000000000004', name: '이어폰/헤드폰', image_url: 'https://placehold.co/100x100/6366f1/white?text=Audio', sort_order: 4 },
  { id: 'c1000000-0000-0000-0000-000000000005', name: '스마트워치', image_url: 'https://placehold.co/100x100/8b5cf6/white?text=Watch', sort_order: 5 },
];

async function main() {
  console.log(`Seeding ${products.length} electronics products to Supabase...\n`);

  // Step 1: Clear existing data (in dependency order)
  console.log('Clearing existing data...');
  const tables = ['order_items', 'cart_items', 'orders', 'products'];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null);
    if (error) {
      console.log(`  Warning deleting ${table}: ${error.message}`);
    } else {
      console.log(`  Cleared ${table}`);
    }
  }

  // Step 2: Update categories
  console.log('\nUpdating categories...');
  for (const cat of NEW_CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .update({ name: cat.name, image_url: cat.image_url, sort_order: cat.sort_order })
      .eq('id', cat.id);
    if (error) {
      console.log(`  Error updating ${cat.name}: ${error.message}`);
    } else {
      console.log(`  Updated category: ${cat.name}`);
    }
  }

  // Step 3: Insert products in batches
  console.log('\nInserting products...');

  const rows = products.map((p) => ({
    name: p.name.substring(0, 300),
    description: p.name.substring(0, 150),
    price: p.price,
    discount_price: p.discountPrice || null,
    image_url: p.imageUrl,
    images: [p.imageUrl],
    category_id: p.categoryId,
    rating: p.rating ? Math.min(5.0, Math.max(1.0, p.rating)) : parseFloat((3.5 + Math.random() * 1.4).toFixed(1)),
    review_count: p.reviewCount || Math.floor(50 + Math.random() * 5000),
    is_rocket_delivery: p.isRocketDelivery || Math.random() > 0.4,
    stock: Math.floor(10 + Math.random() * 490),
    options: null,
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { data, error } = await supabase.from('products').insert(batch).select('id, name');

    if (error) {
      console.log(`  Error batch ${i}: ${error.message}`);
      for (const row of batch) {
        const { error: singleErr } = await supabase.from('products').insert(row);
        if (singleErr) {
          console.log(`  Failed: "${row.name.substring(0, 40)}" - ${singleErr.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data.length;
      console.log(`  Inserted batch ${i / 10 + 1}: ${data.length} products`);
    }
  }

  console.log(`\nDone! Inserted ${inserted}/${products.length} products.`);

  // Verify
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Products in database: ${count}`);
}

main().catch(console.error);
