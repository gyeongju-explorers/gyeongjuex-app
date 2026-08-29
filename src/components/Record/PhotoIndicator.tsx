import { Image } from 'expo-image';
import { View } from 'react-native';

import dotIcon from '@/assets/icons/indicator-dot.svg';

type PhotoIndicatorProps = {
  total: number;
  activeIndex: number;
};

export default function PhotoIndicator({ total, activeIndex }: PhotoIndicatorProps) {
  return (
    <View className="h-[20px] w-[62px] flex-row items-center gap-5 self-center rounded-full bg-gray-100 pl-9">
      {Array.from({ length: total }).map((_, index) => (
        <Image
          key={index}
          source={dotIcon}
          tintColor={index === activeIndex ? '#29D9CE' : '#D1D1D1'}
          style={{ width: 12, height: 12 }}
        />
      ))}
    </View>
  );
}
