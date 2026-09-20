import { Image } from 'expo-image';
import { FlatList, Pressable, View } from 'react-native';

import type { Place, PlaceCategory } from '@/api/places';
import closeIcon from '@/assets/icons/close.svg';
import MissionCard from '@/components/Mission/MissionCard';
import { ThemedText } from '@/components/global/themed-text';
import { CATEGORY_OPTIONS } from '@/constants/category';

type MissionListModalProps = {
  visible: boolean;
  onClose: () => void;
  missions: Place[];
  selectedCategory: PlaceCategory | null;
};

// react-native's Modal renders into its own top-level portal on web, which escapes
// WebFrame's centered phone-frame width — so, like the app's other overlays
// (PlaceInfoModal, PhotoViewerOverlay), this is a plain absolutely-positioned View that
// stays inside the same layout tree as the screen it's shown over.
const MissionListModal = ({ visible, onClose, missions, selectedCategory }: MissionListModalProps) => {
  if (!visible) return null;

  const categoryLabel =
    CATEGORY_OPTIONS.find((option) => option.key === selectedCategory)?.label ?? '📍 미션';

  return (
    // box-none: this overlay only covers the screen to host the list itself — everything
    // above the list (the map, the category chips) stays tappable so the category can still
    // be changed while the list is open.
    <View className="absolute inset-0" pointerEvents="box-none">
      <View className="h-[85%] w-full rounded-3xl bg-white absolute bottom-0">
        {/* header: current category on the left, close button on the right */}
        <View className="flex-row items-center pl-24 pr-24 pt-20 pb-16">
          <View className="flex-1">
            <ThemedText weight="bold" className="text-lg">
              {categoryLabel}
            </ThemedText>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <Image source={closeIcon} className="w-24 h-24" />
          </Pressable>
        </View>

        {/* list */}
        <FlatList
          className="flex-1"
          data={missions}
          keyExtractor={(place) => String(place.id)}
          contentContainerStyle={{ gap: 36 }}
          renderItem={({ item }) => <MissionCard place={item} />}
        />
      </View>
    </View>
  );
};

export default MissionListModal;
