import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import checkIcon from '@/assets/icons/check.svg';
import { ThemedText } from '@/components/global/themed-text';

type CheckboxTextProps = {
  text: string;
  checkedColor?: string;
};

const CheckboxText = ({ text, checkedColor = '#29D9CE' }: CheckboxTextProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <Pressable className="flex-row items-center gap-8" onPress={() => setChecked((prev) => !prev)}>
      <View
        className="h-20 w-20 items-center justify-center rounded-md border-2"
        style={{
          backgroundColor: checked ? checkedColor : 'transparent',
          borderColor: checked ? checkedColor : '#E0E1E6',
        }}
      >
        {checked && <Image source={checkIcon} style={{ width: 12, height: 9 }} />}
      </View>
      <ThemedText className="text-md text-gray-500 dark:text-text-dark">{text}</ThemedText>
    </Pressable>
  );
};

export default CheckboxText;
