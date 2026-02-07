-- =============================================
-- Coupang Clone - Seed Data
-- Run in Supabase SQL Editor after migration
-- =============================================

-- Categories
INSERT INTO categories (id, name, sort_order, image_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', '전자제품', 1, 'https://placehold.co/100x100/346aff/white?text=전자'),
  ('c1000000-0000-0000-0000-000000000002', '패션의류', 2, 'https://placehold.co/100x100/e52528/white?text=패션'),
  ('c1000000-0000-0000-0000-000000000003', '식품', 3, 'https://placehold.co/100x100/22c55e/white?text=식품'),
  ('c1000000-0000-0000-0000-000000000004', '홈·리빙', 4, 'https://placehold.co/100x100/f59e0b/white?text=홈'),
  ('c1000000-0000-0000-0000-000000000005', '뷰티', 5, 'https://placehold.co/100x100/ec4899/white?text=뷰티');

-- Products: 전자제품 (Electronics)
INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES
('삼성 갤럭시 버즈3 프로 무선 이어폰', '노이즈캔슬링, 360 오디오, IPX7 방수', 259000, 189000, 'https://placehold.co/400x400/111/white?text=Galaxy+Buds', ARRAY['https://placehold.co/400x400/111/white?text=Buds+1','https://placehold.co/400x400/111/white?text=Buds+2'], 'c1000000-0000-0000-0000-000000000001', 4.8, 3247, true, 150),
('애플 에어팟 프로 2세대 USB-C', 'H2 칩, 적응형 오디오, MagSafe 충전', 329000, 279000, 'https://placehold.co/400x400/111/white?text=AirPods+Pro', ARRAY['https://placehold.co/400x400/111/white?text=AirPods+1'], 'c1000000-0000-0000-0000-000000000001', 4.9, 8921, true, 200),
('LG 그램 17인치 노트북 2025', 'Intel i7, 16GB RAM, 512GB SSD, 1.35kg 초경량', 1890000, 1590000, 'https://placehold.co/400x400/333/white?text=LG+Gram', ARRAY['https://placehold.co/400x400/333/white?text=Gram+1'], 'c1000000-0000-0000-0000-000000000001', 4.7, 1523, true, 30),
('로지텍 MX Master 3S 무선마우스', '조용한 클릭, 8K DPI, USB-C 충전', 129000, 89900, 'https://placehold.co/400x400/444/white?text=MX+Master', ARRAY['https://placehold.co/400x400/444/white?text=Mouse+1'], 'c1000000-0000-0000-0000-000000000001', 4.6, 5672, true, 300),
('삼성 49인치 오디세이 G9 모니터', 'DQHD, 240Hz, 1ms, 1000R 커브드', 1490000, NULL, 'https://placehold.co/400x400/222/white?text=Odyssey+G9', ARRAY['https://placehold.co/400x400/222/white?text=Monitor+1'], 'c1000000-0000-0000-0000-000000000001', 4.5, 892, false, 15);

-- Products: 패션의류 (Fashion)
INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES
('나이키 에어맥스 97 남성 운동화', '클래식 디자인, 풀 에어쿠셔닝', 179000, 139000, 'https://placehold.co/400x400/e52528/white?text=AirMax+97', ARRAY['https://placehold.co/400x400/e52528/white?text=Nike+1'], 'c1000000-0000-0000-0000-000000000002', 4.7, 2341, true, 80),
('유니클로 히트텍 크루넥 긴팔 티셔츠', '발열 기능, 스트레치, 항균 방취', 19900, 12900, 'https://placehold.co/400x400/c44/white?text=HeatTech', ARRAY['https://placehold.co/400x400/c44/white?text=Shirt+1'], 'c1000000-0000-0000-0000-000000000002', 4.4, 15234, true, 500),
('아디다스 트레포일 후디 남녀공용', '레귤러핏, 면 혼방, 캥거루 포켓', 89000, 59900, 'https://placehold.co/400x400/d44/white?text=Adidas+Hoodie', ARRAY['https://placehold.co/400x400/d44/white?text=Hoodie+1'], 'c1000000-0000-0000-0000-000000000002', 4.3, 4521, true, 200),
('리바이스 501 오리지널 데님 팬츠', '스트레이트핏, 100% 면, 미드블루', 109000, 79900, 'https://placehold.co/400x400/36c/white?text=Levis+501', ARRAY['https://placehold.co/400x400/36c/white?text=Jeans+1'], 'c1000000-0000-0000-0000-000000000002', 4.5, 3892, false, 120);

-- Products: 식품 (Food)
INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES
('곰곰 1등급 무항생제 신선 달걀 30구', 'HACCP 인증, 냉장 배송', 8900, 6900, 'https://placehold.co/400x400/22c55e/white?text=달걀+30구', ARRAY['https://placehold.co/400x400/22c55e/white?text=Eggs+1'], 'c1000000-0000-0000-0000-000000000003', 4.8, 28934, true, 1000),
('농심 신라면 멀티팩 5개입 x 4묶음', '매콤한 국물라면의 정석', 12400, NULL, 'https://placehold.co/400x400/e63/white?text=신라면', ARRAY['https://placehold.co/400x400/e63/white?text=Ramen+1'], 'c1000000-0000-0000-0000-000000000003', 4.9, 45123, true, 2000),
('스타벅스 캡슐커피 네스프레소 호환 60개입', '하우스블렌드, 미디엄로스트', 29900, 24900, 'https://placehold.co/400x400/4a2/white?text=Starbucks', ARRAY['https://placehold.co/400x400/4a2/white?text=Coffee+1'], 'c1000000-0000-0000-0000-000000000003', 4.6, 7823, true, 500),
('풀무원 국산콩 두부 300g x 4팩', '무방부제, 국산콩 100%', 5900, 4900, 'https://placehold.co/400x400/6b5/white?text=두부', ARRAY['https://placehold.co/400x400/6b5/white?text=Tofu+1'], 'c1000000-0000-0000-0000-000000000003', 4.5, 9234, true, 800);

-- Products: 홈·리빙 (Home & Living)
INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES
('다이슨 V15 디텍트 무선 청소기', '레이저 먼지감지, 60분 사용, LCD 디스플레이', 1090000, 899000, 'https://placehold.co/400x400/7c3aed/white?text=Dyson+V15', ARRAY['https://placehold.co/400x400/7c3aed/white?text=Dyson+1'], 'c1000000-0000-0000-0000-000000000004', 4.8, 6234, true, 50),
('코멧 극세사 호텔수건 10장 세트', '40수 코마사, 150g 두께감', 15900, 11900, 'https://placehold.co/400x400/f90/white?text=수건+세트', ARRAY['https://placehold.co/400x400/f90/white?text=Towel+1'], 'c1000000-0000-0000-0000-000000000004', 4.4, 34521, true, 3000),
('이케아 KALLAX 칼락스 선반유닛 4x2', '화이트, 조립식, 다용도 수납장', 119000, NULL, 'https://placehold.co/400x400/fc3/white?text=KALLAX', ARRAY['https://placehold.co/400x400/fc3/white?text=Shelf+1'], 'c1000000-0000-0000-0000-000000000004', 4.3, 2341, false, 40),
('필립스 에어프라이어 XXL HD9870', '7.3L 대용량, 스마트센싱, 디지털', 349000, 279000, 'https://placehold.co/400x400/fa0/white?text=AirFryer', ARRAY['https://placehold.co/400x400/fa0/white?text=Fryer+1'], 'c1000000-0000-0000-0000-000000000004', 4.7, 8923, true, 100);

-- Products: 뷰티 (Beauty)
INSERT INTO products (name, description, price, discount_price, image_url, images, category_id, rating, review_count, is_rocket_delivery, stock) VALUES
('설화수 윤조에센스 90ml', '인삼 발효 에센스, 피부결 개선', 93000, 69000, 'https://placehold.co/400x400/ec4899/white?text=설화수', ARRAY['https://placehold.co/400x400/ec4899/white?text=Sulwhasoo+1'], 'c1000000-0000-0000-0000-000000000005', 4.9, 12345, true, 200),
('라네즈 워터뱅크 블루 히알루로닉 크림 50ml', '72시간 보습, 히알루론산', 32000, 25600, 'https://placehold.co/400x400/f0a/white?text=Laneige', ARRAY['https://placehold.co/400x400/f0a/white?text=Laneige+1'], 'c1000000-0000-0000-0000-000000000005', 4.7, 8932, true, 300),
('이니스프리 그린티 씨드 세럼 80ml', '제주 녹차 수분 세럼', 25000, 17500, 'https://placehold.co/400x400/d6a/white?text=Innisfree', ARRAY['https://placehold.co/400x400/d6a/white?text=Green+Tea'], 'c1000000-0000-0000-0000-000000000005', 4.6, 15678, true, 400);
