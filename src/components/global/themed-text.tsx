import { Text, type TextProps } from 'react-native';

import { twMerge } from '@/lib/tw-merge';

// Keys mirror constants/theme.ts `Fonts`, mapped to the matching `fontFamily` utility
// (see tailwind.config.js) so an explicit font-bold/font-light in `className` can
// override this default via twMerge — a `style` prop can't be overridden that way.
const WEIGHT_CLASS_NAME = {
  light: 'font-light',
  medium: 'font-sans',
  bold: 'font-bold',
} as const;

export type ThemedTextProps = TextProps & {
  weight?: keyof typeof WEIGHT_CLASS_NAME;
};

export function ThemedText({ weight = 'medium', className, ...props }: ThemedTextProps) {
  return <Text className={twMerge(WEIGHT_CLASS_NAME[weight], 'leading-none', className)} {...props} />;
}
