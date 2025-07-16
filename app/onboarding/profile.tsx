import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';

const basketballFocusAreas = [
  'Shooting',
  'Dribbling',
  'Passing',
  'Defense',
  'Conditioning',
  'Game IQ',
  'Footwork',
  'Post Moves',
];

const activityLevels = [
  { value: 1, label: 'Light (0-1 hours/day)' },
  { value: 2, label: 'Moderate (1-2 hours/day)' },
  { value: 3, label: 'Active (2-3 hours/day)' },
  { value: 4, label: 'Very Active (3+ hours/day)' },
];

export default function ProfileSetupScreen() {
  const { user, setHasCompletedOnboarding, setIsNewUser } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<number | null>(null);
  const [mainFocus, setMainFocus] = useState<string | null>(null);
  const [personalGoal, setPersonalGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !age || !heightFeet || !weight || !activityLevel || !mainFocus || !personalGoal) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert height to total inches for storage
      const totalHeightInches = parseInt(heightFeet) * 12 + (parseInt(heightInches) || 0);
      
      // Create user profile in Supabase
      const { error: profileError } = await supabase.from('users').insert({
        id: user?.id,
        email: user?.email,
        name,
        age: parseInt(age),
        height: totalHeightInches, // Store as total inches
        weight: parseFloat(weight), // Store as pounds
        profile_image_url: profileImage || null,
        activity_level: activityLevel,
        main_focus: mainFocus,
        personal_goal: personalGoal,
        units: 'imperial', // Default to imperial units
      });

      if (profileError) {
        throw profileError;
      }

      // Mark onboarding as completed
      setHasCompletedOnboarding(true);
      setIsNewUser(false);
      
      // Navigate to main app
      router.replace('/(app)');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your basketball experience</Text>
        </View>

        <View style={styles.profileImageContainer}>
          <TouchableOpacity style={styles.profileImageWrapper} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={colors.text} />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Camera size={16} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Input
                label="Age"
                placeholder="Years"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Weight"
                placeholder="lbs"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Height</Text>
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Input
                label="Feet"
                placeholder="ft"
                value={heightFeet}
                onChangeText={setHeightFeet}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Inches"
                placeholder="in"
                value={heightInches}
                onChangeText={setHeightInches}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Activity Level</Text>
          <View style={styles.optionsContainer}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionButton,
                  activityLevel === level.value && styles.selectedOption,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    activityLevel === level.value && styles.selectedOptionText,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Main Focus Area</Text>
          <View style={styles.tagsContainer}>
            {basketballFocusAreas.map((focus) => (
              <TouchableOpacity
                key={focus}
                style={[
                  styles.tagButton,
                  mainFocus === focus && styles.selectedTag,
                ]}
                onPress={() => setMainFocus(focus)}
              >
                <Text
                  style={[
                    styles.tagText,
                    mainFocus === focus && styles.selectedTagText,
                  ]}
                >
                  {focus}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Personal Goal"
            placeholder="What do you want to achieve?"
            value={personalGoal}
            onChangeText={setPersonalGoal}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={styles.textArea}
          />

          <Button
            title="Complete Setup"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  addPhotoText: {
    color: colors.primary,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.secondaryLight,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: colors.primary,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedTagText: {
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  button: {
    marginTop: 24,
  },
});