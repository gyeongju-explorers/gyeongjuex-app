import { Image, type ImageSource } from 'expo-image';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import closeMarkerIcon from '@/assets/icons/close-marker.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH * 0.75;
const PHOTO_HEIGHT = PHOTO_WIDTH * 1.3;
const PHOTO_GAP = 16;
const SIDE_PADDING = (SCREEN_WIDTH - PHOTO_WIDTH) / 2;
const CLOSE_BUTTON_SIZE = 44;

type PhotoSource = ImageSource | number;

type PhotoViewerOverlayProps = {
  photos: PhotoSource[];
  onClose: () => void;
};

const PhotoViewerOverlay = ({ photos, onClose }: PhotoViewerOverlayProps) => {
  return (
    <View style={styles.dim}>
      {/* 배경 전체를 덮는 닫기 레이어 — 스크롤 영역이 위에 그려져 이 레이어를 가려주므로
          별도 stopPropagation 없이도 사진 위에서는 눌리지 않는다. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      {/* 스크롤 영역을 화면 전체 너비로 잡아야 옆 사진이 화면 안에서 잘리지 않고 보인다 —
          사진 1장 너비로 좁게 잡으면 그 박스 자체가 뷰포트라 옆 사진이 원천적으로 안 보임. */}
      <ScrollView
        horizontal
        style={{ width: SCREEN_WIDTH, flexGrow: 0, zIndex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          alignItems: 'center',
          gap: PHOTO_GAP,
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={PHOTO_WIDTH + PHOTO_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={photo}
            style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
            className="border-[12px] border-white rounded-[64px]"
          />
        ))}
      </ScrollView>
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          zIndex: 2,
          top: (SCREEN_HEIGHT - PHOTO_HEIGHT) / 2 - CLOSE_BUTTON_SIZE / 2 - 24,
          left: SCREEN_WIDTH / 2 + PHOTO_WIDTH / 2 - CLOSE_BUTTON_SIZE / 2 - 12,
        }}
      >
        <Image
          source={closeMarkerIcon}
          style={{ width: CLOSE_BUTTON_SIZE, height: CLOSE_BUTTON_SIZE }}
        />
      </Pressable>
    </View>
  );
};

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

export default PhotoViewerOverlay;
