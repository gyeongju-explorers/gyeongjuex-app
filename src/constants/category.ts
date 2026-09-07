import type { PlaceCategory } from '@/api/places';

export const CATEGORY_OPTIONS: { key: PlaceCategory; label: string }[] = [
  { key: 'HISTORY_CULTURE', label: '💫 역사 문화' },
  { key: 'WORLD_HERITAGE', label: '🌏 세계 문화 유산' },
  { key: 'NATURE_HEALING', label: '🌿 자연 힐링' },
];
