import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import recordEmptyImage from '@/assets/images/record-empty.svg';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';

type WithdrawConfirmOverlayProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function WithdrawConfirmOverlay({ onCancel, onConfirm }: WithdrawConfirmOverlayProps) {
  return (
    <ThemedView style={styles.overlay}>
      <SafeAreaView className="flex-1 items-center px-24">
        <Image
          source={recordEmptyImage}
          contentFit="contain"
          style={{ width: 229, height: 179, marginTop: 125, marginBottom: 50 }}
        />
        <View className="items-center gap-20 mb-44">
          <ThemedText weight="bold" className="text-xl text-black">
            정말 탈퇴하시겠어요?
          </ThemedText>
          <ThemedText className="text-gray-500">탈퇴하면 이전 기록이 모두 사라져요</ThemedText>
        </View>
        <View className="w-full flex-row gap-12">
          <Pressable
            onPress={onCancel}
            className="flex-1 items-center justify-center rounded-full bg-primary py-16"
          >
            <ThemedText weight="bold" className="text-secondary">
              돌아가기
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            className="flex-1 items-center justify-center rounded-full bg-secondary py-16"
          >
            <ThemedText weight="bold" className="text-white">
              탈퇴하기
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
