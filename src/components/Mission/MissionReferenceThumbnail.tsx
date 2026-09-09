import { Image, type ImageSource } from 'expo-image';
import { Pressable } from 'react-native';

type PhotoSource = ImageSource | number;

type MissionReferenceThumbnailProps = {
  photo: PhotoSource;
  onPress: () => void;
};

// 미션 장소의 참고 사진 — 카메라 화면 우측 상단에 작게 떠 있는 썸네일.
// 탭하면 부모(카메라 화면)가 MissionReferencePreview를 화면 중앙에 크게 띄운다.
const MissionReferenceThumbnail = ({ photo, onPress }: MissionReferenceThumbnailProps) => {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Image
        source={photo}
        className="w-125 h-170 rounded-[30px] border-[6px] border-white shadow"
      />
    </Pressable>
  );
};

export default MissionReferenceThumbnail;
