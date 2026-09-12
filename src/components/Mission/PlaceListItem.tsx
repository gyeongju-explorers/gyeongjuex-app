import { Image } from 'expo-image';
import { View } from 'react-native';

import type { Place } from '@/api/places';
import locationIcon from '@/assets/icons/location.svg';
import image1 from '@/assets/images/image1.png';
import { ThemedText } from '@/components/global/themed-text';
import MissionButton from '@/components/Mission/MissionButton';

type PlaceListItemProps = {
  place: Place;
};

const PlaceListItem = ({ place }: PlaceListItemProps) => {
  return (
    <View className="flex-row gap-16">
      {/* image */}
      <Image
        source={place.image ? { uri: place.image } : image1}
        className="w-102 h-140 rounded-3xl"
      />
      <View className="flex-1 justify-between py-8">
        <View className="flex-1 gap-8">
          {/* title */}
          <ThemedText className="text-xl font-bold">{place.name}</ThemedText>
          {/* location */}
          <View className="flex-row items-center gap-4">
            <Image source={locationIcon} className="w-12 h-14" />
            <ThemedText className="text-gray-900 text-xs flex-1" numberOfLines={2}>
              {place.address}
            </ThemedText>
          </View>
        </View>
        <MissionButton
          text="PICK !"
          className="w-full"
          href={{
            pathname: '/mission/camera',
            params: {
              placeId: String(place.id),
              image: place.image ?? '',
              name: place.name,
              latitude: place.latitude !== null ? String(place.latitude) : '',
              longitude: place.longitude !== null ? String(place.longitude) : '',
            },
          }}
        />
      </View>
    </View>
  );
};

export default PlaceListItem;
