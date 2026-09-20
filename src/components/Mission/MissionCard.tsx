import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import type { Place } from '@/api/places';
import locationIcon from '@/assets/icons/location.svg';
import image1 from '@/assets/images/image1.png';
import { ThemedText } from '@/components/global/themed-text';
import MissionButton from './MissionButton';

export type MissionCardProps = {
  place: Place;
};

// Same title/address/image/PICK layout as PlaceInfoModal, minus its floating-card chrome —
// this renders as one row of the mission list instead. Root is a Pressable (no handler needed)
// purely so a tap inside the row doesn't bubble up and close the list's backdrop.
const MissionCard = ({ place }: MissionCardProps) => {
  return (
    <Pressable className="flex-row gap-12 px-24">
      <Image source={place.image ? { uri: place.image } : image1} className="w-84 rounded-xl" />
      <View className="flex-1 gap-8 justify-center pt-8">
        <ThemedText className="text-base font-bold">{place.name}</ThemedText>
        <View className="flex-row items-center gap-4 mb-12">
          <Image source={locationIcon} className="w-10 h-12" />
          <ThemedText className="text-gray-900 text-xs flex-1" numberOfLines={2}>
            {place.address}
          </ThemedText>
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
    </Pressable>
  );
};

export default MissionCard;
