import { Image, type ImageSource } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';

import locationIcon from '@/assets/icons/location.svg';
import { ThemedText } from '@/components/global/themed-text';
import MissionButton from './MissionButton';

type PhotoSource = ImageSource | number;

export type MissionCardProps = {
  photos: PhotoSource[];
  title: string;
  description: string;
};

const MissionCard = ({ photos, title, description }: MissionCardProps) => {
  return (
    <Pressable className="pl-24 py-16">
      <View className="flex-1 gap-10">
        <ThemedText weight="bold" className="text-xl">
          {title}
        </ThemedText>

        <View className="flex-row items-center gap-6 mb-6">
          <Image source={locationIcon} className="w-12 h-14" />
          <ThemedText className="text-gray-900 text-xs">{description}</ThemedText>
        </View>

        {/* images */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          className="overflow-hidden"
        >
          <View className="flex-row gap-8">
            {photos.map((photo, index) => (
              <Image
                key={index}
                source={photo}
                style={{ width: 85, height: 118, borderRadius: 20 }}
              />
            ))}
          </View>
        </ScrollView>

        <View className="pr-24 mt-12">
          <MissionButton text="PICK !" className="w-full" />
        </View>
      </View>
    </Pressable>
  );
};

export default MissionCard;
