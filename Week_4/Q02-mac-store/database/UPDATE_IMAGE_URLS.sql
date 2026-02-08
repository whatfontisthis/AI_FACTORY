-- SQL Commands to Update Existing Product Image URLs
-- Run these commands if you already have products in your database
-- and want to update them with the new Apple CDN image URLs

-- Update MacBook Air M2 (13-inch) products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/macbook-air/x/images/overview/design/color/design_top_midnight__fvf2p6124tqq_large.jpg'
WHERE id IN ('mac-air-m2-256', 'mac-air-m2-512', 'mac-air-m2-16-512');

-- Update MacBook Air M3 (15-inch) products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/macbook-air/x/images/overview/design/sizes/design_sizes_endframe__ckfqlo8f44eq_large.jpg'
WHERE id IN ('mac-air-m3-15-256', 'mac-air-m3-15-512');

-- Update MacBook Pro M3 (14-inch) products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/macbook-pro/av/images/overview/product-viewer/pv_colors_spaceblack__9ja3btfshpuq_large.jpg'
WHERE id IN ('mac-pro-14-m3-512', 'mac-pro-14-m3-1tb');

-- Update MacBook Pro M3 (16-inch) products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/macbook-pro/av/images/overview/welcome/hero_endframe__e4ls9pihykya_xlarge.jpg'
WHERE id IN ('mac-pro-16-m3-512', 'mac-pro-16-m3-1tb');

-- Update iMac 24-inch M3 products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/imac/v/images/overview/welcome/welcome_hero__f23bdvt2rzam_xlarge.jpg'
WHERE id IN ('imac-24-m3-256', 'imac-24-m3-512', 'imac-24-m3-16-512');

-- Update Mac mini M2 products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/mac-mini/aa/images/overview/welcome/welcome_hero__ckmy0qsqi8ia_large.jpg'
WHERE id IN ('mac-mini-m2-256', 'mac-mini-m2-512', 'mac-mini-m2-pro');

-- Update Mac Studio M2 products
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/mac-studio/k/images/overview/hero/static_front__fmvxob6uyxiu_large.jpg'
WHERE id IN ('mac-studio-m2-max', 'mac-studio-m2-ultra');

-- Update Mac Pro M2 Ultra product
UPDATE w4q2_products
SET image_url = 'https://www.apple.com/v/mac-pro/r/images/overview/compare/compare_mac_pro__qfzopanjej2q_large.png'
WHERE id = 'mac-pro-m2-ultra';

-- Verify the updates
SELECT id, name, image_url
FROM w4q2_products
ORDER BY category, price;
