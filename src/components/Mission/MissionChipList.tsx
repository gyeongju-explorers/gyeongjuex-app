import { View } from 'react-native';
import MissionChip from './MissionChip';

const MissionChipList = () => {
  const categories = ['💫 역사 문화', '🌏 세계 문화 유산', '🌿 자연 힐링'];

  return (
    <View className="flex-row gap-4">
      {categories.map((item) => {
        return <MissionChip text={item} key={item} />;
      })}
    </View>
  );
};

export default MissionChipList;
