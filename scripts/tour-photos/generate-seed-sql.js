#!/usr/bin/env node

/**
 * output.json(fetch-photos.js가 찾은 장소별 사진)과 places.json(사람이 직접 관리하는
 * 주소)을 이름으로 합쳐서 place 테이블에 넣을 INSERT문(seed.sql)을 생성한다.
 *
 * 주소는 절대 TourAPI 결과에서 가져오지 않는다 — places.json의 address 필드를 직접
 * 채워야 하며, 비어 있으면 그 장소는 경고만 출력하고 seed.sql에서 제외한다.
 * (fetch-photos.js를 몇 번을 다시 돌려도 이 파일이 만드는 주소는 안 바뀐다.)
 *
 * 실행: node scripts/tour-photos/generate-seed-sql.js
 *
 * place 테이블 스키마 가정 (다르면 아래 컬럼명만 맞춰서 고치면 됨):
 *   place(name, address, image)
 */

const fs = require('fs');
const path = require('path');

const PLACES_PATH = path.join(__dirname, 'places.json');
const OUTPUT_PATH = path.join(__dirname, 'output.json');
const SEED_PATH = path.join(__dirname, 'seed.sql');

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function main() {
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));
  const photos = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));

  const addressByName = new Map(places.map((p) => [p.name, p.address]));

  const rows = [];
  for (const photo of photos) {
    const address = addressByName.get(photo.place);
    if (!address) {
      console.warn(`[제외] "${photo.place}" — places.json에 address가 없음. 직접 채워야 함`);
      continue;
    }
    rows.push(`  (${escape(photo.place)}, ${escape(address)}, ${escape(photo.image)})`);
  }

  const lines = [
    '-- scripts/tour-photos/generate-seed-sql.js로 생성됨 (사진: fetch-photos.js/output.json, 주소: places.json). 수정 후 직접 실행하지 말고 재생성할 것.',
    'INSERT INTO place (name, address, image)',
    'VALUES',
  ];
  lines.push(rows.join(',\n') + ';');

  fs.writeFileSync(SEED_PATH, lines.join('\n') + '\n', 'utf-8');
  console.log(`${rows.length}개 장소 -> ${SEED_PATH}`);
}

main();
