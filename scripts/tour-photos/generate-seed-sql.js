#!/usr/bin/env node

/**
 * output.json(fetch-photos.js가 찾은 장소별 사진)과 places.json(사람이 직접 관리하는
 * 주소)을 이름으로 합쳐서 place 테이블에 넣을 INSERT문(seed.sql)을 생성한다.
 *
 * overrides.json(사람이 gallery.html 보고 직접 고른 사진, 필요하면 image_credit도)이 있으면
 * 그 장소는 output.json 값 대신 overrides.json 값을 쓴다. overrides.json에만 있고
 * output.json엔 없는 장소(예: 자동으로는 매칭 못 찾은 곳)도 포함된다.
 *
 * 주소는 절대 TourAPI 결과에서 가져오지 않는다 — places.json의 address 필드를 직접
 * 채워야 하며, 비어 있으면 그 장소는 경고만 출력하고 seed.sql에서 제외한다.
 * (fetch-photos.js를 몇 번을 다시 돌려도 이 파일이 만드는 주소는 안 바뀐다.)
 *
 * 실행: node scripts/tour-photos/generate-seed-sql.js
 *
 * place 테이블 스키마 가정 (다르면 아래 컬럼명만 맞춰서 고치면 됨):
 *   place(name, address, image, image_credit)
 */

const fs = require('fs');
const path = require('path');

const PLACES_PATH = path.join(__dirname, 'places.json');
const OUTPUT_PATH = path.join(__dirname, 'output.json');
const OVERRIDES_PATH = path.join(__dirname, 'overrides.json');
const SEED_PATH = path.join(__dirname, 'seed.sql');

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function main() {
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));
  const photos = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const overrides = readJsonIfExists(OVERRIDES_PATH, {});

  const addressByName = new Map(places.map((p) => [p.name, p.address]));
  const imageByName = new Map(photos.map((p) => [p.place, p.image]));

  // overrides.json에만 있는 장소도 처리 대상에 포함시키기 위해 이름 목록을 합친다.
  const names = new Set([...imageByName.keys(), ...Object.keys(overrides)]);

  const rows = [];
  for (const name of names) {
    const address = addressByName.get(name);
    if (!address) {
      console.warn(`[제외] "${name}" — places.json에 address가 없음. 직접 채워야 함`);
      continue;
    }

    const override = overrides[name];
    const image = override?.image ?? imageByName.get(name);
    if (!image) {
      console.warn(`[제외] "${name}" — 쓸 수 있는 사진이 없음`);
      continue;
    }
    const imageCredit = override?.imageCredit ?? null;

    rows.push(`  (${escape(name)}, ${escape(address)}, ${escape(image)}, ${escape(imageCredit)})`);
  }

  const lines = [
    '-- scripts/tour-photos/generate-seed-sql.js로 생성됨',
    '-- (사진: fetch-photos.js/output.json + overrides.json, 주소: places.json). 수정 후 직접 실행하지 말고 재생성할 것.',
    'INSERT INTO place (name, address, image, image_credit)',
    'VALUES',
  ];
  lines.push(rows.join(',\n') + ';');

  fs.writeFileSync(SEED_PATH, lines.join('\n') + '\n', 'utf-8');
  console.log(`${rows.length}개 장소 -> ${SEED_PATH}`);
}

main();
