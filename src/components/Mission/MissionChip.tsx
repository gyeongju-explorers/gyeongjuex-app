import { Pressable } from 'react-native';
import { ThemedText } from '../global/themed-text';

type MissionChipProps = {
  text: string;
};

const MissionChip = ({ text }: MissionChipProps) => {
  return (
    <Pressable className="self-start bg-black/50 rounded-full px-16 py-10">
      <ThemedText className="text-white">{text}</ThemedText>
    </Pressable>
  );
};

export default MissionChip;
