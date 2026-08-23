import { Pressable, Text } from 'react-native';

const HomeButton = () => {
  return (
    <Pressable className="h-50 w-140 items-center justify-center rounded-full bg-background-element dark:bg-background-element-dark">
      <Text className="text-center text-sm font-bold text-gray-500">버튼</Text>
    </Pressable>
  );
};

export default HomeButton;
