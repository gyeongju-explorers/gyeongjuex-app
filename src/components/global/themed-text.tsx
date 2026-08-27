import { Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  weight?: keyof typeof Fonts;
};

export function ThemedText({ weight = 'medium', style, ...props }: ThemedTextProps) {
  return <Text style={[{ fontFamily: Fonts[weight] }, style]} {...props} />;
}
