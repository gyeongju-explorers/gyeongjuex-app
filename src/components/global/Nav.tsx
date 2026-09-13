import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import badgeActiveIcon from '@/assets/icons/badge-active.svg';
import badgeInactiveIcon from '@/assets/icons/badge-inactive.svg';
import homeActiveIcon from '@/assets/icons/home-active.svg';
import homeInactiveIcon from '@/assets/icons/home-inactive.svg';
import myActiveIcon from '@/assets/icons/my-active.svg';
import myInactiveIcon from '@/assets/icons/my-inactive.svg';
import pickIcon from '@/assets/icons/pick.svg';
import recordActiveIcon from '@/assets/icons/record-active.svg';
import recordInactiveIcon from '@/assets/icons/record-inactive.svg';

type NavItemDef = {
  label: string;
  href?: string;
  size: number;
  activeIcon: number;
  inactiveIcon: number;
  onPress?: () => void;
};

const NAV_ITEMS: NavItemDef[] = [
  {
    label: 'HOME',
    href: '/',
    size: 18,
    activeIcon: homeActiveIcon,
    inactiveIcon: homeInactiveIcon,
    onPress: () => router.replace('/'),
  },
  {
    label: '배지',
    href: '/badge',
    size: 17,
    activeIcon: badgeActiveIcon,
    inactiveIcon: badgeInactiveIcon,
    onPress: () => router.replace('/badge'),
  },
  {
    label: '기록',
    href: '/record',
    size: 18,
    activeIcon: recordActiveIcon,
    inactiveIcon: recordInactiveIcon,
    onPress: () => router.replace('/record'),
  },
  {
    label: 'MY',
    href: '/my',
    size: 17,
    activeIcon: myActiveIcon,
    inactiveIcon: myInactiveIcon,
    onPress: () => router.replace('/my'),
  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <View className="absolute bottom-0 w-full items-center">
      <View
        className="h-[80px] w-full flex-row items-center justify-between bg-white px-24"
        style={{ boxShadow: '0 -1px 54.6px 0 rgba(101, 101, 101, 0.48)' }}
      >
        <NavItem {...NAV_ITEMS[0]} active={pathname === NAV_ITEMS[0].href} />
        <NavItem {...NAV_ITEMS[1]} active={pathname === NAV_ITEMS[1].href} />
        <View className="w-[70px]" />
        <NavItem {...NAV_ITEMS[2]} active={pathname === NAV_ITEMS[2].href} />
        <NavItem {...NAV_ITEMS[3]} active={pathname === NAV_ITEMS[3].href} />
      </View>

      <View className="absolute left-0 right-0 top-[-35px] items-center" pointerEvents="box-none">
        <Pressable
          style={{ filter: 'drop-shadow(0 6.814px 6.814px rgba(0, 0, 0, 0.25))' }}
          onPress={() => router.push('/camera')}
        >
          <Image source={pickIcon} style={{ width: 76, height: 76 }} />
        </Pressable>
      </View>
    </View>
  );
}

function NavItem({
  label,
  size,
  activeIcon,
  inactiveIcon,
  active,
  onPress,
}: NavItemDef & { active: boolean }) {
  return (
    <Pressable
      className="items-center justify-center gap-6 px-8 py-8"
      hitSlop={8}
      onPress={onPress}
    >
      <Image source={active ? activeIcon : inactiveIcon} style={{ width: size, height: size }} />
      <Text className="text-[9px] text-black">{label}</Text>
    </Pressable>
  );
}
