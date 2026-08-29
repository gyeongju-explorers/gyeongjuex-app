import { Image } from 'expo-image';
import { View } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';

type FeaturedPhotoProps = {
  photos: string[];
};

export default function FeaturedPhoto({ photos }: FeaturedPhotoProps) {
  if (photos.length === 0) {
    return (
      <View className="h-[404px] items-center justify-center">
        <View className="h-[342px] w-[244px] items-center justify-center rounded-[24px] bg-gray-100">
          <ThemedText className="text-sm text-gray-500">등록된 사진이 없어요</ThemedText>
        </View>
      </View>
    );
  }

  const layers = [
    { photoIndex: 2, rotate: 'rotate-[-17deg]', bg: 'bg-gray-500' },
    { photoIndex: 1, rotate: 'rotate-[-10deg]', bg: 'bg-gray-300' },
    { photoIndex: 0, rotate: 'rotate-[-1deg]', bg: 'bg-gray-100' },
  ];

  return (
    <View className="h-[404px] items-center justify-center">
      {layers.map((layer) => {
        const uri = photos[layer.photoIndex];

        if (uri) {
          return (
            <Image
              key={layer.photoIndex}
              source={{ uri }}
              contentFit="cover"
              className={`absolute h-[342px] w-[244px] rounded-[24px] ${layer.rotate}`}
            />
          );
        }

        return (
          <View
            key={layer.photoIndex}
            className={`absolute h-[342px] w-[244px] rounded-[24px] ${layer.bg} ${layer.rotate}`}
          />
        );
      })}
    </View>
  );
}
