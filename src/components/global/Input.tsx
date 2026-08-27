import { TextInput, type TextInputProps } from 'react-native';

import { twMerge } from '@/lib/tw-merge';

export function Input({ className, placeholder, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      className={twMerge(
        'h-44 w-full rounded-[5px] bg-gray-100 px-12 font-sans text-gray-300',
        className,
      )}
      {...props}
    />
  );
}
