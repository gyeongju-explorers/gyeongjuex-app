import { Image } from 'expo-image';
import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import PhotoIndicator from '@/components/Record/PhotoIndicator';
import { ThemedText } from '@/components/global/themed-text';

type FeaturedPhotoProps = {
  photos: string[];
};

const DRAG_DISTANCE = 100;
const SWIPE_THRESHOLD = 60;
// 슬롯별 정지 각도: [앞, 중간, 뒤]
const SLOT_ANGLES = [-1, -10, -17];

const CARD_BASE_STYLE: ViewStyle = {
  position: 'absolute',
  width: 244,
  height: 342,
  borderRadius: 24,
  overflow: 'hidden',
};

function mod(n: number, m: number) {
  'worklet';
  return ((n % m) + m) % m;
}

function StackImage({
  uri,
  photoIndex,
  count,
  windowStartShared,
  dragX,
}: {
  uri: string;
  photoIndex: number;
  count: number;
  windowStartShared: SharedValue<number>;
  dragX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const relativeSlot = mod(photoIndex - windowStartShared.value, count);
    const advance = -dragX.value / DRAG_DISTANCE;
    const isFront = relativeSlot === 0;
    const isLast = relativeSlot === count - 1;

    if (isFront && advance >= 0) {
      // 앞자리에서 뒤로 빠짐: 3D 플립.
      const rotateY = interpolate(advance, [0, 1], [0, 100], Extrapolation.CLAMP);
      return {
        backfaceVisibility: 'hidden',
        transform: [
          { perspective: 800 },
          { rotateY: `${rotateY}deg` },
          { rotate: `${SLOT_ANGLES[0]}deg` },
        ],
      };
    }

    if (isLast && advance < 0) {
      // 맨 뒤에서 앞으로 들어옴(역방향 스와이프): 3D 플립.
      const rotateY = interpolate(advance, [-1, 0], [-100, 0], Extrapolation.CLAMP);
      return {
        zIndex: 10,
        backfaceVisibility: 'hidden',
        transform: [
          { perspective: 800 },
          { rotateY: `${rotateY}deg` },
          { rotate: `${SLOT_ANGLES[0]}deg` },
        ],
      };
    }

    const currentAngle = SLOT_ANGLES[relativeSlot];
    let rotate = currentAngle;

    if (advance > 0) {
      const targetAngle = SLOT_ANGLES[mod(relativeSlot - 1, count)];
      rotate = interpolate(
        Math.min(advance, 1),
        [0, 1],
        [currentAngle, targetAngle],
        Extrapolation.CLAMP,
      );
    } else if (advance < 0) {
      const targetAngle = SLOT_ANGLES[mod(relativeSlot + 1, count)];
      rotate = interpolate(
        Math.max(advance, -1),
        [-1, 0],
        [targetAngle, currentAngle],
        Extrapolation.CLAMP,
      );
    }

    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  return (
    <Animated.View style={[CARD_BASE_STYLE, style]}>
      <Image source={{ uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
    </Animated.View>
  );
}

export default function FeaturedPhoto({ photos }: FeaturedPhotoProps) {
  const [windowStart, setWindowStart] = useState(0);
  const windowStartShared = useSharedValue(0);
  const dragX = useSharedValue(0);

  const advance = (step: number) => {
    const next = ((windowStart + step) % photos.length + photos.length) % photos.length;
    setWindowStart(next);
    windowStartShared.value = next;
    dragX.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      dragX.value = event.translationX;
    })
    .onEnd(() => {
      if (Math.abs(dragX.value) > SWIPE_THRESHOLD) {
        const sign = dragX.value > 0 ? 1 : -1;
        const step = sign > 0 ? -1 : 1;
        dragX.value = withTiming(sign * DRAG_DISTANCE, { duration: 150 }, (finished) => {
          if (finished) {
            scheduleOnRN(advance, step);
          }
        });
      } else {
        dragX.value = withSpring(0);
      }
    });

  if (photos.length === 0) {
    return (
      <View className="h-[404px] items-center justify-center">
        <View className="h-[342px] w-[244px] items-center justify-center rounded-[24px] bg-gray-100">
          <ThemedText className="text-sm text-gray-500">등록된 사진이 없어요</ThemedText>
        </View>
      </View>
    );
  }

  // 정지 상태 기준으로 뒤→앞 순서로 그려서, 앞 카드가 항상 위에 겹치도록 함.
  const paintOrder = photos
    .map((uri, photoIndex) => ({ uri, photoIndex }))
    .sort((a, b) => mod(b.photoIndex - windowStart, photos.length) - mod(a.photoIndex - windowStart, photos.length));

  return (
    <View>
      <GestureDetector gesture={panGesture}>
        <View className="h-[404px] items-center justify-center">
          {paintOrder.map(({ uri, photoIndex }) => (
            <StackImage
              key={photoIndex}
              uri={uri}
              photoIndex={photoIndex}
              count={photos.length}
              windowStartShared={windowStartShared}
              dragX={dragX}
            />
          ))}
        </View>
      </GestureDetector>

      {photos.length > 1 && (
        <View className="pt-14">
          <PhotoIndicator total={photos.length} activeIndex={windowStart} />
        </View>
      )}
    </View>
  );
}
