import { FlatList, Modal, Pressable, View } from 'react-native';

import type { Place } from '@/api/places';
import { ThemedText } from '@/components/global/themed-text';

type PlacePickerModalProps = {
  visible: boolean;
  places: Place[];
  selectedPlaceId: number | null;
  onSelect: (place: Place) => void;
  onClose: () => void;
};

const PlacePickerModal = ({
  visible,
  places,
  selectedPlaceId,
  onSelect,
  onClose,
}: PlacePickerModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center" onPress={onClose}>
        {/* Own Pressable so a tap inside the sheet doesn't bubble to the backdrop and close it. */}
        <Pressable className="w-[85%] max-h-[70%] rounded-3xl bg-white p-16" onPress={() => {}}>
          <ThemedText className="px-8 pb-8 text-base font-bold">사진첩 선택</ThemedText>
          <FlatList
            data={places}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ gap: 4 }}
            renderItem={({ item }) => (
              <Pressable
                className={`rounded-xl px-8 py-14 ${item.id === selectedPlaceId ? 'bg-gray-100' : ''}`}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <ThemedText className={`text-sm ${item.id === selectedPlaceId ? 'font-bold' : ''}`}>
                  {item.name}
                </ThemedText>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PlacePickerModal;
