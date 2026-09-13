import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import homeButtonIcon from '@/assets/icons/home-button.svg';

const HomeButton = () => {
  return (
    <Pressable onPress={() => router.replace('/')}>
      <Image source={homeButtonIcon} style={{ width: 53, height: 53 }} />
    </Pressable>
  );
};

export default HomeButton;
