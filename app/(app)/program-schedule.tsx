import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { drills as allDrills } from '@/constants/drills';
import colors from '@/constants/colors';

export default function ProgramScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchSchedule = async () => {
      setLoading(true);
      // 1. Get active program
      const { data: prog } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!prog) {
        setLoading(false);
        return;
      }
      setProgram(prog);
      // 2. Get all program workouts
      const { data: progWorkouts } = await supabase
        .from('program_workouts')
        .select('*,workouts(*)')
        .eq('program_id', prog.id)
        .order('scheduled_date', { ascending: true });
      if (!progWorkouts) {
        setLoading(false);
        return;
      }
      // 3. For each workout, get drills
      const workoutsWithDrills = await Promise.all(
        progWorkouts.map(async (pw: any) => {
          const { data: workoutDrills } = await supabase
            .from('workout_drills')
            .select('*')
            .eq('workout_id', pw.workout_id)
            .order('order_num', { ascending: true });
          const drills = workoutDrills
            ? workoutDrills.map(wd => allDrills.find(d => d.id === wd.drill_id)).filter(Boolean)
            : [];
          return { ...pw, drills };
        })
      );
      setWorkouts(workoutsWithDrills);
      setLoading(false);
    };
    fetchSchedule();
  }, [user]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!program) {
    return <View style={styles.center}><Text style={styles.noProgram}>No active program found.</Text></View>;
  }
  // Group workouts by week
  const weeks: { [week: number]: any[] } = {};
  workouts.forEach(w => {
    const start = new Date(program.start_date);
    const date = new Date(w.scheduled_date);
    const weekNum = Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    if (!weeks[weekNum]) weeks[weekNum] = [];
    weeks[weekNum].push(w);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Program Schedule</Text>
      {Object.keys(weeks).map(weekNum => (
        <View key={weekNum} style={styles.weekSection}>
          <Text style={styles.weekTitle}>Week {weekNum}</Text>
          {weeks[weekNum].map(w => (
            <View key={w.workout_id} style={styles.workoutCard}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.workoutName}>{w.workouts?.name || 'Workout'}</Text>
                <Text style={styles.workoutDate}>{w.scheduled_date} • {Math.round((w.workouts?.duration || 0) / 60)} min</Text>
              </TouchableOpacity>
              <Text style={styles.drillsLabel}>Drills:</Text>
              {w.drills.length === 0 && (
                <Text style={styles.noDrills}>No drills</Text>
              )}
              {w.drills.map(drill => (
                <TouchableOpacity
                  key={drill.id}
                  onPress={() => router.push(`/drills-library?drillId=${drill.id}`)}
                  style={styles.drillItem}
                >
                  <Text style={styles.drillName}>{drill.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  weekSection: {
    marginBottom: 32,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  workoutDate: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  drillsLabel: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  noDrills: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  drillItem: {
    paddingVertical: 4,
  },
  drillName: {
    color: colors.primary,
    fontSize: 15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  noProgram: {
    color: colors.textSecondary,
    fontSize: 18,
  },
}); 