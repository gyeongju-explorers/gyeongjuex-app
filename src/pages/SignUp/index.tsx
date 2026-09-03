import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import visibleActiveIcon from '@/assets/icons/visible-active.svg';
import visibleInactiveIcon from '@/assets/icons/visible-inactive.svg';
import Button from '@/components/global/Button';
import HelperText from '@/components/global/HelperText';
import { Input } from '@/components/global/Input';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import Header from '@/components/SignUp/Header';
import SmallButton from '@/components/global/SmallButton';
import { MaxContentWidth, Spacing } from '@/constants/theme';

function Label({ children }: { children: string }) {
  return <ThemedText className="text-sm leading-[16px] text-black">{children}</ThemedText>;
}

// TODO: 실제 아이디 중복확인 API로 교체.
function checkIdDuplicateMock(value: string) {
  return value.trim().toLowerCase() === 'test';
}

function PasswordInput({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="relative justify-center">
      <Input
        placeholder={placeholder}
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        className="absolute bottom-0 right-[22px] top-0 items-center justify-center"
        hitSlop={8}
        onPress={() => setVisible((prev) => !prev)}
      >
        {visible ? (
          <Image source={visibleActiveIcon} style={{ width: 19, height: 13 }} />
        ) : (
          <Image source={visibleInactiveIcon} style={{ width: 20, height: 9 }} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SignUp() {
  const [id, setId] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'available' | 'duplicate'>('idle');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const isComplete = [id, nickname, password, passwordConfirm, name].every(
    (value) => value.trim().length > 0,
  );

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const handleIdChange = (text: string) => {
    setId(text);
    setIdCheckStatus('idle');
  };

  const handleIdCheck = () => {
    setIdCheckStatus(checkIdDuplicateMock(id) ? 'duplicate' : 'available');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header />

        <View style={styles.content}>
          <ScrollView contentContainerClassName="gap-24 py-24">
            <View className="gap-8">
              <Label>아이디</Label>
              <View className="flex-row gap-8">
                <Input
                  className="flex-1"
                  placeholder="아이디를 입력하세요"
                  value={id}
                  onChangeText={handleIdChange}
                />
                <SmallButton
                  text="중복확인"
                  disabled={id.trim().length === 0}
                  onPress={handleIdCheck}
                />
              </View>
              {idCheckStatus === 'available' && (
                <HelperText>사용 가능한 아이디입니다.</HelperText>
              )}
              {idCheckStatus === 'duplicate' && (
                <HelperText>이미 사용 중인 아이디입니다.</HelperText>
              )}
            </View>

            <View className="gap-8">
              <Label>닉네임</Label>
              <Input placeholder="닉네임을 입력하세요" value={nickname} onChangeText={setNickname} />
            </View>

            <View className="gap-8">
              <Label>비밀번호</Label>
              <PasswordInput placeholder="비밀번호" value={password} onChangeText={setPassword} />
              <PasswordInput
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
              {passwordMismatch && <HelperText>비밀번호가 일치하지 않습니다.</HelperText>}
            </View>

            <View className="gap-8">
              <Label>이름</Label>
              <Input placeholder="이름을 입력하세요" value={name} onChangeText={setName} />
            </View>
          </ScrollView>
        </View>

        <Button
          text="가입하기"
          rounded={false}
          disabled={!isComplete}
          style={styles.submitButton}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  submitButton: {
    height: 79
  },
});
