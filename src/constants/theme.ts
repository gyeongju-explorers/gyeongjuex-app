/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

// Registered names from the `useFonts` call in `src/app/_layout.tsx` (assets/fonts/GmarketSans-*.otf).
export const Fonts = {
  light: 'GmarketSans-Light',
  medium: 'GmarketSans-Medium',
  bold: 'GmarketSans-Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// 웹에서 창 너비가 이 값을 넘으면 프레임 모드로 전환한다 (이 값 이하에서는 지금처럼
// 풀 너비 모바일 레이아웃 그대로).
export const WebFrameBreakpoint = 600;
// 프레임 모드에서 실제로 화면이 고정되는 폭 — 큰 폰(iPhone Pro Max 기준) 비율에 맞춘 값.
// 나머지 여백은 web-background.png로 채운다.
export const WebFrameWidth = 430;
