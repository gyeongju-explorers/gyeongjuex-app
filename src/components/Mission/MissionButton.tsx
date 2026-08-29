import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { twMerge } from '@/lib/tw-merge';

import { ThemedText } from '../global/themed-text';

type MissionButtonProps = {
  text: string;
  border?: boolean;
  href?: Href;
  className?: string;
};

const MissionButton = ({ text, border, href, className }: MissionButtonProps) => {
  return (
    <Pressable
      onPress={href ? () => router.push(href) : undefined}
      className={twMerge(
        `self-start bg-primary px-36 py-14 rounded-full border-[1.5px] ${border ? 'border-white' : 'border-primary '}`,
        className,
      )}
    >
      <ThemedText className="text-black text-center font-bold">{text}</ThemedText>
    </Pressable>
  );
};

export default MissionButton;
