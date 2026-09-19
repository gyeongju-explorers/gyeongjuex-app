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

// 실제 모바일 화면처럼 보이도록 웹 WebFrame이 고정하려는 폭 (큰 폰 기준). 창 너비가
// 이보다 넓으면 콘텐츠를 이 폭으로 고정하고 남는 양옆을 배경 이미지로 채우며, 창을
// 좁힐수록 그 여백이 그대로 줄어든다. 창 너비가 이 값 이하로 내려가면 배경 없이 창
// 너비 그대로 꽉 채운다.
export const WebFrameWidth = 430;
