import { Image } from 'expo-image';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import closeMarkerIcon from '@/assets/icons/close-marker.svg';

// Fallback used only before this overlay's own container has been measured — on native,
// and on web outside the WebFrame breakpoint, this already equals the container width.
const { width: INITIAL_WIDTH } = Dimensions.get('window');

const PHOTO_GAP = 16;
const CLOSE_BUTTON_SIZE = 44;

const THUMB_WIDTH = 85;
const THUMB_HEIGHT = 118;
const THUMB_GAP = 8;
const THUMB_PITCH = THUMB_WIDTH + THUMB_GAP;
const THUMB_STRIP_PADDING = 24;

type PhotoDetailOverlayProps = {
  photos: string[];
  onClose: () => void;
  header?: ReactNode;
  initialIndex?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function PhotoDetailOverlay({
  photos,
  onClose,
  header,
  initialIndex = 0,
}: PhotoDetailOverlayProps) {
  // On web behind WebFrame's centered phone frame, the browser window is wider than this
  // overlay's own box — photo sizing must use the box's own width, not the window's.
  const [screenWidth, setScreenWidth] = useState(INITIAL_WIDTH);
  const handleLayout = (event: LayoutChangeEvent) => setScreenWidth(event.nativeEvent.layout.width);

  const photoWidth = screenWidth * 0.75;
  const photoHeight = photoWidth * 1.3;
  const mainPitch = photoWidth + PHOTO_GAP;
  const sidePadding = (screenWidth - photoWidth) / 2;

  const startIndex = clamp(initialIndex, 0, Math.max(0, photos.length - 1));
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const mainScrollRef = useRef<ScrollView>(null);
  const thumbScrollRef = useRef<ScrollView>(null);

  const thumbContentWidth =
    THUMB_STRIP_PADDING * 2 + photos.length * THUMB_WIDTH + (photos.length - 1) * THUMB_GAP;
  const maxThumbScroll = Math.max(0, thumbContentWidth - screenWidth);

  const centeredThumbX = (index: number) =>
    clamp(
      THUMB_STRIP_PADDING + index * THUMB_PITCH + THUMB_WIDTH / 2 - screenWidth / 2,
      0,
      maxThumbScroll,
    );

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ x: startIndex * mainPitch, animated: false });
    thumbScrollRef.current?.scrollTo({ x: centeredThumbX(startIndex), animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToIndex = (index: number, source: 'main' | 'thumb' | 'tap') => {
    const clamped = clamp(index, 0, photos.length - 1);
    setActiveIndex(clamped);

    if (source !== 'main') {
      mainScrollRef.current?.scrollTo({ x: clamped * mainPitch, animated: true });
    }
    if (source !== 'thumb') {
      thumbScrollRef.current?.scrollTo({ x: centeredThumbX(clamped), animated: true });
    }
  };

  const handleMainScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / mainPitch);
    goToIndex(index, 'main');
  };

  const handleThumbScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      (event.nativeEvent.contentOffset.x + screenWidth / 2 - THUMB_STRIP_PADDING - THUMB_WIDTH / 2) /
        THUMB_PITCH,
    );
    goToIndex(index, 'thumb');
  };

  return (
    <View style={styles.dim} onLayout={handleLayout}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={{ zIndex: 1, alignItems: 'center' }}>
        {header}

        <View style={{ width: screenWidth }}>
          <ScrollView
            ref={mainScrollRef}
            horizontal
            style={{ width: screenWidth, flexGrow: 0 }}
            contentContainerStyle={{
              paddingHorizontal: sidePadding,
              alignItems: 'center',
              gap: PHOTO_GAP,
            }}
            showsHorizontalScrollIndicator={false}
            snapToInterval={mainPitch}
            snapToAlignment="start"
            decelerationRate="fast"
            onMomentumScrollEnd={handleMainScrollEnd}
          >
            {photos.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: photoWidth, height: photoHeight }}
                className="border-[12px] border-white rounded-[64px]"
              />
            ))}
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={{
              position: 'absolute',
              zIndex: 2,
              top: -CLOSE_BUTTON_SIZE / 2 - 24,
              left: screenWidth / 2 + photoWidth / 2 - CLOSE_BUTTON_SIZE / 2 - 12,
            }}
          >
            <Image
              source={closeMarkerIcon}
              style={{ width: CLOSE_BUTTON_SIZE, height: CLOSE_BUTTON_SIZE }}
            />
          </Pressable>
        </View>

        {photos.length > 1 && (
          <ScrollView
            ref={thumbScrollRef}
            horizontal
            style={{ width: screenWidth, flexGrow: 0, marginTop: 32 }}
            contentContainerStyle={{
              paddingHorizontal: THUMB_STRIP_PADDING,
              alignItems: 'center',
              gap: THUMB_GAP,
            }}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleThumbScrollEnd}
          >
            {photos.map((uri, index) => (
              <Pressable key={index} onPress={() => goToIndex(index, 'tap')}>
                <Image
                  source={{ uri }}
                  style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
                  className={`rounded-[16px] ${
                    index === activeIndex ? 'border-2 border-primary' : ''
                  }`}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
  },
});
