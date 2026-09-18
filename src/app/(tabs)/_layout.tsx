import { Slot } from 'expo-router';
import { View } from 'react-native';

import Nav from '@/components/global/Nav';
import { NavVisibilityProvider, useNavVisibility } from '@/hooks/use-nav-visibility';

function TabsContent() {
  const { visible } = useNavVisibility();

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {visible && <Nav />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <NavVisibilityProvider>
      <TabsContent />
    </NavVisibilityProvider>
  );
}
