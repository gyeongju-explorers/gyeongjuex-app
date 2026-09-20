import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMe, type MeResponse, updateMe, withdraw } from '@/api/auth';
import { setAccessToken, setRefreshToken } from '@/api/session';
import cameraIcon from '@/assets/icons/camera.svg';
import profileDefaultIcon from '@/assets/icons/profile-default.svg';
import WithdrawConfirmOverlay from '@/components/My/WithdrawConfirmOverlay';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHideNavWhile } from '@/hooks/use-nav-visibility';

type EditableFields = Pick<MeResponse, 'name' | 'nickname' | 'username'>;

const EMPTY_FORM: EditableFields = { name: '', nickname: '', username: '' };

type InfoRowProps = {
  label: string;
  value: string;
  round?: 'top' | 'bottom';
  isLast?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
  placeholder?: string;
  onChangeValue?: (value: string) => void;
};

function InfoRow({
  label,
  value,
  round,
  isLast,
  editable,
  secureTextEntry,
  placeholder,
  onChangeValue,
}: InfoRowProps) {
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
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          className="flex-1 pl-16 text-right text-gray-500"
        />
      ) : (
        <ThemedText className="text-gray-500">{value}</ThemedText>
      )}
    </View>
  );
}

export default function My() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditableFields>(EMPTY_FORM);
  const [newPassword, setNewPassword] = useState('');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  useHideNavWhile(showWithdrawConfirm);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (!isMounted) return;
        setUser(data);
        setForm({ name: data.name, nickname: data.nickname, username: data.username });
      })
      .catch(() => {
        // 회원정보를 불러오지 못한 경우, 빈 값으로 둔다.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWithdraw = async () => {
    try {
      await withdraw();
      setAccessToken(null);
      setRefreshToken(null);
      router.replace('/login');
    } catch {
      // 탈퇴 실패 시 팝업을 그대로 두고 사용자가 다시 시도할 수 있게 함.
    }
  };

  const handleToggleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!user) {
      setIsEditing(false);
      return;
    }

    const payload: Parameters<typeof updateMe>[0] = {};
    if (form.name !== user.name) payload.name = form.name;
    if (form.nickname !== user.nickname) payload.nickname = form.nickname;
    if (form.username !== user.username) payload.username = form.username;
    if (newPassword.trim().length > 0) {
      payload.password = newPassword;
      payload.passwordConfirm = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      const updated = await updateMe(payload);
      setUser(updated);
      setForm({ name: updated.name, nickname: updated.nickname, username: updated.username });
      setNewPassword('');
      setIsEditing(false);
    } catch {
      // 수정 실패 시 편집 모드를 유지해서 다시 시도할 수 있게 함.
    }
  };

  const updateField = (field: keyof EditableFields) => (value: string) => {
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
              value={form.username}
              editable={isEditing}
              onChangeValue={updateField('username')}
            />
            <InfoRow
              label="비밀번호 변경"
              value={isEditing ? newPassword : '********'}
              editable={isEditing}
              secureTextEntry
              placeholder="새 비밀번호"
              onChangeValue={setNewPassword}
              round="bottom"
              isLast
            />
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-57 pb-[132px]">
          <TouchableOpacity
            onPress={() => {
              setAccessToken(null);
              setRefreshToken(null);
              router.replace('/login');
            }}
          >
            <ThemedText className="text-gray-500">로그아웃</ThemedText>
          </TouchableOpacity>
          <View className="h-12 w-1 bg-gray-300" />
          <TouchableOpacity onPress={() => setShowWithdrawConfirm(true)}>
            <ThemedText className="text-gray-500">회원탈퇴</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {showWithdrawConfirm && (
        <WithdrawConfirmOverlay
          onCancel={() => setShowWithdrawConfirm(false)}
          onConfirm={handleWithdraw}
        />
      )}
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
