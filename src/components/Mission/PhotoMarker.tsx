import { Image, type ImageSource } from 'expo-image';
import { View } from 'react-native';

import Marker from '@/components/Mission/Marker';

const PHOTO_WIDTH = 75;
const PHOTO_HEIGHT = 104;
const BACK_PHOTO_OFFSET = { top: 0, left: 16 };

const photoStyle = {
  width: PHOTO_WIDTH,
  height: PHOTO_HEIGHT,
  borderRadius: 20,
  borderWidth: 4,
  borderColor: '#ffffff',
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
};

type PhotoSource = ImageSource | number;

type PhotoMarkerProps = {
  photos: [PhotoSource] | [PhotoSource, PhotoSource];
  active?: boolean;
};

const PhotoMarker = ({ photos, active = true }: PhotoMarkerProps) => {
  const [frontPhoto, backPhoto] = photos;
  const stackWidth = backPhoto ? PHOTO_WIDTH + BACK_PHOTO_OFFSET.left : PHOTO_WIDTH;

  return (
    <View className="items-center">
      <View style={{ width: stackWidth, height: PHOTO_HEIGHT }}>
        {backPhoto && (
          <Image
            source={backPhoto}
            style={[
              photoStyle,
              {
                position: 'absolute',
                top: BACK_PHOTO_OFFSET.top,
                left: BACK_PHOTO_OFFSET.left,
                transform: [{ rotate: '8deg' }],
              },
            ]}
          />
        )}
        <Image
          source={frontPhoto}
          style={[photoStyle, backPhoto ? { transform: [{ rotate: '-8deg' }] } : null]}
        />
      </View>
      <View style={{ marginTop: -14 }}>
        <Marker active={active} />
      </View>
    </View>
  );
};

export default PhotoMarker;
