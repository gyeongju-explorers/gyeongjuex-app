import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import titleImage from '@/assets/images/title.svg';
import Button from '@/components/global/Button';
import CheckboxText from '@/components/global/CheckboxText';
import HelperText from '@/components/global/HelperText';
import { Input } from '@/components/global/Input';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// TODO: 실제 로그인 API로 교체.
function checkLoginMock(id: string, password: string) {
  return id === 'test' && password === 'test1234';
}

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const handleIdChange = (text: string) => {
    setId(text);
    setLoginFailed(false);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setLoginFailed(false);
  };

  const handleLogin = () => {
    const success = checkLoginMock(id, password);
    setLoginFailed(!success);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={titleImage}
          contentFit="contain"
          style={{ width: 242, height: 110, marginTop: 100 }}
        />

        <View className="gap-16 pt-[160px]">
          <View className="gap-8">
            <Input placeholder="아이디" value={id} onChangeText={handleIdChange} />
            <Input
              placeholder="비밀번호"
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
            />
            {loginFailed && <HelperText>로그인 정보가 동일하지 않습니다.</HelperText>}
          </View>
          <CheckboxText text="자동 로그인" />
          <Button text="로그인" theme="dark" onPress={handleLogin} />
          <View className="my-10 flex-row items-center justify-center gap-16">
            <TouchableOpacity>
              <ThemedText className="text-gray-500">아이디 찾기</ThemedText>
            </TouchableOpacity>
            <View className="h-12 w-1 bg-gray-300" />
            <TouchableOpacity>
              <ThemedText className="text-gray-500">비밀번호 찾기</ThemedText>
            </TouchableOpacity>
            <View className="h-12 w-1 bg-gray-300" />
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <ThemedText className="text-gray-500">회원가입</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
