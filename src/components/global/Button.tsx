import { Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';

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
      className={`h-56 w-full items-center justify-center ${rounded ? 'rounded-xl' : 'rounded-none'} ${disabled ? 'bg-gray-300' : isDark ? 'bg-primary-900' : 'bg-primary-500'}`}
      style={style}
    >
      <Text
        className={`text-center text-base ${disabled ? 'text-white' : isDark ? 'text-white' : 'text-black'}`}
      >
        {text}
      </Text>
    </Pressable>
  );
};

export default Button;
