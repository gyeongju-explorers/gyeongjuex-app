import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import cameraIcon from '@/assets/icons/camera.svg';
import profileDefaultIcon from '@/assets/icons/profile-default.svg';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// TODO: 실제 로그인한 사용자 정보로 교체.
const initialUser = {
  name: '김꼼지',
  nickname: '김꼼지',
  id: 'asdf',
  password: 'qwer123',
};

type InfoRowProps = {
  label: string;
  value: string;
  round?: 'top' | 'bottom';
  isLast?: boolean;
  editable?: boolean;
  onChangeValue?: (value: string) => void;
};

function InfoRow({ label, value, round, isLast, editable, onChangeValue }: InfoRowProps) {
  const roundClass = round === 'top' ? 'rounded-t-[12px]' : round === 'bottom' ? 'rounded-b-[12px]' : '';

  return (
    <View
      className={`h-[48px] flex-row items-center justify-between bg-white px-16 ${roundClass} ${isLast ? '' : 'border-b border-gray-100'}`}
    >
      <ThemedText className="text-black">{label}</ThemedText>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          className="flex-1 pl-16 text-right text-gray-500"
        />
      ) : (
        <ThemedText className="text-gray-500">{value}</ThemedText>
      )}
    </View>
  );
}

export default function My() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialUser);

  const handleToggleEdit = () => {
    if (isEditing) {
      // TODO: 실제 회원정보 수정 API 호출로 교체.
    }
    setIsEditing((prev) => !prev);
  };

  const updateField = (field: keyof typeof initialUser) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View>
          <TouchableOpacity className="absolute right-0 top-4 z-10" onPress={handleToggleEdit}>
            <ThemedText className="text-gray-700">{isEditing ? '완료' : '수정하기'}</ThemedText>
          </TouchableOpacity>

          <View className="items-center pt-[37px]">
            <View className="relative">
              <Image source={profileDefaultIcon} style={{ width: 90, height: 90 }} />
              <TouchableOpacity className="absolute" style={{ right: -4, bottom: -4 }}>
                <Image source={cameraIcon} style={{ width: 28, height: 28 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-24">
            <InfoRow
              label="이름"
              value={form.name}
              editable={isEditing}
              onChangeValue={updateField('name')}
              round="top"
            />
            <InfoRow
              label="닉네임"
              value={form.nickname}
              editable={isEditing}
              onChangeValue={updateField('nickname')}
            />
            <InfoRow
              label="아이디"
              value={form.id}
              editable={isEditing}
              onChangeValue={updateField('id')}
            />
            <InfoRow
              label="비밀번호 변경"
              value={form.password}
              editable={isEditing}
              onChangeValue={updateField('password')}
              round="bottom"
              isLast
            />
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-57 pb-[132px]">
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <ThemedText className="text-gray-500">로그아웃</ThemedText>
          </TouchableOpacity>
          <View className="h-12 w-1 bg-gray-300" />
          <TouchableOpacity>
            <ThemedText className="text-gray-500">회원탈퇴</ThemedText>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
