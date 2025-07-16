import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { drills as allDrills, Drill } from '@/constants/drills';

const PROGRAM_LENGTHS = [2, 4, 8, 16];
const FOCUS_AREAS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'dribbling', label: 'Dribbling' },
  { id: 'passing', label: 'Passing' },
  { id: 'conditioning', label: 'Conditioning' },
  { id: 'recovery', label: 'Recovery' },
];
const DURATIONS = [30, 45, 60, 90];
const INTENSITIES = [
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'intense', label: 'Intense' },
];
const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];
const TIMES = [
  '6:00 AM', '7:00 AM', '8:00 AM', '12:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

function getNextDate(start: Date, dayOfWeek: string): Date {
  // dayOfWeek: 'mon', 'tue', ...
  const dayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
  const result = new Date(start);
  result.setDate(result.getDate() + ((7 + dayMap[dayOfWeek] - result.getDay()) % 7));
  return result;
}

function getDrillsForDay(focus: string[], intensity: string, duration: number): Drill[] {
  // 1. Select warm-up drill (prefer dynamic_stretching, fallback to any recovery drill)
  const warmupDrills = allDrills.filter(d => d.category === 'recovery' && d.name.toLowerCase().includes('dynamic'));
  const warmup = warmupDrills.length > 0 ? warmupDrills[Math.floor(Math.random() * warmupDrills.length)] : allDrills.find(d => d.category === 'recovery');

  // 2. Select cool-down drill (prefer static_stretching, foam_rolling, cool_down_walk, fallback to any recovery drill)
  const cooldownDrills = allDrills.filter(d => d.category === 'recovery' && (
    d.name.toLowerCase().includes('static') ||
    d.name.toLowerCase().includes('foam') ||
    d.name.toLowerCase().includes('cool down')
  ));
  const cooldown = cooldownDrills.length > 0 ? cooldownDrills[Math.floor(Math.random() * cooldownDrills.length)] : allDrills.find(d => d.category === 'recovery');

  // 3. Main drills: filter by focus and intensity, exclude warmup/cooldown
  let possibleDrills = allDrills.filter(d => focus.includes(d.category) && d.category !== 'recovery');
  if (intensity === 'light') possibleDrills = possibleDrills.filter(d => d.difficulty === 'beginner');
  if (intensity === 'moderate') possibleDrills = possibleDrills.filter(d => d.difficulty !== 'advanced');
  // For 'intense', allow all
  // Remove duplicates and avoid warmup/cooldown
  possibleDrills = possibleDrills.filter(d => d.id !== warmup?.id && d.id !== cooldown?.id);

  // 4. Fill up to duration (in seconds), accounting for warmup and cooldown
  let total = (warmup?.duration || 0) + (cooldown?.duration || 0);
  const selected: Drill[] = [];
  // Shuffle for variety
  const shuffled = possibleDrills.sort(() => 0.5 - Math.random());
  for (const drill of shuffled) {
    if (selected.find(d => d.id === drill.id)) continue; // avoid repeats
    if (total + drill.duration <= duration * 60) {
      selected.push(drill);
      total += drill.duration;
    }
    if (total >= duration * 60 * 0.9) break; // Fill at least 90%
  }
  // 5. Return [warmup, ...main, cooldown]
  const drills: Drill[] = [];
  if (warmup) drills.push(warmup);
  drills.push(...selected);
  if (cooldown) drills.push(cooldown);
  return drills;
}

export default function ProgramCreatorScreen() {
  const [length, setLength] = useState<number | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<string | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const toggleFocus = (id: string) => {
    setFocus(focus.includes(id) ? focus.filter(f => f !== id) : [...focus, id]);
  };
  const toggleDay = (id: string) => {
    setDays(days.includes(id) ? days.filter(d => d !== id) : [...days, id]);
  };

  const canSubmit = length && focus.length && duration && intensity && days.length && time;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);
    try {
      // Debug: log all values
      console.log('Creating program with:', {
        user_id: user.id,
        start_date: new Date().toISOString().split('T')[0],
        weeks: length,
        focus_areas: focus,
        duration_per_day: duration,
        intensity,
        days_of_week: days,
        time_of_day: time,
      });
      // Validation
      if (![2,4,8,16].includes(length!)) throw new Error('Weeks must be 2, 4, 8, or 16');
      if (!Number.isInteger(duration) || duration! < 10 || duration! > 180) throw new Error('Duration must be a reasonable number of minutes');
      if (!Array.isArray(focus) || focus.length === 0) throw new Error('Select at least one focus area');
      if (!Array.isArray(days) || days.length === 0) throw new Error('Select at least one workout day');
      if (typeof time !== 'string' || time.length > 20) throw new Error('Invalid time of day');
      // 1. Calculate start and end dates
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (length! * 7) - 1);
      // 2. Insert program
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          weeks: length,
          focus_areas: focus,
          duration_per_day: duration,
          intensity,
          days_of_week: days,
          time_of_day: time,
        })
        .select()
        .single();
      if (programError) throw programError;
      // 3. Generate schedule
      let scheduledWorkouts = [];
      let current = new Date(startDate);
      for (let week = 0; week < length!; week++) {
        for (const day of days) {
          // Find the next date for this day
          const workoutDate = getNextDate(current, day);
          if (workoutDate > endDate) continue;
          // 4. Create workout
          const workoutName = `${focus.map(f => FOCUS_AREAS.find(a => a.id === f)?.label).join(', ')} - ${workoutDate.toDateString()}`;
          const drillsForDay = getDrillsForDay(focus, intensity!, duration!);
          const totalDuration = drillsForDay.reduce((sum, d) => sum + d.duration, 0);
          const { data: workout, error: workoutError } = await supabase
            .from('workouts')
            .insert({
              user_id: user.id,
              name: workoutName,
              description: `Auto-generated for program (${program.id})`,
              duration: totalDuration,
              workout_type: focus.join(','),
            })
            .select()
            .single();
          if (workoutError) throw workoutError;
          // 5. Link drills
          for (let i = 0; i < drillsForDay.length; i++) {
            await supabase.from('workout_drills').insert({
              workout_id: workout.id,
              drill_id: drillsForDay[i].id,
              order_num: i + 1,
              duration: drillsForDay[i].duration,
            });
          }
          // 6. Link to program
          await supabase.from('program_workouts').insert({
            program_id: program.id,
            workout_id: workout.id,
            scheduled_date: workoutDate.toISOString().split('T')[0],
          });
          // 7. Add to calendar
          await supabase.from('calendar_events').insert({
            user_id: user.id,
            title: workoutName,
            description: `Program workout (${program.id})`,
            start_time: new Date(workoutDate.toISOString().split('T')[0] + 'T' + (time || '07:00') + ':00').toISOString(),
            end_time: new Date(workoutDate.getTime() + totalDuration * 1000).toISOString(),
            workout_id: workout.id,
          });
          scheduledWorkouts.push({ date: workoutDate, workout });
        }
        current.setDate(current.getDate() + 7);
      }
      Alert.alert('Program Created', 'Your program and schedule have been generated!');
      router.replace('/workouts');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create program.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Create Workout Program</Text>
        <Text style={styles.headerSubtitle}>
          Build a long-term, AI-powered basketball training plan
        </Text>
      </LinearGradient>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Program Length */}
        <Text style={styles.label}>Program Length (weeks)</Text>
        <View style={styles.row}>
          {PROGRAM_LENGTHS.map(w => (
            <TouchableOpacity
              key={w}
              style={[styles.chip, length === w && styles.chipActive]}
              onPress={() => setLength(w)}
            >
              <Text style={[styles.chipText, length === w && styles.chipTextActive]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Focus Areas */}
        <Text style={styles.label}>Areas of Focus</Text>
        <View style={styles.rowWrap}>
          {FOCUS_AREAS.map(area => (
            <TouchableOpacity
              key={area.id}
              style={[styles.chip, focus.includes(area.id) && styles.chipActive]}
              onPress={() => toggleFocus(area.id)}
            >
              <Text style={[styles.chipText, focus.includes(area.id) && styles.chipTextActive]}>{area.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Daily Duration */}
        <Text style={styles.label}>Daily Workout Duration (min)</Text>
        <View style={styles.row}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, duration === d && styles.chipActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Intensity */}
        <Text style={styles.label}>Intensity</Text>
        <View style={styles.row}>
          {INTENSITIES.map(i => (
            <TouchableOpacity
              key={i.id}
              style={[styles.chip, intensity === i.id && styles.chipActive]}
              onPress={() => setIntensity(i.id)}
            >
              <Text style={[styles.chipText, intensity === i.id && styles.chipTextActive]}>{i.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Workout Days */}
        <Text style={styles.label}>Workout Days</Text>
        <View style={styles.row}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[styles.chip, days.includes(day.id) && styles.chipActive]}
              onPress={() => toggleDay(day.id)}
            >
              <Text style={[styles.chipText, days.includes(day.id) && styles.chipTextActive]}>{day.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Preferred Time */}
        <Text style={styles.label}>Preferred Workout Time</Text>
        <View style={styles.rowWrap}>
          {TIMES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, time === t && styles.chipActive]}
              onPress={() => setTime(t)}
            >
              <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Creating...' : 'Create Program'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 16,
  },
  chipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 