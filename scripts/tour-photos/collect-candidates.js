#!/usr/bin/env node

/**
 * fetch-photos.js는 장소당 1장만 자동으로 골라서 저장하지만, 실제로는 후보가
 * 여러 장(많으면 30장)인 경우가 많다. 이 스크립트는 자동으로 고르지 않고
 * 장소별 후보 사진을 전부 모아서 candidates.json에 저장한다 — 사람이 직접
 * 보고 고를 수 있게 하기 위함. (build-gallery.js와 함께 사용)
 *
 * 실행: node --env-file=.env scripts/tour-photos/collect-candidates.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const REGION_HINT = '경주';
const MAX_PER_PLACE = 10;
const PLACES_PATH = path.join(__dirname, 'places.json');
const CANDIDATES_PATH = path.join(__dirname, 'candidates.json');

const SOURCES = [
  {
    label: 'award',
    url: 'http://apis.data.go.kr/B551011/PhokoAwrdService/phokoAwrdList',
    extraParams: { arrange: 'C' },
    mapItem: (item) => ({
      title: item.koTitle,
      location: item.koFilmst,
      keywordText: item.koKeyword,
      image: item.orgImage,
      thumb: item.thumbImage,
      contentId: item.contentId,
      photographer: item.koCmanNm,
      award: item.koWnprzDiz,
    }),
  },
  {
    label: 'gallery',
    url: 'http://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1',
    extraParams: { arrange: 'C' },
    mapItem: (item) => ({
      title: item.galTitle,
      location: item.galPhotographyLocation,
      keywordText: item.galSearchKeyword,
      image: item.galWebImageUrl,
      thumb: item.galWebImageUrl,
      contentId: item.galContentId,
      photographer: item.galPhotographer,
      award: null,
    }),
  },
];

function getServiceKey() {
  const raw = process.env.TOUR_API_SERVICE_KEY;
  if (!raw || raw.includes('여기에')) {
    console.error('TOUR_API_SERVICE_KEY가 .env에 없습니다.');
    process.exit(1);
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function toArray(items) {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchSource(source, keyword, serviceKey) {
  const { data } = await axios.get(source.url, {
    params: {
      serviceKey,
      numOfRows: 30,
      pageNo: 1,
      MobileOS: 'ETC',
      MobileApp: 'GyeongjuExplorers',
      _type: 'json',
      keyword,
      ...source.extraParams,
    },
    timeout: 10000,
  });

  if (typeof data === 'string') return [];
  const header = data?.response?.header;
  if (header?.resultCode !== '0000') return [];

  return toArray(data?.response?.body?.items?.item).map((raw) => ({
    ...source.mapItem(raw),
    source: source.label,
  }));
}

async function collectForPlace(place, serviceKey) {
  const seen = new Map(); // `${source}:${contentId}` -> candidate

  for (const source of SOURCES) {
    for (const keyword of place.keywords) {
      const items = await searchSource(source, keyword, serviceKey);
      await sleep(250);
      for (const item of items) {
        const key = `${item.source}:${item.contentId}`;
        if (!seen.has(key)) seen.set(key, item);
      }
    }
  }

  const all = Array.from(seen.values()).map((c) => ({
    ...c,
    inRegion: (c.location || '').includes(REGION_HINT) || (c.keywordText || '').includes(REGION_HINT),
    isDrone: (c.award || '').includes('드론'),
  }));

  // 우선순위: 경주+비드론 > 경주+드론 > 그 외
  all.sort((a, b) => {
    const score = (c) => (c.inRegion && !c.isDrone ? 2 : c.inRegion ? 1 : 0);
    return score(b) - score(a);
  });

  return all.slice(0, MAX_PER_PLACE);
}

async function main() {
  const serviceKey = getServiceKey();
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));

  const result = {};
  for (const place of places) {
    const candidates = await collectForPlace(place, serviceKey);
    result[place.name] = candidates;
    console.log(`"${place.name}": 후보 ${candidates.length}개 (경주 확인됨 ${candidates.filter((c) => c.inRegion).length}개)`);
  }

  fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n완료 -> ${CANDIDATES_PATH}`);
}

main();
