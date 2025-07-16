import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Settings as SettingsIcon, LogOut, Bell, Globe, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAllMealReminders, cancelAllMealReminders } from '@/lib/notifications';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserSettings();
    loadMealReminderSetting();
  }, []);

  const loadUserSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('units')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.units) {
        setUnits(data.units);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const loadMealReminderSetting = async () => {
    const value = await AsyncStorage.getItem('mealReminders');
    if (value === 'false') {
      setMealReminders(false);
    } else {
      setMealReminders(true);
    }
  };

  const handleToggleMealReminders = async (value: boolean) => {
    setMealReminders(value);
    await AsyncStorage.setItem('mealReminders', value ? 'true' : 'false');
    if (value) {
      await scheduleAllMealReminders();
      Alert.alert('Meal Reminders', 'Meal reminders enabled.');
    } else {
      await cancelAllMealReminders();
      Alert.alert('Meal Reminders', 'Meal reminders disabled.');
    }
  };

  const updateUnits = async (newUnits: 'imperial' | 'metric') => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ units: newUnits })
        .eq('id', user.id);

      if (error) throw error;
      setUnits(newUnits);
      Alert.alert('Success', `Units changed to ${newUnits}`);
    } catch (error) {
      console.error('Error updating units:', error);
      Alert.alert('Error', 'Failed to update units');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/onboarding/profile');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy would be displayed here.');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service would be displayed here.');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Card title="Profile" style={styles.card}>
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingLeft}>
            <User size={20} color={colors.text} />
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <Text style={styles.settingValue}>{'>'}</Text>
        </TouchableOpacity>
      </Card>

      <Card title="Preferences" style={styles.card}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Globe size={20} color={colors.text} />
            <Text style={styles.settingText}>Units</Text>
          </View>
          <View style={styles.unitsContainer}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                units === 'imperial' && styles.unitButtonActive,
              ]}
              onPress={() => updateUnits('imperial')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  units === 'imperial' && styles.unitButtonTextActive,
                ]}
              >
                Imperial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                units === 'metric' && styles.unitButtonActive,
              ]}
              onPress={() => updateUnits('metric')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  units === 'metric' && styles.unitButtonTextActive,
                ]}
              >
                Metric
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={colors.text} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(value) => {
              setNotifications(value);
              Alert.alert('Notifications', `Notifications ${value ? 'enabled' : 'disabled'}`);
            }}
            trackColor={{ false: colors.gray[700], true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={colors.text} />
            <Text style={styles.settingText}>Meal Reminders</Text>
          </View>
          <Switch
            value={mealReminders}
            onValueChange={handleToggleMealReminders}
            trackColor={{ false: colors.gray[700], true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </Card>

      <Card title="Support" style={styles.card}>
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
          <View style={styles.settingLeft}>
            <Shield size={20} color={colors.text} />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <Text style={styles.settingValue}>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleTermsOfService}>
          <View style={styles.settingLeft}>
            <SettingsIcon size={20} color={colors.text} />
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
          <Text style={styles.settingValue}>{'>'}</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        leftIcon={<LogOut size={20} color={colors.error} />}
        style={[styles.signOutButton, { borderColor: colors.error }] as any}
        textStyle={{ color: colors.error }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>HoopMaster AI v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  card: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryDark,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  unitsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryDark,
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});