import { Image } from 'expo-image';

import markerActiveIcon from '@/assets/icons/marker-active.svg';
import markerInactiveIcon from '@/assets/icons/marker-inactive.svg';

type MarkerProps = {
  active?: boolean;
};

const Marker = ({ active = false }: MarkerProps) => {
  return (
    <Image
      source={active ? markerActiveIcon : markerInactiveIcon}
      style={active ? { width: 29, height: 29 } : { width: 22, height: 22 }}
    />
  );
};

export default Marker;
