-- Sample Mac Products Data
-- Insert Mac product lineup for practice website

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM w4q2_order_items;
-- DELETE FROM w4q2_orders;
-- DELETE FROM w4q2_cart_items;
-- DELETE FROM w4q2_products;

-- MacBook Air M2 (13-inch)
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-air-m2-256', 'MacBook Air 13" M2', 'macbook-air', 1299.00, 'https://www.apple.com/v/macbook-air/x/images/overview/design/color/design_top_midnight__fvf2p6124tqq_large.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "256GB SSD", "display": "13.6-inch Liquid Retina", "battery": "Up to 18 hours"}',
  'Strikingly thin and fast so you can work, play or create anywhere. The new MacBook Air is supercharged by M2.', true),

('mac-air-m2-512', 'MacBook Air 13" M2', 'macbook-air', 1499.00, 'https://www.apple.com/v/macbook-air/x/images/overview/design/color/design_top_midnight__fvf2p6124tqq_large.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "512GB SSD", "display": "13.6-inch Liquid Retina", "battery": "Up to 18 hours"}',
  'Strikingly thin and fast so you can work, play or create anywhere. The new MacBook Air is supercharged by M2.', true),

('mac-air-m2-16-512', 'MacBook Air 13" M2', 'macbook-air', 1699.00, 'https://www.apple.com/v/macbook-air/x/images/overview/design/color/design_top_midnight__fvf2p6124tqq_large.jpg',
  '{"chip": "Apple M2", "memory": "16GB", "storage": "512GB SSD", "display": "13.6-inch Liquid Retina", "battery": "Up to 18 hours"}',
  'Strikingly thin and fast so you can work, play or create anywhere. The new MacBook Air is supercharged by M2.', true);

-- MacBook Air M3 (15-inch)
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-air-m3-15-256', 'MacBook Air 15" M3', 'macbook-air', 1499.00, 'https://www.apple.com/v/macbook-air/x/images/overview/design/sizes/design_sizes_endframe__ckfqlo8f44eq_large.jpg',
  '{"chip": "Apple M3", "memory": "8GB", "storage": "256GB SSD", "display": "15.3-inch Liquid Retina", "battery": "Up to 18 hours"}',
  'The spacious 15-inch MacBook Air is impossibly thin and has a stunning Liquid Retina display.', true),

('mac-air-m3-15-512', 'MacBook Air 15" M3', 'macbook-air', 1699.00, 'https://www.apple.com/v/macbook-air/x/images/overview/design/sizes/design_sizes_endframe__ckfqlo8f44eq_large.jpg',
  '{"chip": "Apple M3", "memory": "8GB", "storage": "512GB SSD", "display": "15.3-inch Liquid Retina", "battery": "Up to 18 hours"}',
  'The spacious 15-inch MacBook Air is impossibly thin and has a stunning Liquid Retina display.', true);

-- MacBook Pro M3 (14-inch)
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-pro-14-m3-512', 'MacBook Pro 14" M3', 'macbook-pro', 1999.00, 'https://www.apple.com/v/macbook-pro/av/images/overview/product-viewer/pv_colors_spaceblack__9ja3btfshpuq_large.jpg',
  '{"chip": "Apple M3 Pro", "memory": "18GB", "storage": "512GB SSD", "display": "14.2-inch Liquid Retina XDR", "battery": "Up to 22 hours"}',
  'Mind-blowing performance. Game-changing battery life. Brilliant Retina XDR display.', true),

('mac-pro-14-m3-1tb', 'MacBook Pro 14" M3', 'macbook-pro', 2299.00, 'https://www.apple.com/v/macbook-pro/av/images/overview/product-viewer/pv_colors_spaceblack__9ja3btfshpuq_large.jpg',
  '{"chip": "Apple M3 Pro", "memory": "18GB", "storage": "1TB SSD", "display": "14.2-inch Liquid Retina XDR", "battery": "Up to 22 hours"}',
  'Mind-blowing performance. Game-changing battery life. Brilliant Retina XDR display.', true);

-- MacBook Pro M3 (16-inch)
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-pro-16-m3-512', 'MacBook Pro 16" M3 Max', 'macbook-pro', 3499.00, 'https://www.apple.com/v/macbook-pro/av/images/overview/welcome/hero_endframe__e4ls9pihykya_xlarge.jpg',
  '{"chip": "Apple M3 Max", "memory": "36GB", "storage": "1TB SSD", "display": "16.2-inch Liquid Retina XDR", "battery": "Up to 22 hours"}',
  'The most powerful MacBook Pro ever is here. Supercharged by M3 Max.', true),

('mac-pro-16-m3-1tb', 'MacBook Pro 16" M3 Max', 'macbook-pro', 3999.00, 'https://www.apple.com/v/macbook-pro/av/images/overview/welcome/hero_endframe__e4ls9pihykya_xlarge.jpg',
  '{"chip": "Apple M3 Max", "memory": "48GB", "storage": "1TB SSD", "display": "16.2-inch Liquid Retina XDR", "battery": "Up to 22 hours"}',
  'The most powerful MacBook Pro ever is here. Supercharged by M3 Max.', true);

-- iMac 24-inch M3
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('imac-24-m3-256', 'iMac 24" M3', 'imac', 1499.00, 'https://www.apple.com/v/imac/v/images/overview/welcome/welcome_hero__f23bdvt2rzam_xlarge.jpg',
  '{"chip": "Apple M3", "memory": "8GB", "storage": "256GB SSD", "display": "24-inch 4.5K Retina", "colors": "7 colors"}',
  'Say hello to the new iMac. Inspired by the best of Apple. Transformed by M3.', true),

('imac-24-m3-512', 'iMac 24" M3', 'imac', 1699.00, 'https://www.apple.com/v/imac/v/images/overview/welcome/welcome_hero__f23bdvt2rzam_xlarge.jpg',
  '{"chip": "Apple M3", "memory": "8GB", "storage": "512GB SSD", "display": "24-inch 4.5K Retina", "colors": "7 colors"}',
  'Say hello to the new iMac. Inspired by the best of Apple. Transformed by M3.', true),

('imac-24-m3-16-512', 'iMac 24" M3', 'imac', 1899.00, 'https://www.apple.com/v/imac/v/images/overview/welcome/welcome_hero__f23bdvt2rzam_xlarge.jpg',
  '{"chip": "Apple M3", "memory": "16GB", "storage": "512GB SSD", "display": "24-inch 4.5K Retina", "colors": "7 colors"}',
  'Say hello to the new iMac. Inspired by the best of Apple. Transformed by M3.', true);

-- Mac mini M2
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-mini-m2-256', 'Mac mini M2', 'mac-mini', 699.00, 'https://www.apple.com/v/mac-mini/aa/images/overview/welcome/welcome_hero__ckmy0qsqi8ia_large.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "256GB SSD", "ports": "Multiple Thunderbolt 4"}',
  'Packed with power. Phenomenal value. Mac mini is the most affordable Mac.', true),

('mac-mini-m2-512', 'Mac mini M2', 'mac-mini', 899.00, 'https://www.apple.com/v/mac-mini/aa/images/overview/welcome/welcome_hero__ckmy0qsqi8ia_large.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "512GB SSD", "ports": "Multiple Thunderbolt 4"}',
  'Packed with power. Phenomenal value. Mac mini is the most affordable Mac.', true),

('mac-mini-m2-pro', 'Mac mini M2 Pro', 'mac-mini', 1399.00, 'https://www.apple.com/v/mac-mini/aa/images/overview/welcome/welcome_hero__ckmy0qsqi8ia_large.jpg',
  '{"chip": "Apple M2 Pro", "memory": "16GB", "storage": "512GB SSD", "ports": "Multiple Thunderbolt 4"}',
  'The M2 Pro version brings even more power to the tiny Mac mini.', true);

-- Mac Studio M2
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-studio-m2-max', 'Mac Studio M2 Max', 'mac-studio', 2499.00, 'https://www.apple.com/v/mac-studio/k/images/overview/hero/static_front__fmvxob6uyxiu_large.jpg',
  '{"chip": "Apple M2 Max", "memory": "32GB", "storage": "512GB SSD", "ports": "Extensive connectivity"}',
  'Supercharged by M2 Max and M2 Ultra. A pro desktop for creators.', true),

('mac-studio-m2-ultra', 'Mac Studio M2 Ultra', 'mac-studio', 3999.00, 'https://www.apple.com/v/mac-studio/k/images/overview/hero/static_front__fmvxob6uyxiu_large.jpg',
  '{"chip": "Apple M2 Ultra", "memory": "64GB", "storage": "1TB SSD", "ports": "Extensive connectivity"}',
  'M2 Ultra takes Mac Studio to a whole new level of performance.', true);

-- Mac Pro M2 Ultra
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-pro-m2-ultra', 'Mac Pro M2 Ultra', 'mac-pro', 6999.00, 'https://www.apple.com/v/mac-pro/r/images/overview/compare/compare_mac_pro__qfzopanjej2q_large.png',
  '{"chip": "Apple M2 Ultra", "memory": "64GB", "storage": "1TB SSD", "expansion": "PCIe slots"}',
  'The most powerful Mac ever. Built for professionals who need extreme performance.', true);

-- Verification query
SELECT
  category,
  COUNT(*) as product_count,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM w4q2_products
GROUP BY category
ORDER BY category;
