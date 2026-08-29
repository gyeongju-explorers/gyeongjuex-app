import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
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
import MissionButton from './MissionButton';
import MissionListButton from './MissionListButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = 176;
const CARD_HEIGHT = 232;
// Distance (px) scrolled per index step — drives snapping and the arc math below.
const ITEM_SPACING = 188;
const ARC_RADIUS = 480;
const ANGLE_STEP_DEG = 26;
const MAX_STEPS = 2;
const INACTIVE_SCALE = 0.7;

type PhotoSource = ImageSource | number;

type MissionSlideProps = {
  photos: PhotoSource[];
  onOpenListModal: () => void;
};

type ArcCardProps = {
  source: PhotoSource;
  index: number;
  scrollX: SharedValue<number>;
};

// Positions each card as if it were sitting on the circumference of a circle of
// radius ARC_RADIUS: the further a card is from the centered index, the more it
// swings out (translateX = R·sinθ), dips down (translateY = R·(1-cosθ)), and
// tilts (rotate = θ) — θ growing continuously with scroll, not just per snap.
const ArcCard = ({ source, index, scrollX }: ArcCardProps) => {
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
      style={[{ position: 'absolute', left: SCREEN_WIDTH / 2 - CARD_WIDTH / 2 }, animatedStyle]}
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
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // Belt-and-suspenders: snapToInterval alone can settle short of the nearest
  // card (Android in particular), so force-snap to the closest index whenever
  // a drag or its momentum comes to rest.
  const snapToNearest = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nearestIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_SPACING);
    const clampedIndex = Math.max(0, Math.min(photos.length - 1, nearestIndex));
    scrollRef.current?.scrollTo({ x: clampedIndex * ITEM_SPACING, animated: true });
  };

  const contentWidth = (photos.length - 1) * ITEM_SPACING + SCREEN_WIDTH;

  return (
    <View className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: CARD_HEIGHT + 120 }}>
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
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {photos.map((source, index) => (
          <ArcCard key={index} source={source} index={index} scrollX={scrollX} />
        ))}
      </View>
      <View className="absolute inset-x-0 bottom-40 items-center">
        <View className="items-center">
          <MissionButton text="PICK !" />
          <View className="absolute left-full ml-20">
            <MissionListButton onPress={onOpenListModal} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MissionSlide;
