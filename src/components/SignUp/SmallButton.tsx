import { Pressable, Text } from 'react-native';

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
      className={`h-44 items-center justify-center rounded-[5px] px-16 ${disabled ? 'bg-gray-300' : 'bg-gray-500'}`}
    >
      <Text className="text-sm text-white">{text}</Text>
    </Pressable>
  );
}
