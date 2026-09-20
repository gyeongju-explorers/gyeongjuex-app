import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import type { Place } from '@/api/places';
import closeIcon from '@/assets/icons/close.svg';
import locationIcon from '@/assets/icons/location.svg';
import image1 from '@/assets/images/image1.png';
import { ThemedText } from '@/components/global/themed-text';
import MissionButton from '@/components/Mission/MissionButton';

type PlaceInfoModalProps = {
  place: Place;
  onClose: () => void;
};

const PlaceInfoModal = ({ place, onClose }: PlaceInfoModalProps) => {
  return (
    <View className="absolute inset-x-16 top-70 rounded-3xl bg-white p-21 gap-16 shadow">
      <Pressable className="absolute right-8 top-8 p-8 z-10" onPress={onClose} hitSlop={8}>
        <Image source={closeIcon} className="w-20 h-20" />
      </Pressable>
      <View className="flex-row gap-12">
        <Image source={place.image ? { uri: place.image } : image1} className="w-84 rounded-xl" />
        <View className="flex-1 gap-8 justify-center pt-8">
          {/* title */}
          <ThemedText className="text-base font-bold">{place.name}</ThemedText>
          {/* location */}
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
      </View>
    </View>
  );
};

export default PlaceInfoModal;
