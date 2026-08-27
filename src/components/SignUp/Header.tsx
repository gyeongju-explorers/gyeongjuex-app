import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import backIcon from '@/assets/icons/back.svg';
import { ThemedText } from '@/components/global/themed-text';

export default function Header() {
  return (
    <View>
      <View className="flex-row items-center justify-center py-16">
        <TouchableOpacity
          className="absolute left-[26px]"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Image source={backIcon} style={{ width: 10, height: 18 }} />
        </TouchableOpacity>
        <ThemedText className="text-lg text-black">회원가입</ThemedText>
      </View>
      <View style={styles.line} />
      <View style={styles.rect} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: 'rgba(229, 229, 231, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 231, 0.8)',
    opacity: 0.8,
  },
  rect: {
    height: 4,
    opacity: 0.5,
    backgroundColor: 'rgba(243, 244, 246, 0.03)',
    boxShadow: '0 1px 5.9px 39px rgba(218, 218, 218, 0.35) inset',
  },
});
