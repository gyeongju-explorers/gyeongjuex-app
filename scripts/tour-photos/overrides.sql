-- scripts/tour-photos/apply-overrides.js로 생성됨. DB에 place 행이 이미 있다고 가정하고 UPDATE함.
-- 컬럼이 이미 있으면 이 줄은 에러 없이 무시됨 (MySQL 8.0.29+).
ALTER TABLE place ADD COLUMN IF NOT EXISTS image_credit VARCHAR(255);

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/00/2909300.jpg', image_credit = NULL WHERE name = '대릉원';
INSERT INTO place (name, address, image, image_credit)
SELECT '대릉원', '경북 경주시 황남동 31-1', 'https://tong.visitkorea.or.kr/cms2/website/00/2909300.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '대릉원');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/08/2949808.jpg', image_credit = NULL WHERE name = '천마총';
INSERT INTO place (name, address, image, image_credit)
SELECT '천마총', '경북 경주시 황남동 262', 'https://tong.visitkorea.or.kr/cms2/website/08/2949808.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '천마총');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/89/3501989.jpg', image_credit = NULL WHERE name = '첨성대';
INSERT INTO place (name, address, image, image_credit)
SELECT '첨성대', '경북 경주시 인왕동 839-1', 'https://tong.visitkorea.or.kr/cms2/website/89/3501989.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '첨성대');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/89/3020489.JPG', image_credit = NULL WHERE name = '동궁과 월지';
INSERT INTO place (name, address, image, image_credit)
SELECT '동궁과 월지', '경북 경주시 원화로 102 안압지', 'https://tong.visitkorea.or.kr/cms2/website/89/3020489.JPG', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '동궁과 월지');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/99/978299.jpg', image_credit = NULL WHERE name = '국립경주박물관';
INSERT INTO place (name, address, image, image_credit)
SELECT '국립경주박물관', '경북 경주시 일정로 186 국립경주박물관', 'https://tong.visitkorea.or.kr/cms2/website/99/978299.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '국립경주박물관');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/59/3502059.jpg', image_credit = NULL WHERE name = '경주 월성';
INSERT INTO place (name, address, image, image_credit)
SELECT '경주 월성', '경상북도 경주시 인왕동 387-1', 'https://tong.visitkorea.or.kr/cms2/website/59/3502059.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '경주 월성');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/83/2989183.jpg', image_credit = NULL WHERE name = '계림';
INSERT INTO place (name, address, image, image_credit)
SELECT '계림', '경북 경주시 교동 14', 'https://tong.visitkorea.or.kr/cms2/website/83/2989183.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '계림');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/07/3035807.jpg', image_credit = NULL WHERE name = '분황사';
INSERT INTO place (name, address, image, image_credit)
SELECT '분황사', '경북 경주시 분황로 94-11 분황사', 'https://tong.visitkorea.or.kr/cms2/website/07/3035807.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '분황사');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/85/3097785.jpg', image_credit = NULL WHERE name = '불국사';
INSERT INTO place (name, address, image, image_credit)
SELECT '불국사', '경북 경주시 불국로 385 불국사', 'https://tong.visitkorea.or.kr/cms2/website/85/3097785.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '불국사');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/73/3501773.jpg', image_credit = NULL WHERE name = '양동마을';
INSERT INTO place (name, address, image, image_credit)
SELECT '양동마을', '경북 경주시 강동면 양동리 125', 'https://tong.visitkorea.or.kr/cms2/website/73/3501773.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '양동마을');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/24/1087024.jpg', image_credit = NULL WHERE name = '옥산서원';
INSERT INTO place (name, address, image, image_credit)
SELECT '옥산서원', '경상북도 경주시 안강읍 옥산서원길 216-27', 'https://tong.visitkorea.or.kr/cms2/website/24/1087024.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '옥산서원');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/37/3414637.jpg', image_credit = NULL WHERE name = '보문관광단지';
INSERT INTO place (name, address, image, image_credit)
SELECT '보문관광단지', '경북 경주시 보문로 484-7', 'https://tong.visitkorea.or.kr/cms2/website/37/3414637.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '보문관광단지');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/92/2595992.jpg', image_credit = NULL WHERE name = '양남 주상절리 파도소리길';
INSERT INTO place (name, address, image, image_credit)
SELECT '양남 주상절리 파도소리길', '경북 경주시 양남면 동해안로 498-13', 'https://tong.visitkorea.or.kr/cms2/website/92/2595992.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '양남 주상절리 파도소리길');

UPDATE place SET image = 'https://tong.visitkorea.or.kr/cms2/website/49/623349.jpg', image_credit = NULL WHERE name = '경주 남산';
INSERT INTO place (name, address, image, image_credit)
SELECT '경주 남산', '경북 경주시 남산동 산36-1', 'https://tong.visitkorea.or.kr/cms2/website/49/623349.jpg', NULL
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '경주 남산');

UPDATE place SET image = 'https://www.heritage.go.kr/unisearch/images/history_site/1627740.jpg', image_credit = '고도보존육성과 (국가유산포털), 2017', latitude = 35.7381111, longitude = 129.4868056 WHERE name = '대왕암';
INSERT INTO place (name, address, image, image_credit, latitude, longitude)
SELECT '대왕암', '경북 경주시 문무대왕면 봉길리 30-1', 'https://www.heritage.go.kr/unisearch/images/history_site/1627740.jpg', '고도보존육성과 (국가유산포털), 2017', 35.7381111, 129.4868056
WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = '대왕암');

