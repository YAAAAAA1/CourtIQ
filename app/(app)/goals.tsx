import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import colors from '@/constants/colors';
import { CheckCircle, Medal } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

const MEDALS = [
  { color: '#cd7f32', label: 'Bronze' },
  { color: '#cd7f32', label: 'Bronze' },
  { color: '#cd7f32', label: 'Bronze' },
  { color: '#c0c0c0', label: 'Silver' },
  { color: '#c0c0c0', label: 'Silver' },
  { color: '#c0c0c0', label: 'Silver' },
  { color: '#ffd700', label: 'Gold' },
  { color: '#ffd700', label: 'Gold' },
  { color: '#ffd700', label: 'Gold' },
  { color: '#b9f2ff', label: 'Diamond' },
  { color: '#b9f2ff', label: 'Diamond' },
  { color: '#50c878', label: 'Emerald' },
  { color: '#50c878', label: 'Emerald' },
  { color: '#50c878', label: 'Emerald' },
  { color: '#50c878', label: 'Emerald' },
];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ [id: string]: number }>({});
  const [celebrating, setCelebrating] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setGoals(data || []);
      setLoading(false);
    };
    fetchGoals();
  }, [user]);

  const handleProgressChange = (goalId: string, value: number) => {
    setEditing(prev => ({ ...prev, [goalId]: value }));
  };

  const handleSaveProgress = async (goal: any) => {
    const newProgress = editing[goal.id] ?? goal.progress;
    const completed = newProgress === 100;
    await supabase.from('goals').update({ progress: newProgress, completed }).eq('id', goal.id);
    setGoals(goals => goals.map(g => g.id === goal.id ? { ...g, progress: newProgress, completed } : g));
    setEditing(prev => ({ ...prev, [goal.id]: undefined }));
    if (completed && !goal.completed) {
      setCelebrating(prev => ({ ...prev, [goal.id]: true }));
      setTimeout(() => setCelebrating(prev => ({ ...prev, [goal.id]: false })), 2000);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Your Goals</Text>
      {/* Medals Row */}
      <View style={styles.medalsRow}>
        {MEDALS.map((medal, idx) => (
          <View key={idx} style={styles.medalContainer}>
            <Medal size={32} color={idx < completedCount ? medal.color : colors.gray[400]} fill={idx < completedCount ? medal.color : 'none'} />
          </View>
        ))}
      </View>
      <Text style={styles.medalsLabel}>{completedCount} / 15 Goals Completed</Text>
      {/* Goals List */}
      <View style={{ marginTop: 24 }}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : goals.length === 0 ? (
          <Text style={styles.emptyText}>No goals yet. Create one from the Home screen!</Text>
        ) : (
          goals.map(goal => {
            const progress = editing[goal.id] ?? goal.progress ?? 0;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  {goal.completed && <CheckCircle size={20} color={colors.success} style={{ marginLeft: 8 }} />}
                </View>
                <Text style={styles.goalMeta}>Target: {goal.target_date}</Text>
                <Text style={styles.goalMeta}>Focus: {goal.focus_areas?.join(', ')}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress || 0}%` }]} />
                </View>
                <Text style={styles.goalProgress}>{progress || 0}%</Text>
                {/* Progress Slider */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Slider
                      minimumValue={0}
                      maximumValue={100}
                      step={1}
                      value={progress}
                      onValueChange={value => handleProgressChange(goal.id, value)}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.gray[300]}
                      thumbTintColor={colors.primary}
                    />
                  </View>
                  <Text style={{ width: 40, textAlign: 'center', fontWeight: 'bold' }}>{progress}</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 8, alignItems: 'center', marginTop: 8, opacity: goal.progress === progress ? 0.5 : 1 }}
                  onPress={() => handleSaveProgress(goal)}
                  disabled={goal.progress === progress}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Save Progress</Text>
                </TouchableOpacity>
                {/* Celebration */}
                {celebrating[goal.id] && (
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <CheckCircle size={36} color={colors.success} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.success, marginTop: 6 }}>Congratulations!</Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Goal Completed!</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  medalsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  medalContainer: {
    marginHorizontal: 2,
    marginVertical: 2,
  },
  medalsLabel: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  goalCard: {
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
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalMeta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.gray[300],
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalProgress: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
