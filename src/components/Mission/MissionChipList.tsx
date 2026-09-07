import { View } from 'react-native';

import type { PlaceCategory } from '@/api/places';
import { CATEGORY_OPTIONS } from '@/constants/category';

import MissionChip from './MissionChip';

type MissionChipListProps = {
  selectedCategory: PlaceCategory | null;
  onSelectCategory: (category: PlaceCategory | null) => void;
};

const MissionChipList = ({ selectedCategory, onSelectCategory }: MissionChipListProps) => {
  return (
    <View className="flex-row gap-4">
      {CATEGORY_OPTIONS.map(({ key, label }) => (
        <MissionChip
          key={key}
          text={label}
          selected={selectedCategory === key}
          onPress={() => onSelectCategory(selectedCategory === key ? null : key)}
        />
      ))}
    </View>
  );
};

export default MissionChipList;
