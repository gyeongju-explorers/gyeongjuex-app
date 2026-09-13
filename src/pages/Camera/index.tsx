import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCompletedPlaces, type Place } from '@/api/places';
import { uploadGeneralPhoto } from '@/api/record';
import backIcon from '@/assets/icons/back.svg';
import backWhiteIcon from '@/assets/icons/back-white.svg';
import PlacePickerModal from '@/components/Camera/PlacePickerModal';
import HelperText from '@/components/global/HelperText';
import PickButton from '@/components/global/PickButton';
import { ThemedText } from '@/components/global/themed-text';

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [completedPlaces, setCompletedPlaces] = useState<Place[] | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') return null;
        return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      })
      .then((location) =>
        getCompletedPlaces(
          location
            ? { lat: location.coords.latitude, lng: location.coords.longitude }
            : undefined,
        ),
      )
      .then((places) => {
        setCompletedPlaces(places);
        // 가장 가까운(=첫 번째) 완료 장소를 기본 사진첩으로 자동 선택.
        setSelectedPlace(places[0] ?? null);
      })
      .catch(() => {
        setCompletedPlaces([]);
      });
  }, []);

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (!photo) return;

    setUploadFailed(false);
    setCapturedPhotoUri(photo.uri);
  };

  const handleRetake = () => {
    setCapturedPhotoUri(null);
    setUploadFailed(false);
  };

  const handleSave = async () => {
    if (isUploading || !selectedPlace || !capturedPhotoUri) return;

    setIsUploading(true);
    try {
      await uploadGeneralPhoto({ placeId: selectedPlace.id, photoUri: capturedPhotoUri });
      router.back();
    } catch {
      setUploadFailed(true);
    } finally {
      setIsUploading(false);
    }
  };

  if (!permission || completedPlaces === null) {
    return <View className="flex-1 bg-black" />;
  }

  if (completedPlaces.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center gap-16 px-24">
        <ThemedText className="text-white text-center">
          아직 완료한 미션이 없어요.{'\n'}미션을 먼저 완료하면 사진을 찍을 수 있어요.
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-36 py-14 rounded-full border-[1.5px] border-primary"
        >
          <ThemedText className="text-black text-center font-bold">돌아가기</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
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

  // 촬영 직후: 찍힌 사진 + 어느 사진첩으로 저장될지 확인/변경 후 저장.
  if (capturedPhotoUri) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-24 pb-40 pt-24">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Image source={backIcon} className="w-24 h-24" />
          </Pressable>

          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri: capturedPhotoUri }}
              className="h-[320px] w-240 rounded-3xl"
              contentFit="cover"
            />
          </View>

          <View className="gap-16">
            {uploadFailed && <HelperText>사진 저장에 실패했어요. 다시 시도해주세요.</HelperText>}

            <Pressable
              className="flex-row items-center justify-between rounded-xl border border-gray-200 px-16 py-14"
              onPress={() => setIsPickerVisible(true)}
              disabled={isUploading}
            >
              <ThemedText className="text-sm font-bold">{selectedPlace?.name}</ThemedText>
              <ThemedText className="text-gray-400">⌄</ThemedText>
            </Pressable>

            <View className="flex-row gap-12">
              <Pressable
                className="flex-1 items-center rounded-full border-[1.5px] border-gray-300 py-14"
                onPress={handleRetake}
                disabled={isUploading}
              >
                <ThemedText className="font-bold">다시 찍기</ThemedText>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-full bg-primary py-14"
                onPress={handleSave}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <ThemedText className="text-black font-bold">저장</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        <PlacePickerModal
          visible={isPickerVisible}
          places={completedPlaces}
          selectedPlaceId={selectedPlace?.id ?? null}
          onSelect={setSelectedPlace}
          onClose={() => setIsPickerVisible(false)}
        />
      </View>
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

        <View className="flex-1 items-center justify-end pb-40" pointerEvents="box-none">
          <Pressable onPress={handleCapture}>
            <PickButton />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
