import { Pressable, Text } from 'react-native';

type ButtonProps = {
  text: string;
  theme?: 'dark' | 'default';
};

const Button = ({ text, theme = 'default' }: ButtonProps) => {
  const isDark = theme === 'dark';

  return (
    <Pressable
      className={`h-56 w-full items-center justify-center rounded-xl ${isDark ? 'bg-primary-900' : 'bg-primary-500'}`}
    >
      <Text className={`text-center text-base ${isDark ? 'text-white' : 'text-black'}`}>
        {text}
      </Text>
    </Pressable>
  );
};

export default Button;
