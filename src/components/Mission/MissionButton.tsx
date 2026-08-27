import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';
import { ThemedText } from '../global/themed-text';

type MissionButtonProps = {
  text: string;
  border?: boolean;
  href?: Href;
};

const MissionButton = ({ text, border, href }: MissionButtonProps) => {
  return (
    <Pressable
      onPress={href ? () => router.push(href) : undefined}
      className={`self-start bg-primary px-36 py-14 rounded-full border-[1.5px] ${border ? 'border-white' : 'border-primary '}`}
    >
      <ThemedText className="text-black font-bold">{text}</ThemedText>
    </Pressable>
  );
};

export default MissionButton;
