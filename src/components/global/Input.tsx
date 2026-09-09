import { TextInput, type TextInputProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { twMerge } from '@/lib/tw-merge';

export function Input({ className, placeholder, style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      className={twMerge(
        'h-44 w-full rounded-full bg-gray-100 pl-[22px] pr-12 text-[12px] text-gray-300',
        className,
      )}
      style={[{ fontFamily: Fonts.medium, textAlignVertical: 'center' }, style]}
      {...props}
    />
  );
}
