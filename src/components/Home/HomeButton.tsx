import { Pressable } from 'react-native';

import { ThemedText } from '@/components/global/themed-text';

const HomeButton = () => {
  return (
    <Pressable className="h-50 w-140 items-center justify-center rounded-full bg-background-element dark:bg-background-element-dark">
      <ThemedText weight="bold" className="text-center text-sm text-gray-500">
        버튼
      </ThemedText>
    </Pressable>
  );
};

export default HomeButton;
