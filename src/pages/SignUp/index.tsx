import { isAxiosError } from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkUsernameAvailable, signup } from '@/api/auth';
import checkIcon from '@/assets/icons/check.svg';
import visibleActiveIcon from '@/assets/icons/visible-active.svg';
import visibleInactiveIcon from '@/assets/icons/visible-inactive.svg';
import Button from '@/components/global/Button';
import HelperText from '@/components/global/HelperText';
import { Input } from '@/components/global/Input';
import SmallButton from '@/components/global/SmallButton';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import Header from '@/components/SignUp/Header';
import { MaxContentWidth, Spacing } from '@/constants/theme';

function Label({ children }: { children: string }) {
  return <ThemedText className="text-sm leading-[16px] text-black">{children}</ThemedText>;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}

const PASSWORD_RULE_REGEX = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

function isPasswordValid(password: string) {
  return PASSWORD_RULE_REGEX.test(password);
}

function PasswordRequirement({ satisfied }: { satisfied: boolean }) {
  const color = satisfied ? '#29D9CE' : '#D1D1D1';

  return (
    <View className="flex-row items-center gap-8">
      <Image source={checkIcon} tintColor={color} style={{ width: 10, height: 7.5 }} />
      <ThemedText
        className={satisfied ? 'text-primary' : 'text-gray-500'}
        style={{ fontSize: 10 }}
      >
        8자 이상, 영문/숫자/특수문자 조합
      </ThemedText>
    </View>
  );
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
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>(
    'idle',
  );
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const isComplete =
    [id, nickname, password, passwordConfirm, name].every((value) => value.trim().length > 0) &&
    isPasswordValid(password) &&
    !passwordMismatch;

  const handleIdChange = (text: string) => {
    setId(text);
    setIdCheckStatus('idle');
  };

  const handleIdCheck = async () => {
    setIdCheckStatus('checking');
    try {
      const available = await checkUsernameAvailable(id);
      setIdCheckStatus(available ? 'available' : 'duplicate');
    } catch {
      setIdCheckStatus('idle');
    }
  };

  const handleSignup = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await signup({ username: id, nickname, password, passwordConfirm, name });
      router.replace({ pathname: '/login', params: { signupComplete: '1' } });
    } catch (error) {
      setSubmitError(getErrorMessage(error, '회원가입에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
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
                  disabled={id.trim().length === 0 || idCheckStatus === 'checking'}
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
              <PasswordRequirement satisfied={isPasswordValid(password)} />
            </View>

            <View className="gap-8">
              <Label>비밀번호 확인</Label>
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

            {submitError.length > 0 && <HelperText>{submitError}</HelperText>}
          </ScrollView>
        </View>

        <Button
          text="가입하기"
          rounded={false}
          disabled={!isComplete || isSubmitting}
          onPress={handleSignup}
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
