import { Image } from 'expo-image';

import missionListIcon from '@/assets/icons/mission-list.svg';

const MissionListButton = () => {
  return <Image source={missionListIcon} style={{ width: 48, height: 48 }} />;
};

export default MissionListButton;
