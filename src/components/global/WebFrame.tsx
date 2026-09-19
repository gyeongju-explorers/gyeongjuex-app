import { Image } from 'expo-image';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import webBackground from '@/assets/images/web-background.png';
import { WebFrameBreakpoint, WebFrameWidth } from '@/constants/theme';

// 웹에서 창 너비가 WebFrameBreakpoint를 넘으면 모바일 폭으로 고정된 화면을 가운데 두고
// 양옆을 web-background.png로 채운다. 네이티브 앱과, 그 이하 너비의 웹에서는 그대로 통과시킨다.
export default function WebFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width <= WebFrameBreakpoint) {
    return <>{children}</>;
  }

  return (
    <View style={styles.background}>
      <Image source={webBackground} contentFit="cover" style={StyleSheet.absoluteFill} />
      <View style={styles.frame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: WebFrameWidth,
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.2)',
  },
});
