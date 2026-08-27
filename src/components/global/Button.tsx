import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';
import { twMerge } from '@/lib/tw-merge';

type ButtonProps = {
  text: string;
  theme?: 'dark' | 'default';
  rounded?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress?: () => void;
};

const Button = ({
  text,
  theme = 'default',
  rounded = true,
  className,
  style,
  disabled = false,
  onPress,
}: ButtonProps) => {
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(
        `h-56 w-full items-center justify-center ${rounded ? 'rounded-xl' : 'rounded-none'} ${disabled ? 'bg-gray-300' : isDark ? 'bg-primary-900' : 'bg-primary-500'}`,
        className,
      )}
      style={style}
    >
      <ThemedText
        className={`text-center text-base ${disabled ? 'text-white' : isDark ? 'text-white' : 'text-black'}`}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
};

export default Button;
