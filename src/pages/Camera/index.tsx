import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { uploadGeneralPhoto } from '@/api/record';
import backWhiteIcon from '@/assets/icons/back-white.svg';
import PhotoDetailOverlay from '@/components/Record/PhotoDetailOverlay';
import PickButton from '@/components/global/PickButton';
import { ThemedText } from '@/components/global/themed-text';

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  // 이 카메라를 연 뒤 찍은 사진들 — 특정 장소/미션에 묶이지 않는 일반 사진 모음.
  const [sessionPhotos, setSessionPhotos] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (!photo) return;

    setSessionPhotos((current) => [...current, photo.uri]);
    // 화면 전환 없이 계속 찍을 수 있어야 해서, 업로드는 화면을 막지 않고 백그라운드로 보낸다.
    uploadGeneralPhoto({ photoUri: photo.uri }).catch((err) => {
      console.error('일반 사진 업로드 실패:', err);
    });
  };

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center gap-16 px-24">
        <ThemedText className="text-white text-center">
          사진을 촬영하려면 카메라 접근 권한이 필요합니다.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          className="bg-primary px-36 py-14 rounded-full border-[1.5px] border-primary"
        >
          <ThemedText className="text-black text-center font-bold">권한 허용하기</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none" className="my-48">
        <View className="flex-row items-start px-16 pt-8">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Image source={backWhiteIcon} className="w-24 h-24" />
          </Pressable>
        </View>

        <View className="flex-1 justify-end pb-40" pointerEvents="box-none">
          <View className="flex-row items-center px-32" pointerEvents="box-none">
            <View className="flex-1 items-start">
              {sessionPhotos.length > 0 && (
                <Pressable onPress={() => setIsViewerOpen(true)}>
                  <Image
                    source={{ uri: sessionPhotos[sessionPhotos.length - 1] }}
                    className="w-77 h-104 rounded-xl border-4 border-white"
                  />
                </Pressable>
              )}
            </View>
            <Pressable onPress={handleCapture}>
              <PickButton />
            </Pressable>
            <View className="flex-1" />
          </View>
        </View>
      </SafeAreaView>

      {isViewerOpen && (
        <PhotoDetailOverlay
          photos={sessionPhotos}
          initialIndex={sessionPhotos.length - 1}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </View>
  );
}
