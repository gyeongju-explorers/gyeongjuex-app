-- scripts/tour-photos/generate-seed-sql.js로 생성됨
-- (사진: fetch-photos.js/output.json + overrides.json, 주소: places.json). 수정 후 직접 실행하지 말고 재생성할 것.
INSERT INTO place (name, address, image, image_credit)
VALUES
  ('대릉원', '경북 경주시 황남동 31-1', 'https://tong.visitkorea.or.kr/cms2/website/00/2909300.jpg', NULL),
  ('천마총', '경북 경주시 황남동 262', 'https://tong.visitkorea.or.kr/cms2/website/08/2949808.jpg', NULL),
  ('첨성대', '경북 경주시 인왕동 839-1', 'https://tong.visitkorea.or.kr/cms2/website/89/3501989.jpg', NULL),
  ('동궁과 월지', '경북 경주시 원화로 102 안압지', 'https://tong.visitkorea.or.kr/cms2/website/89/3020489.JPG', NULL),
  ('국립경주박물관', '경북 경주시 일정로 186 국립경주박물관', 'https://tong.visitkorea.or.kr/cms2/website/99/978299.jpg', NULL),
  ('경주 월성', '경상북도 경주시 인왕동 387-1', 'https://tong.visitkorea.or.kr/cms2/website/59/3502059.jpg', NULL),
  ('계림', '경북 경주시 교동 14', 'https://tong.visitkorea.or.kr/cms2/website/83/2989183.jpg', NULL),
  ('분황사', '경북 경주시 분황로 94-11 분황사', 'https://tong.visitkorea.or.kr/cms2/website/07/3035807.jpg', NULL),
  ('불국사', '경북 경주시 불국로 385 불국사', 'https://tong.visitkorea.or.kr/cms2/website/85/3097785.jpg', NULL),
  ('양동마을', '경북 경주시 강동면 양동리 125', 'https://tong.visitkorea.or.kr/cms2/website/73/3501773.jpg', NULL),
  ('옥산서원', '경상북도 경주시 안강읍 옥산서원길 216-27', 'https://tong.visitkorea.or.kr/cms2/website/24/1087024.jpg', NULL),
  ('보문관광단지', '경북 경주시 보문로 484-7', 'https://tong.visitkorea.or.kr/cms2/website/37/3414637.jpg', NULL),
  ('양남 주상절리 파도소리길', '경북 경주시 양남면 동해안로 498-13', 'https://tong.visitkorea.or.kr/cms2/website/92/2595992.jpg', NULL),
  ('경주 남산', '경북 경주시 남산동 산36-1', 'https://tong.visitkorea.or.kr/cms2/website/49/623349.jpg', NULL),
  ('대왕암', '경북 경주시 문무대왕면 봉길리 30-1', 'https://www.heritage.go.kr/unisearch/images/history_site/1627740.jpg', '고도보존육성과 (국가유산포털), 2017');
