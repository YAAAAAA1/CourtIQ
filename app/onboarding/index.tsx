import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Personalized Training',
    description: 'Get custom basketball workouts tailored to your skill level and goals.',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Track Your Nutrition',
    description: 'Monitor your diet to ensure you are fueling your body for peak performance.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'AI Basketball Coach',
    description: 'Get expert advice and feedback on your game from our AI coach.',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=2071&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Set and Track Goals',
    description: 'Define your basketball goals and track your progress over time.',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop',
  },
];

export default function OnboardingScreen() {
  const { setIsNewUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, complete onboarding
      router.replace('/onboarding/profile');
    }
  };

  const handleSkip = () => {
    // Skip to profile completion
    router.replace('/onboarding/profile');
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />
      <View style={styles.overlay} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          
          <Button
            title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  textContainer: {
    padding: 40,
    paddingBottom: 160,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[600],
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: colors.text,
    fontSize: 16,
  },
  nextButton: {
    width: 120,
  },
});