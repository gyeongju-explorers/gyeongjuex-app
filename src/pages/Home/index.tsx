import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function Home() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} />
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
