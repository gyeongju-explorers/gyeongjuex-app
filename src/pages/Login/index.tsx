import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/global/Button';
import CheckboxText from '@/components/global/CheckboxText';
import { Input } from '@/components/global/Input';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function Login() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View className="gap-16 pt-450">
          <View className="gap-8">
            <Input placeholder="아이디" />
            <Input placeholder="비밀번호" />
          </View>
          <CheckboxText text="자동 로그인" />
          <Button text="로그인" theme="dark" />
          <View className="my-10 flex-row items-center justify-center gap-16">
            <TouchableOpacity>
              <ThemedText className="text-gray-500">아이디 찾기</ThemedText>
            </TouchableOpacity>
            <View className="h-12 w-1 bg-gray-300" />
            <TouchableOpacity>
              <ThemedText className="text-gray-500">비밀번호 찾기</ThemedText>
            </TouchableOpacity>
            <View className="h-12 w-1 bg-gray-300" />
            <TouchableOpacity>
              <ThemedText className="text-gray-500">회원가입</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
