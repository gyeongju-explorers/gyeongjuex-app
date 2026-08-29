import { Image } from 'expo-image';
import { FlatList, Modal, Pressable, View } from 'react-native';

import closeIcon from '@/assets/icons/close.svg';
import MissionCard, { type MissionCardProps } from '@/components/Mission/MissionCard';

type MissionListModalProps = {
  visible: boolean;
  onClose: () => void;
  missions: MissionCardProps[];
};

const MissionListModal = ({ visible, onClose, missions }: MissionListModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center relative" onPress={onClose}>
        {/* Own Pressable so a tap inside the card doesn't bubble to the backdrop and close it. */}
        <View className="h-[85%] w-full rounded-3xl bg-white absolute bottom-0">
          {/* close button */}
          <Pressable className="self-end pr-24 pt-20 pb-16" onPress={onClose}>
            <Image source={closeIcon} className="w-24 h-24" />
          </Pressable>

          {/* list */}
          <FlatList
            className="flex-1"
            data={missions}
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={{ gap: 36 }}
            renderItem={({ item }) => <MissionCard {...item} />}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

export default MissionListModal;
