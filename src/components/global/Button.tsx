import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';

type ButtonProps = {
  text: string;
  theme?: 'dark' | 'default';
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress?: () => void;
};

const Button = ({
  text,
  theme = 'default',
  rounded = true,
  style,
  disabled = false,
  onPress,
}: ButtonProps) => {
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-56 w-full items-center justify-center ${rounded ? 'rounded-full' : 'rounded-none'} ${disabled ? 'bg-gray-300' : isDark ? 'bg-secondary' : 'bg-primary'}`}
      style={style}
    >
      <ThemedText
        className={`text-center text-base ${disabled ? 'text-white' : isDark ? 'text-white' : 'text-secondary'}`}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
};

export default Button;
