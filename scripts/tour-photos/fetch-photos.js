#!/usr/bin/env node

/**
 * 한국관광공사 TourAPI에서 places.json에 적힌 장소별로 사진을 검색해
 * output.json에 장소당 1장(대표 이미지 후보)을 저장한다.
 *
 * 소스 우선순위:
 *   1) PhokoAwrdService (관광공모전 수상작) — 수는 적지만(전국 95장) 큐레이션된 고품질 사진
 *   2) PhotoGalleryService1 (관광사진갤러리) — 전국 수만 장, 커버리지가 훨씬 넓은 일반 사진 DB
 * 두 소스 모두 "장소명이 경주"이고 "검색어가 제목/촬영장소/키워드에 실제로 등장"하는 경우만
 * 검증된 매칭으로 인정한다. 검증을 통과하지 못하면 needsReview=true로 표시해 수동 확인을 유도한다.
 *
 * 실행: node --env-file=.env scripts/tour-photos/fetch-photos.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const REGION_HINT = '경주';
const PLACES_PATH = path.join(__dirname, 'places.json');
const OUTPUT_PATH = path.join(__dirname, 'output.json');

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
      copyrightType: item.cpyrhtDivCd,
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
      copyrightType: null,
    }),
  },
];

function getServiceKey() {
  const raw = process.env.TOUR_API_SERVICE_KEY;
  if (!raw || raw.includes('여기에')) {
    console.error('TOUR_API_SERVICE_KEY가 .env에 없습니다. .env 파일에 발급받은 서비스키를 넣어주세요.');
    process.exit(1);
  }
  // data.go.kr 키는 이미 URL-인코딩된 상태로 발급되는 경우가 많음.
  // axios가 params를 다시 인코딩하므로, 디코딩된 원문을 넘겨야 이중 인코딩을 피할 수 있음.
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

function isDrone(candidate) {
  return (candidate.award || '').includes('드론');
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

  if (typeof data === 'string') {
    throw new Error(`[${source.label}] API가 XML 에러를 반환함 (서비스키/활용신청 상태 확인): ${data.slice(0, 200)}`);
  }

  const header = data?.response?.header;
  if (header?.resultCode !== '0000') {
    throw new Error(`[${source.label}] API 에러 [${header?.resultCode}] ${header?.resultMsg}`);
  }

  return toArray(data?.response?.body?.items?.item).map(source.mapItem);
}

function verify(candidates, keyword) {
  // 제목/촬영장소(주소)에 검색어가 직접 등장하는 것만 "확실한 매칭"으로 인정한다.
  // 태그(keywordText)에만 등장하는 경우는 제외 — 같은 유적지구 태그(예: "월성지구")를
  // 여러 무관한 장소가 공유해서, 태그만 보면 엉뚱한 장소가 걸리는 문제가 있었다.
  return candidates.filter((c) => {
    const inRegion = (c.location || '').includes(REGION_HINT) || (c.keywordText || '').includes(REGION_HINT);
    const mentionsKeyword = (c.title || '').includes(keyword) || (c.location || '').includes(keyword);
    return inRegion && mentionsKeyword;
  });
}

async function resolvePlace(place, serviceKey) {
  let bestFallback = null;
  let totalCandidates = 0;

  for (const source of SOURCES) {
    for (const keyword of place.keywords) {
      const rawCandidates = await searchSource(source, keyword, serviceKey);
      totalCandidates += rawCandidates.length;
      await sleep(250);
      // 드론 부문 사진은 후보에서 아예 제외 — 검증 매칭이든 fallback이든 절대 쓰지 않음
      const candidates = rawCandidates.filter((c) => !isDrone(c));
      if (candidates.length === 0) continue;

      const verified = verify(candidates, keyword);
      if (verified.length > 0) {
        return { selected: { ...verified[0], source: source.label }, needsReview: false, poolSize: verified.length, totalCandidates };
      }
      if (!bestFallback) bestFallback = { ...candidates[0], source: source.label };
    }
  }

  if (bestFallback) {
    return { selected: bestFallback, needsReview: true, poolSize: 1, totalCandidates };
  }
  return { selected: null, needsReview: false, poolSize: 0, totalCandidates };
}

async function main() {
  const serviceKey = getServiceKey();
  const places = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));

  const results = [];

  for (const place of places) {
    try {
      const { selected, needsReview, poolSize, totalCandidates } = await resolvePlace(place, serviceKey);

      if (!selected) {
        console.warn(`[제외] "${place.name}" — 드론 부문 제외 후 쓸 수 있는 사진 없음 (직접 채워야 함)`);
      } else if (needsReview) {
        console.warn(`[제외] "${place.name}" — 검증을 통과한 결과가 없어 자동으로는 못 정함 (직접 확인 필요)`);
      } else {
        console.log(`[매칭] "${place.name}" -> "${selected.title}" (source=${selected.source}, 후보 ${poolSize}개, 전체 조회 ${totalCandidates}개)`);
        results.push({
          place: place.name,
          location: selected.location,
          image: selected.thumb || selected.image,
        });
      }
    } catch (err) {
      console.error(`[에러] "${place.name}" 처리 실패: ${err.message}`);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n완료. 총 ${places.length}개 장소 중 ${results.length}개를 output.json에 저장함 (나머지는 직접 채워야 함) -> ${OUTPUT_PATH}`);
}

main();
