import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import pickIcon from '@/assets/icons/pick.svg';

const NAV_ITEMS: { label: string; onPress?: () => void }[] = [
  { label: 'HOME', onPress: () => router.replace('/') },
  { label: '배지' },
  { label: '기록', onPress: () => router.replace('/record') },
  { label: 'MY', onPress: () => router.replace('/my') },
];

export default function Nav() {
  return (
    <View className="absolute bottom-0 w-full items-center">
      <View
        className="h-[80px] w-full flex-row items-center justify-between bg-white px-24"
        style={{ boxShadow: '0 -1px 54.6px 0 rgba(101, 101, 101, 0.48)' }}
      >
        <NavItem {...NAV_ITEMS[0]} />
        <NavItem {...NAV_ITEMS[1]} />
        <View className="w-[70px]" />
        <NavItem {...NAV_ITEMS[2]} />
        <NavItem {...NAV_ITEMS[3]} />
      </View>

      <Pressable
        className="absolute left-0 right-0 top-[-35px] items-center"
        style={{ filter: 'drop-shadow(0 6.814px 6.814px rgba(0, 0, 0, 0.25))' }}
      >
        <Image source={pickIcon} style={{ width: 76, height: 76 }} />
      </Pressable>
    </View>
  );
}

function NavItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable className="items-center justify-center" onPress={onPress}>
      <Text className="text-[12px] text-gray-500">{label}</Text>
    </Pressable>
  );
}
