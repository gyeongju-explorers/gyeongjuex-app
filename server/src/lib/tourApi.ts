const BASE_URL = 'http://apis.data.go.kr/B551011/TarRlteTarService1';
// 경주가 소속된 지역/시군구 코드 (한국관광공사_TourAPI_관광지_시군구_코드정보 참고) — 앱이
// 경주 전용이라 고정값으로 둔다.
const GYEONGJU_AREA_CD = '47';
const GYEONGJU_SIGNGU_CD = '47130';
const MAX_RELATED_SPOTS = 5;

export type RelatedTouristSpot = {
  name: string;
  category: string;
};

function getServiceKey(): string | null {
  const raw = process.env.TOUR_API_SERVICE_KEY;
  if (!raw) return null;
  // data.go.kr 키는 이미 URL-인코딩된 상태로 발급되는 경우가 많아, URLSearchParams가
  // 다시 인코딩하기 전에 디코딩된 원문으로 되돌려야 이중 인코딩을 피할 수 있다.
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function baseYmFor(monthsAgo: number): string {
  const date = new Date();
  date.setDate(1); // 월말 근처 호출 시 setMonth가 다음 달로 넘어가는 것을 방지.
  date.setMonth(date.getMonth() - monthsAgo);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
}

interface RelatedSpotItem {
  rlteTatsNm?: string;
  rlteCtgryLclsNm?: string;
  rlteCtgrySclsNm?: string;
  rlteRank?: string;
}

async function searchKeyword(serviceKey: string, keyword: string, baseYm: string) {
  const params = new URLSearchParams({
    serviceKey,
    MobileOS: 'ETC',
    MobileApp: 'GyeongjuExplorers',
    _type: 'json',
    areaCd: GYEONGJU_AREA_CD,
    signguCd: GYEONGJU_SIGNGU_CD,
    baseYm,
    keyword,
    numOfRows: '20',
    pageNo: '1',
  });

  const response = await fetch(`${BASE_URL}/searchKeyword1?${params.toString()}`, {
    signal: AbortSignal.timeout(5000),
  });
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    // 서비스키/활용신청 에러는 XML로 내려온다 — 추천 없음으로 처리.
    return [];
  }

  const body = (data as any)?.response;
  if (body?.header?.resultCode !== '0000') return [];

  const items = body?.body?.items?.item;
  const list: RelatedSpotItem[] = Array.isArray(items) ? items : items ? [items] : [];
  return list;
}

// 완료한 장소명으로 한국관광공사 "관광지별 연관 관광지" 서비스를 검색해, 연관도 높은
// 맛집/카페/숙박(관광지 대분류 제외 — 명소보다 먹거리/숙소가 더 유용한 추천이라 판단)을
// 순위대로 반환한다. 이번 달 데이터가 아직 갱신 전이면(매월 8일 갱신) 지난달로 한 번 더
// 시도한다. 서비스키 미설정, 매칭 결과 없음, 외부 API 실패 등 어떤 이유로든 추천을 만들
// 수 없으면 빈 배열을 반환한다 — 미션 완료 자체를 막을 이유는 아니다.
export async function getRelatedTouristSpots(placeName: string): Promise<RelatedTouristSpot[]> {
  const serviceKey = getServiceKey();
  if (!serviceKey) return [];

  for (const monthsAgo of [0, 1]) {
    try {
      const items = await searchKeyword(serviceKey, placeName, baseYmFor(monthsAgo));
      if (items.length === 0) continue;

      const seen = new Set<string>();
      const spots = items
        .filter((item) => item.rlteCtgryLclsNm !== '관광지' && item.rlteTatsNm !== placeName)
        .sort((a, b) => Number(a.rlteRank ?? 0) - Number(b.rlteRank ?? 0))
        .filter((item) => {
          if (!item.rlteTatsNm || seen.has(item.rlteTatsNm)) return false;
          seen.add(item.rlteTatsNm);
          return true;
        })
        .slice(0, MAX_RELATED_SPOTS)
        .map((item) => ({
          name: item.rlteTatsNm!,
          category: item.rlteCtgrySclsNm ?? '',
        }));

      if (spots.length > 0) return spots;
    } catch (err) {
      console.error('TarRlteTarService1 호출 실패:', err);
    }
  }

  return [];
}
