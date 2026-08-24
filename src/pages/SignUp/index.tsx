import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/global/Button';
import { Input } from '@/components/global/Input';
import { ThemedView } from '@/components/global/themed-view';
import Header from '@/components/SignUp/Header';
import SmallButton from '@/components/SignUp/SmallButton';
import { MaxContentWidth, Spacing } from '@/constants/theme';

function Label({ children }: { children: string }) {
  return <Text className="text-sm font-medium leading-[16px] text-black">{children}</Text>;
}

export default function SignUp() {
  const [id, setId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isComplete = [id, nickname, password, passwordConfirm, name, phone].every(
    (value) => value.trim().length > 0,
  );

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
                  onChangeText={setId}
                />
                <SmallButton text="중복확인" />
              </View>
            </View>

            <View className="gap-8">
              <Label>닉네임</Label>
              <Input placeholder="닉네임을 입력하세요" value={nickname} onChangeText={setNickname} />
            </View>

            <View className="gap-8">
              <Label>비밀번호</Label>
              <Input
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Input
                placeholder="비밀번호 확인"
                secureTextEntry
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
            </View>

            <View className="gap-8">
              <Label>이름</Label>
              <Input placeholder="이름을 입력하세요" value={name} onChangeText={setName} />
            </View>

            <View className="gap-8">
              <Label>휴대폰 인증</Label>
              <View className="flex-row gap-8">
                <Input
                  className="flex-1"
                  placeholder="휴대폰 번호"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <SmallButton text="인증번호 받기" />
              </View>
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
    height: 79,
    boxShadow: '0 4px 14.6px 0 rgba(0, 0, 0, 0.10)',
  },
});
