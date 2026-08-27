import pickIcon from '@/assets/icons/pick.svg';
import { Image } from 'expo-image';

const PickButton = () => {
  return <Image source={pickIcon} style={{ width: 70, height: 70 }} />;
};

export default PickButton;
