import { Pressable } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';

type SmallButtonProps = {
  text: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function SmallButton({ text, onPress, disabled = false }: SmallButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-44 items-center justify-center rounded-full px-16 ${disabled ? 'bg-gray-300' : 'bg-primary'}`}
    >
      <ThemedText className={`text-[12px] ${disabled ? 'text-white' : 'text-secondary'}`}>
        {text}
      </ThemedText>
    </Pressable>
  );
}
