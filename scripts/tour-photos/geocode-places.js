#!/usr/bin/env node

/**
 * seed.sql의 INSERT문에서 (name, address)를 파싱해 네이버 Geocoding API로 좌표를 찾고
 * geocode.sql(place 테이블 UPDATE문)과 geocode-result.json(원본 응답 기록)을 생성한다.
 *
 * seed.sql의 address가 이제 정확한 도로명/지번주소이므로 주소로 바로 지오코딩한다.
 *
 * 실행: node --env-file=.env scripts/tour-photos/geocode-places.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SEED_PATH = path.join(__dirname, 'seed.sql');
const SQL_PATH = path.join(__dirname, 'geocode.sql');
const RESULT_PATH = path.join(__dirname, 'geocode-result.json');
const GEOCODE_URL = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHeaders() {
  const id = process.env.NAVER_GEOCODING_CLIENT_ID;
  const secret = process.env.NAVER_GEOCODING_CLIENT_SECRET;
  if (!id || !secret) {
    console.error('NAVER_GEOCODING_CLIENT_ID / NAVER_GEOCODING_CLIENT_SECRET가 .env에 없습니다.');
    process.exit(1);
  }
  return {
    'X-NCP-APIGW-API-KEY-ID': id,
    'X-NCP-APIGW-API-KEY': secret,
  };
}

// seed.sql의 ('이름', '주소', '이미지URL') 튜플을 파싱한다. (SQL 문자열 이스케이프 '' 처리 포함)
function parseSeed() {
  const sql = fs.readFileSync(SEED_PATH, 'utf-8');
  const tupleRe = /\(\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*\)/g;
  const unescape = (s) => s.replace(/''/g, "'");

  const places = [];
  let match;
  while ((match = tupleRe.exec(sql)) !== null) {
    places.push({ name: unescape(match[1]), address: unescape(match[2]), image: unescape(match[3]) });
  }
  return places;
}

async function geocode(query, headers) {
  const { data } = await axios.get(GEOCODE_URL, {
    headers,
    params: { query },
    timeout: 10000,
  });

  if (data.status !== 'OK' || !data.addresses?.length) return null;
  const best = data.addresses[0];
  return { latitude: Number(best.y), longitude: Number(best.x), matchedAddress: best.roadAddress || best.jibunAddress };
}

async function resolvePlace(place, headers) {
  // 1차: 정확한 주소로 시도
  let hit = await geocode(place.address, headers);
  await sleep(200);

  // 2차: 실패하면 "경주 + 장소명"으로 재시도
  if (!hit) {
    hit = await geocode(`경주 ${place.name}`, headers);
    await sleep(200);
  }

  return hit;
}

function escapeSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const headers = getHeaders();
  const places = parseSeed();

  if (places.length === 0) {
    console.error('seed.sql에서 파싱된 장소가 없습니다.');
    process.exit(1);
  }

  const results = [];
  const sqlLines = ['-- scripts/tour-photos/geocode-places.js 결과. place.name으로 매칭해서 좌표 업데이트.'];
  const failed = [];
  const seen = new Map(); // 좌표 중복 체크용

  for (const place of places) {
    try {
      const hit = await resolvePlace(place, headers);
      if (!hit) {
        failed.push(place.name);
        results.push({ ...place, geocode: null });
        continue;
      }

      const key = `${hit.latitude},${hit.longitude}`;
      const dupWith = seen.get(key);
      seen.set(key, place.name);

      console.log(
        `[성공] ${place.name} -> (${hit.latitude}, ${hit.longitude}) [${hit.matchedAddress}]` +
          (dupWith ? `  ⚠️ "${dupWith}"와 좌표 동일` : '')
      );
      results.push({ ...place, geocode: hit });
      sqlLines.push(
        `UPDATE place SET latitude = ${hit.latitude}, longitude = ${hit.longitude} WHERE name = ${escapeSqlString(place.name)};`
      );
    } catch (err) {
      console.error(`[에러] "${place.name}" 처리 실패: ${err.message}`);
      failed.push(place.name);
    }
  }

  fs.writeFileSync(RESULT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  fs.writeFileSync(SQL_PATH, sqlLines.join('\n') + '\n', 'utf-8');

  console.log(`\n완료. ${places.length}개 중 ${places.length - failed.length}개 성공 -> ${SQL_PATH}`);
  if (failed.length > 0) {
    console.log(`실패(직접 좌표 확인 필요): ${failed.join(', ')}`);
  }
}

main();
