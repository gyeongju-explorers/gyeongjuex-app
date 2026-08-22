import { Text as RNText, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

// Default weight for every Text in the app. Pass your own `className`
// per usage (e.g. `text-lg font-bold`) — twMerge drops the conflicting default.
// No custom `font-*` family is set: nothing is loaded via expo-font yet, and
// Tailwind's stock `font-sans` stack is a comma-separated CSS value that React
// Native can't render, so leaving fontFamily unset keeps the native system font.
export function Text({ className, ...props }: TextProps) {
  return <RNText className={twMerge('font-medium', className)} {...props} />;
}
