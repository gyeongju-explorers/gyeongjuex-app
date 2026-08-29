import { Image } from 'expo-image';
import { Pressable } from 'react-native';

import missionListIcon from '@/assets/icons/mission-list.svg';

type MissionListButtonProps = {
  onPress?: () => void;
};

const MissionListButton = ({ onPress }: MissionListButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <Image source={missionListIcon} style={{ width: 48, height: 48 }} />
    </Pressable>
  );
};

export default MissionListButton;
