#!/usr/bin/env node

/**
 * DB에 이미 place 행들이 들어있는 상태(=seed.sql을 예전에 이미 실행한 상태)에서,
 * overrides.json에 있는 사진 URL/출처/좌표만 UPDATE로 반영하기 위한 SQL을 만든다.
 * (처음부터 새로 seed할 땐 이 스크립트 대신 seed.sql + geocode.sql을 쓰면 된다.)
 *
 * overrides.json에 있지만 places.json엔 없는 이름은 건너뛴다(주소를 모르니 INSERT 불가).
 * overrides.json에 있는 장소가 DB에 아직 없는 경우(예: 대왕암)를 대비해 INSERT ... 도
 * 같이 만들되, 이미 있으면 아무 영향 없도록 ON DUPLICATE KEY 대신 이름으로 먼저 지우고
 * 다시 넣지 않고, 대신 "없을 때만" 넣도록 INSERT ... SELECT ... WHERE NOT EXISTS 형태로 만든다.
 *
 * 실행: node scripts/tour-photos/apply-overrides.js
 */

const fs = require('fs');
const path = require('path');

const PLACES_PATH = path.join(__dirname, 'places.json');
const OVERRIDES_PATH = path.join(__dirname, 'overrides.json');
const OUT_PATH = path.join(__dirname, 'overrides.sql');

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function main() {
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));
  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));
  const addressByName = new Map(places.map((p) => [p.name, p.address]));

  const lines = [
    '-- scripts/tour-photos/apply-overrides.js로 생성됨. DB에 place 행이 이미 있다고 가정하고 UPDATE함.',
    '-- 컬럼이 이미 있으면 이 줄은 에러 없이 무시됨 (MySQL 8.0.29+).',
    'ALTER TABLE place ADD COLUMN IF NOT EXISTS image_credit VARCHAR(255);',
    '',
  ];

  for (const [name, override] of Object.entries(overrides)) {
    const address = addressByName.get(name);
    if (!address) {
      console.warn(`[제외] "${name}" — places.json에 없음`);
      continue;
    }

    const sets = [`image = ${escape(override.image)}`, `image_credit = ${escape(override.imageCredit ?? null)}`];
    if (override.latitude !== undefined) sets.push(`latitude = ${override.latitude}`);
    if (override.longitude !== undefined) sets.push(`longitude = ${override.longitude}`);

    // 이미 있는 행 업데이트.
    lines.push(`UPDATE place SET ${sets.join(', ')} WHERE name = ${escape(name)};`);

    // 아직 없는 행(예: 원래 seed.sql에서 제외됐던 대왕암)은 새로 추가.
    const insertCols = ['name', 'address', 'image', 'image_credit'];
    const insertVals = [escape(name), escape(address), escape(override.image), escape(override.imageCredit ?? null)];
    if (override.latitude !== undefined) {
      insertCols.push('latitude');
      insertVals.push(String(override.latitude));
    }
    if (override.longitude !== undefined) {
      insertCols.push('longitude');
      insertVals.push(String(override.longitude));
    }
    lines.push(
      `INSERT INTO place (${insertCols.join(', ')})\n` +
        `SELECT ${insertVals.join(', ')}\n` +
        `WHERE NOT EXISTS (SELECT 1 FROM place WHERE name = ${escape(name)});`
    );
    lines.push('');
  }

  fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n', 'utf-8');
  console.log(`-> ${OUT_PATH}`);
}

main();
