import { Pressable } from 'react-native';
import { ThemedText } from '../global/themed-text';

type MissionChipProps = {
  text: string;
  selected?: boolean;
  onPress?: () => void;
};

const MissionChip = ({ text, selected = false, onPress }: MissionChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`self-start rounded-full px-16 py-10 ${selected ? 'bg-secondary' : 'bg-black/50'}`}
    >
      <ThemedText className="text-white text-xs">{text}</ThemedText>
    </Pressable>
  );
};

export default MissionChip;
