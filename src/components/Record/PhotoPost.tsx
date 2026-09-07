import { Image } from 'expo-image';
import { View } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';

type PhotoPostProps = {
  location?: string;
  date?: string;
  photos: string[];
};

const VISIBLE_COUNT = 4;

export default function PhotoPost({ location, date, photos }: PhotoPostProps) {
  const visiblePhotos = photos.slice(0, VISIBLE_COUNT);
  const extraCount = photos.length - VISIBLE_COUNT;

  return (
    <View className="gap-16">
      {(location || date) && (
        <View className="flex-row items-center justify-between">
          {location ? (
            <ThemedText weight="bold" className="text-base text-black">
              {location}
            </ThemedText>
          ) : (
            <View />
          )}
          {date && <ThemedText className="text-[12px] text-gray-500">{date}</ThemedText>}
        </View>
      )}

      <View className="flex-row">
        {visiblePhotos.map((uri, index) => {
          const isLast = index === VISIBLE_COUNT - 1 && extraCount > 0;
          const rotate = index % 2 === 0 ? 'rotate-[4deg]' : 'rotate-[-4deg]';
          const overlap = index === 0 ? '' : '-ml-8';

          return (
            <View key={index} className={`relative h-[118px] w-[85px] ${overlap}`}>
              <Image
                source={{ uri }}
                contentFit="cover"
                blurRadius={isLast ? 4 : 0}
                className={`h-[118px] w-[85px] rounded-[16px] ${rotate}`}
              />
              {isLast && (
                <View className="absolute inset-0 items-center justify-center">
                  <ThemedText weight="bold" className="text-base text-white">
                    +{extraCount}
                  </ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
