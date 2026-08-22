import { TextInput, type TextInputProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Input({ className, placeholder, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      className={twMerge('h-44 w-full bg-gray-200 px-12 rounded-lg', className)}
      {...props}
    />
  );
}
