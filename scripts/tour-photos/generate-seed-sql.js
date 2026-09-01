#!/usr/bin/env node

/**
 * output.json(TourAPI에서 추출한 장소별 사진 매칭 결과)을 읽어서
 * place 테이블에 넣을 INSERT문(seed.sql)을 생성한다.
 * output.json에는 fetch-photos.js가 검증까지 끝낸 것만 들어있으므로 그대로 사용한다.
 *
 * 실행: node scripts/tour-photos/generate-seed-sql.js
 *
 * place 테이블 스키마 가정 (다르면 아래 컬럼명만 맞춰서 고치면 됨):
 *   place(name, location, image_url)
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'output.json');
const SEED_PATH = path.join(__dirname, 'seed.sql');

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function main() {
  const places = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));

  const lines = [
    '-- scripts/tour-photos/fetch-photos.js 결과를 기반으로 자동 생성됨. 수정 후 직접 실행하지 말고 재생성할 것.',
    'INSERT INTO place (name, location, image_url)',
    'VALUES',
  ];

  const rows = places.map((p) => `  (${escape(p.place)}, ${escape(p.location)}, ${escape(p.image)})`);

  lines.push(rows.join(',\n') + ';');

  fs.writeFileSync(SEED_PATH, lines.join('\n') + '\n', 'utf-8');
  console.log(`${places.length}개 장소 -> ${SEED_PATH}`);
}

main();
