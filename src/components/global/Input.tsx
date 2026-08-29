import { TextInput, type TextInputProps } from 'react-native';

import { twMerge } from '@/lib/tw-merge';

export function Input({ className, placeholder, ...props }: TextInputProps) {
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
