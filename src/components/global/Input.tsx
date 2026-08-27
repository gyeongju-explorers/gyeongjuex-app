import { TextInput, type TextInputProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Fonts } from '@/constants/theme';

export function Input({ className, placeholder, style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      className={twMerge(
        'h-44 w-full rounded-full bg-gray-100 py-16 pl-[22px] pr-12 text-[12px] text-gray-300',
        className,
      )}
      style={[{ fontFamily: Fonts.medium }, style]}
      {...props}
    />
  );
}
