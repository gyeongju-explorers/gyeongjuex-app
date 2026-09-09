import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

type PhotoSource = ImageSource | number;

type MissionReferencePreviewProps = {
  photo: PhotoSource;
  onClose: () => void;
};

// MissionReferenceThumbnail을 다시 탭했을 때 화면 중앙에 크게 보여주는 오버레이.
// 화면 전체(배경 포함) 어디를 눌러도 닫혀 다시 작은 썸네일로 돌아간다.
const MissionReferencePreview = ({ photo, onClose }: MissionReferencePreviewProps) => {
  return (
    <Pressable
      style={styles.dim}
      onPress={onClose}
      className="items-center justify-center bg-black/50"
    >
      <Image source={photo} className="w-240 h-240 rounded-3xl border-4 border-white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default MissionReferencePreview;
