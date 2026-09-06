import { Image, type ImageSource } from 'expo-image';

import markerActiveIcon from '@/assets/icons/marker-active.svg';
import markerInactiveIcon from '@/assets/icons/marker-inactive.svg';
import markerSelectedIcon from '@/assets/icons/marker-selected.svg';

export type MarkerVariant = 'inactive' | 'active' | 'selected';

const MARKER_ICONS: Record<MarkerVariant, { source: ImageSource | number; size: number }> = {
  inactive: { source: markerInactiveIcon, size: 25 },
  active: { source: markerActiveIcon, size: 30 },
  selected: { source: markerSelectedIcon, size: 30 },
};

type MarkerProps = {
  variant?: MarkerVariant;
};

const Marker = ({ variant = 'inactive' }: MarkerProps) => {
  const { source, size } = MARKER_ICONS[variant];
  return <Image source={source} style={{ width: size, height: size }} />;
};

export default Marker;
