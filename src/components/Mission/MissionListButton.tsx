import { Image } from 'expo-image';

import missionListIcon from '@/assets/icons/mission-list.svg';

const MissionListButton = () => {
  return <Image source={missionListIcon} style={{ width: 44, height: 44 }} />;
};

export default MissionListButton;
