import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    View,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
    Extrapolation,
    clamp,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated';
import HomeButton from './HomeButton';
import MissionButton from './MissionButton';
import MissionListButton from './MissionListButton';

// Fallback used only before the slide's own container has been measured — on native,
// and on web outside the WebFrame breakpoint, this already equals the container width.
const { width: INITIAL_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = 176;
const CARD_HEIGHT = 232;
// Distance (px) scrolled per index step — drives snapping and the arc math below.
const ITEM_SPACING = 188;
const ARC_RADIUS = 480;
const ANGLE_STEP_DEG = 26;
const MAX_STEPS = 2;
const INACTIVE_SCALE = 0.7;
// The photo list is tripled so there's a full copy of buffer on each side of the copy the
// user actually sees — once a swipe settles, we invisibly recenter back into the middle
// copy (jumping by exactly one copy's width lands on pixel-identical content).
const LOOP_COPIES = 3;
const RECENTER_DELAY_MS = 400;

type PhotoSource = ImageSource | number;

type MissionSlideProps = {
  photos: PhotoSource[];
  onOpenListModal: () => void;
};

type ArcCardProps = {
  source: PhotoSource;
  index: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
};

// Positions each card as if it were sitting on the circumference of a circle of
// radius ARC_RADIUS: the further a card is from the centered index, the more it
// swings out (translateX = R·sinθ), dips down (translateY = R·(1-cosθ)), and
// tilts (rotate = θ) — θ growing continuously with scroll, not just per snap.
const ArcCard = ({ source, index, scrollX, screenWidth }: ArcCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = clamp(index - scrollX.value / ITEM_SPACING, -MAX_STEPS, MAX_STEPS);
    const angleDeg = progress * ANGLE_STEP_DEG;
    const angleRad = (angleDeg * Math.PI) / 180;
    const scale = interpolate(
      Math.abs(progress),
      [0, MAX_STEPS],
      [1, INACTIVE_SCALE],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: ARC_RADIUS * Math.sin(angleRad) },
        { translateY: ARC_RADIUS * (1 - Math.cos(angleRad)) },
        { rotate: `${angleDeg}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ position: 'absolute', left: screenWidth / 2 - CARD_WIDTH / 2 }, animatedStyle]}
    >
      <Image
        source={source}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 40,
          borderWidth: 8,
          borderColor: '#ffffff',
        }}
      />
    </Animated.View>
  );
};

const MissionSlide = ({ photos, onOpenListModal }: MissionSlideProps) => {
  // On web behind WebFrame's centered phone frame, the browser window is wider than this
  // component's own box — arc math must use the box's own width, not the window's.
  const [screenWidth, setScreenWidth] = useState(INITIAL_WIDTH);
  const handleLayout = (event: LayoutChangeEvent) => setScreenWidth(event.nativeEvent.layout.width);

  // Looping only makes sense with more than one card; with one (or zero) there's nothing
  // to cycle through, so we just render it plainly.
  const loopEnabled = photos.length > 1;
  const baseCount = photos.length;
  const middleStart = loopEnabled ? baseCount : 0;
  const extendedPhotos = useMemo(
    () => (loopEnabled ? Array.from({ length: LOOP_COPIES }, () => photos).flat() : photos),
    [photos, loopEnabled],
  );

  const scrollX = useSharedValue(middleStart * ITEM_SPACING);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const recenterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRecenterTimeout = () => {
    if (recenterTimeoutRef.current) {
      clearTimeout(recenterTimeoutRef.current);
      recenterTimeoutRef.current = null;
    }
  };

  // Re-center to the same-looking spot one copy over once a snap has visually settled —
  // invisible to the user since every copy holds the exact same photos in the same order.
  const scheduleRecenter = () => {
    if (!loopEnabled) return;
    clearRecenterTimeout();
    recenterTimeoutRef.current = setTimeout(() => {
      const currentIndex = Math.round(scrollX.value / ITEM_SPACING);
      let shiftedIndex: number | null = null;
      if (currentIndex < baseCount) {
        shiftedIndex = currentIndex + baseCount;
      } else if (currentIndex >= baseCount * 2) {
        shiftedIndex = currentIndex - baseCount;
      }
      if (shiftedIndex === null) return;
      scrollX.value = shiftedIndex * ITEM_SPACING;
      scrollRef.current?.scrollTo({ x: shiftedIndex * ITEM_SPACING, animated: false });
    }, RECENTER_DELAY_MS);
  };

  const snapToIndex = (index: number, animated = true) => {
    const clampedIndex = Math.max(0, Math.min(extendedPhotos.length - 1, index));
    scrollRef.current?.scrollTo({ x: clampedIndex * ITEM_SPACING, animated });
    scheduleRecenter();
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // Belt-and-suspenders: snapToInterval alone can settle short of the nearest
  // card (Android in particular), so force-snap to the closest index whenever
  // a drag or its momentum comes to rest.
  const snapToNearest = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToIndex(Math.round(event.nativeEvent.contentOffset.x / ITEM_SPACING));
  };

  const contentWidth = (extendedPhotos.length - 1) * ITEM_SPACING + screenWidth;
  const maxScrollX = Math.max(0, contentWidth - screenWidth);

  // react-native-web's ScrollView only reacts to touch/wheel/scrollbar input, not a mouse
  // click-and-drag — so on web we drive scrollLeft ourselves while the mouse button is down.
  // We track the offset in a ref rather than reading scrollX.value back, since scrollX only
  // updates once the browser's async 'scroll' event catches up to our manual scrollTo calls —
  // which may not have happened yet by the time the mouse is released.
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const currentDragOffsetRef = useRef(0);

  const handleDragStart = (event: { clientX: number }) => {
    clearRecenterTimeout();
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = scrollX.value;
    currentDragOffsetRef.current = scrollX.value;
  };

  const handleDragMove = (event: { clientX: number }) => {
    if (!isDraggingRef.current) return;
    const delta = dragStartXRef.current - event.clientX;
    const nextOffset = clamp(dragStartScrollRef.current + delta, 0, maxScrollX);
    currentDragOffsetRef.current = nextOffset;
    scrollRef.current?.scrollTo({ x: nextOffset, animated: false });
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    snapToIndex(Math.round(currentDragOffsetRef.current / ITEM_SPACING));
  };

  const webDragHandlers =
    Platform.OS === 'web'
      ? {
          onMouseDown: handleDragStart,
          onMouseMove: handleDragMove,
          onMouseUp: handleDragEnd,
          onMouseLeave: handleDragEnd,
        }
      : {};

  return (
    <View
      className="absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ height: CARD_HEIGHT + 120 }}
      onLayout={handleLayout}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', '#ffffff']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Invisible scroll surface: only drives scrollX (paging/snapping), renders nothing itself. */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SPACING}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onScrollEndDrag={snapToNearest}
        onMomentumScrollEnd={snapToNearest}
        contentContainerStyle={{ width: contentWidth }}
        style={StyleSheet.absoluteFill}
        {...webDragHandlers}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {extendedPhotos.map((source, index) => (
          <ArcCard
            key={index}
            source={source}
            index={index}
            scrollX={scrollX}
            screenWidth={screenWidth}
          />
        ))}
      </View>
      <View className="absolute inset-x-0 bottom-40 items-center">
        <View className="items-center">
          <MissionButton text="PICK !" />
          <View className="absolute right-full mr-20">
            <HomeButton />
          </View>
          <View className="absolute left-full ml-20">
            <MissionListButton onPress={onOpenListModal} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MissionSlide;
