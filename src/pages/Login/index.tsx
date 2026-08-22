import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/global/themed-view';
import HomeButton from '@/components/Home/HomeButton';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Input } from '@/components/global/Input';

export default function Login() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} />
      <HomeButton />
      <Text>로그인</Text>
      <Input placeholder="login"/>
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
