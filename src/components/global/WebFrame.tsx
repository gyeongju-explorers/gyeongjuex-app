import { Image } from 'expo-image';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import webBackground from '@/assets/images/web-background.png';
import { WebFrameWidth } from '@/constants/theme';

// 웹에서 창 너비가 WebFrameWidth보다 넓으면 콘텐츠를 그 폭으로 고정하고 남는 양옆을
// web-background.png로 채운다. 창을 좁힐수록 이 여백이 그대로 줄어들다가 WebFrameWidth
// 이하로 내려가면 여백 없이(=배경 없이) 창 너비 그대로 꽉 채운다 — 콘텐츠 폭이 항상
// min(창 너비, WebFrameWidth)라서, 배경이 사라지는 지점에서 폭이 툭 끊기지 않고
// 계속 이어져서 줄어든다. 네이티브 앱은 그대로 통과시킨다.
export default function WebFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const contentWidth = Math.min(width, WebFrameWidth);
  const hasMargin = width > WebFrameWidth;

  return (
    <View style={styles.background}>
      {hasMargin && (
        <Image source={webBackground} contentFit="cover" style={StyleSheet.absoluteFill} />
      )}
      <View style={[styles.frame, { width: contentWidth }]}>{children}</View>
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
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.2)',
  },
});
