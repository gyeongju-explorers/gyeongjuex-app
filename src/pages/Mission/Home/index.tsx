import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getNearbyPlaces, type Place } from '@/api/places';
import image2 from '@/assets/images/image2.png';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import MissionButton from '@/components/Mission/MissionButton';
import PlaceListItem from '@/components/Mission/PlaceListItem';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const NEARBY_PLACES_LIMIT = 5;

export default function MissionHome() {
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') return null;
        return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      })
      .then((location) => {
        if (!location) return;
        return getNearbyPlaces({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          limit: NEARBY_PLACES_LIMIT,
        });
      })
      .then((places) => {
        if (places) setNearbyPlaces(places);
      })
      .catch(() => {
        // 위치 권한 거부 등으로 실패해도 배너는 그대로 보여주고 목록만 비워둔다.
      });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* banner */}
        <View className="bg-gray-500 p-24 justify-between" style={styles.banner}>
          <Image source={image2} contentFit="cover" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View className="gap-20">
            <ThemedText className="mt-24 font-bold text-primary">P!CK:TOUR</ThemedText>
            <ThemedText weight="bold" className="text-3xl text-white">
              이번에는 어디로 픽투어를 떠나게 될까요?
            </ThemedText>
            <ThemedText className="text-white text-base">
              이미지를 토대로 미션을 해결해보세요!
            </ThemedText>
          </View>
          <View className="items-end mb-10">
            <MissionButton text="미션 하러가기" border href="/mission/map" />
          </View>
        </View>

        <SafeAreaView style={styles.safeArea}>
          <ThemedText className="py-24 text-xl font-bold">주변에 위치한 미션장소</ThemedText>
          <View style={styles.listContent}>
            {nearbyPlaces.map((place) => (
              <PlaceListItem key={place.id} place={place} />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    height: 340,
  },
  safeArea: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 140,
    maxWidth: MaxContentWidth,
  },
  listContent: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
  },
});
