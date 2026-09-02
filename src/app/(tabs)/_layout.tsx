import { Slot } from 'expo-router';
import { View } from 'react-native';

import Nav from '@/components/global/Nav';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <Nav />
    </View>
  );
}
