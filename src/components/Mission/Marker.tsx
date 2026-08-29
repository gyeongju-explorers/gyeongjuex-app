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
      style={active ? { width: 30, height: 30 } : { width: 25, height: 25 }}
    />
  );
};

export default Marker;
