import { isAxiosError } from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeMission } from '@/api/missions';
import backIcon from '@/assets/icons/back-white.svg';
import image1 from '@/assets/images/image2.png';
import PickButton from '@/components/global/PickButton';
import { ThemedText } from '@/components/global/themed-text';
import MissionReferencePreview from '@/components/Mission/MissionReferencePreview';
import MissionReferenceThumbnail from '@/components/Mission/MissionReferenceThumbnail';
import { getDistanceInMeters, MISSION_SUCCESS_RADIUS_METERS } from '@/utils/geo';

const CAPTURED_PHOTO_PREVIEW_MS = 3000;

type MissionOutcome =
  { success: true; params: Record<string, string> } | { success: false; message: string };

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function MissionCamera() {
  const { placeId, image, name, latitude, longitude } = useLocalSearchParams<{
    placeId?: string;
    image?: string;
    name?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const referencePhoto = image ? { uri: image } : image1;
  const targetPlaceId = placeId ? Number(placeId) : null;
  const targetLatitude = latitude ? Number(latitude) : null;
  const targetLongitude = longitude ? Number(longitude) : null;

  const [permission, requestPermission] = useCameraPermissions();
  const [isReferenceExpanded, setIsReferenceExpanded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const verifyMission = async (photoUri: string): Promise<MissionOutcome> => {
    if (targetPlaceId === null || targetLatitude === null || targetLongitude === null) {
      return { success: false, message: '이 장소의 위치 정보를 확인할 수 없어요.' };
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, message: '미션 인증을 위해 위치 접근 권한이 필요합니다.' };
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude: currentLatitude, longitude: currentLongitude } = currentLocation.coords;

      const distance = getDistanceInMeters(
        currentLatitude,
        currentLongitude,
        targetLatitude,
        targetLongitude,
      );

      if (distance > MISSION_SUCCESS_RADIUS_METERS) {
        return {
          success: false,
          message: `장소에서 약 ${Math.round(distance)}m 떨어져 있어요. ${MISSION_SUCCESS_RADIUS_METERS}m 이내에서 다시 촬영해주세요.`,
        };
      }

      // 클라이언트 판정은 즉각 피드백/업로드 낭비 방지용이고, 최종 판정과 저장은 서버에서 한 번 더 한다.
      const result = await completeMission({
        placeId: targetPlaceId,
        latitude: currentLatitude,
        longitude: currentLongitude,
        photoUri,
      });

      return {
        success: true,
        params: {
          placeName: result.placeName,
          completedCount: String(result.completedCount),
          currentTierTitle: result.currentTier?.title ?? '',
          nextTierTitle: result.nextTier?.title ?? '',
          missionsToNext: result.missionsToNext !== null ? String(result.missionsToNext) : '',
        },
      };
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          '미션 인증에 실패했어요. 다시 시도해주세요.')
        : '위치를 확인하지 못했어요. 다시 시도해주세요.';
      return { success: false, message };
    }
  };

  const handleCapture = async () => {
    if (isVerifying) return;

    const photo = await cameraRef.current?.takePictureAsync();
    if (!photo) return;

    setCapturedPhotoUri(photo.uri);
    setIsVerifying(true);

    // 사진을 3초간 보여주는 동안 인증을 처리하고, 결과에 따라 완료/실패 화면으로 자동 전환한다.
    const [outcome] = await Promise.all([
      verifyMission(photo.uri),
      wait(CAPTURED_PHOTO_PREVIEW_MS),
    ]);

    if (outcome.success) {
      router.replace({ pathname: '/mission/badge', params: outcome.params });
    } else {
      router.replace({
        pathname: '/mission/failure',
        params: { message: outcome.message, placeId, image, name, latitude, longitude },
      });
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center gap-16 px-24">
        <ThemedText className="text-white text-center">
          미션 사진을 촬영하려면 카메라 접근 권한이 필요합니다.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          className="bg-primary px-36 py-14 rounded-full border-[1.5px] border-primary"
        >
          <ThemedText className="text-black text-center font-bold">권한 허용하기</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none" className="my-48">
        <View className="flex-row items-start justify-between px-16 pt-8">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Image source={backIcon} className="w-24 h-24" />
          </Pressable>

          <MissionReferenceThumbnail
            photo={referencePhoto}
            onPress={() => setIsReferenceExpanded(true)}
          />
        </View>

        <View className="flex-1 items-center justify-end pb-40" pointerEvents="box-none">
          <Pressable onPress={handleCapture} disabled={isVerifying}>
            {isVerifying ? (
              <View className="w-70 h-70 items-center justify-center">
                <ActivityIndicator color="white" size="large" />
              </View>
            ) : (
              <PickButton />
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      {isReferenceExpanded && (
        <MissionReferencePreview
          photo={referencePhoto}
          onClose={() => setIsReferenceExpanded(false)}
        />
      )}

      {capturedPhotoUri && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: capturedPhotoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View className="absolute inset-0 items-center justify-end pb-56">
            <ActivityIndicator color="white" size="large" />
          </View>
        </View>
      )}
    </View>
  );
}
