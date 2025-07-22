import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Calendar, ChevronDown } from 'lucide-react-native';
import MuscleHeatmap from '@/components/MuscleHeatmap.js';
import { drills as ALL_DRILLS } from '@/constants/drills.js';
import { useAuth } from '@/hooks/useAuth.js';
import { supabase } from '@/lib/supabase.js';
import Card from '@/components/Card.js';
import colors from '@/constants/colors.js';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: colors.secondaryLight,
  backgroundGradientTo: colors.secondaryLight,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary,
  },
};

const pieChartColors = [colors.primary, '#CE93D8', '#90CAF9', '#FFE082', '#A5D6A7'];

// Map drill muscle group names to SVG path IDs
const MUSCLE_GROUP_TO_SVG: Record<string, string[]> = {
  Chest: ['chest'],
  Abs: ['abs'],
  Obliques: ['obliques'],
  Biceps: ['biceps_left', 'biceps_right'],
  Triceps: ['triceps_left', 'triceps_right'],
  Deltoids: ['deltoid_left', 'deltoid_right', 'shoulder_left', 'shoulder_right'],
  Shoulders: ['deltoid_left', 'deltoid_right', 'shoulder_left', 'shoulder_right'],
  Forearms: ['forearm_left', 'forearm_right'],
  Quadriceps: ['quads_left', 'quads_right'],
  Hamstrings: ['hamstrings_left', 'hamstrings_right'],
  Calves: ['calves_left', 'calves_right'],
  Glutes: ['glutes'],
  Trapezius: ['traps'],
  Back: ['lats_left', 'lats_right'],
  Lats: ['lats_left', 'lats_right'],
};

function aggregateMuscleScores(drillIds: string[]): Record<string, number> {
  const drillMap = Object.fromEntries(ALL_DRILLS.map(d => [d.id, d]));
  const muscleCounts: Record<string, number> = {};
  for (const drillId of drillIds) {
    const drill = drillMap[drillId];
    if (drill && drill.muscle_groups) {
      for (const mg of drill.muscle_groups) {
        const svgIds = MUSCLE_GROUP_TO_SVG[mg] || [];
        for (const svgId of svgIds) {
          muscleCounts[svgId] = (muscleCounts[svgId] || 0) + 1;
        }
      }
    }
  }
  return muscleCounts;
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [workoutTypeData, setWorkoutTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [muscleScores, setMuscleScores] = useState({});
  const [totalWorkoutMinutes, setTotalWorkoutMinutes] = useState(0);
  const [totalDrillMinutes, setTotalDrillMinutes] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadAnalyticsData();
    }, [timeRange, user?.id])
  );

  const loadAnalyticsData = async () => {
    if (!user?.id) return;

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      // Load nutrition data
      const { data: mealsData } = await supabase
        .from('meals')
        .select('calories, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (mealsData && mealsData.length > 0) {
        const dailyCalories = processNutritionData(mealsData, startDate, endDate);
        setNutritionData(dailyCalories);
      } else {
        setNutritionData(null);
      }

      // Load workout session data for actual completed minutes
      const { data: sessionsData } = await supabase
        .from('workout_sessions')
        .select('actual_duration, start_time, workout_id, end_time')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      // Group by day and sum minutes
      const dayMap: { [key: string]: number } = {};
      const completedWorkoutIds: string[] = [];
      
      if (sessionsData && sessionsData.length > 0) {
        sessionsData.forEach((session: any) => {
          const day = session.start_time.split('T')[0];
          if (!dayMap[day]) dayMap[day] = 0;
          
          // Calculate duration - use actual_duration if available, otherwise calculate from start/end times
          let duration = session.actual_duration || 0;
          if (!duration && session.start_time && session.end_time) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
          }
          
          dayMap[day] += duration;
          if (session.workout_id) {
            completedWorkoutIds.push(session.workout_id);
          }
        });
      }

      // Build chart data for last 7/30/365 days
      const labels = [];
      const data = [];
      let totalMinutes = 0;
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayMinutes = Math.round((dayMap[dateStr] || 0) / 60);
        data.push(dayMinutes);
        totalMinutes += dayMinutes;
      }
      setWorkoutData({
        labels: labels.slice(-7), // Show last 7 days
        datasets: [{ data: data.slice(-7) }],
      });
      setTotalWorkoutMinutes(totalMinutes);

      // Load drill data from completed workouts for muscle scores
      if (completedWorkoutIds.length > 0) {
        const { data: workoutDrillsData } = await supabase
          .from('workout_drills')
          .select('drill_id')
          .in('workout_id', completedWorkoutIds);

        if (workoutDrillsData && workoutDrillsData.length > 0) {
          const drillIds = workoutDrillsData.map((wd: { drill_id: string }) => wd.drill_id);
          const muscleScores = aggregateMuscleScores(drillIds);
          setMuscleScores(muscleScores);
        }
      }

      // Also load individual drill sessions (where workout_type is 'drill')
      // First get workouts that are drill-type
      const { data: drillWorkouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('workout_type', 'drill');

      if (drillWorkouts && drillWorkouts.length > 0) {
        const drillWorkoutIds = drillWorkouts.map((w: { id: string }) => w.id);
        
        // Get workout sessions for these drill workouts
        const { data: drillSessionsData } = await supabase
          .from('workout_sessions')
          .select('workout_id')
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('workout_id', drillWorkoutIds)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString());

        if (drillSessionsData && drillSessionsData.length > 0) {
          const completedDrillWorkoutIds = drillSessionsData.map((session: { workout_id: string }) => session.workout_id);
          
          // Get the drill IDs from these individual drill workouts
          const { data: individualDrillData } = await supabase
            .from('workout_drills')
            .select('drill_id')
            .in('workout_id', completedDrillWorkoutIds);

          if (individualDrillData && individualDrillData.length > 0) {
            const individualDrillIds = individualDrillData.map((wd: { drill_id: string }) => wd.drill_id);
            
            // Combine with existing muscle scores
            const existingScores = muscleScores || {};
            const individualScores = aggregateMuscleScores(individualDrillIds);
            
            // Merge the scores
            const combinedScores: Record<string, number> = { ...existingScores };
            Object.entries(individualScores).forEach(([muscle, count]) => {
              combinedScores[muscle] = (combinedScores[muscle] || 0) + count;
            });
            
            setMuscleScores(combinedScores);
          }
        }
      }

      // Load workout data for type distribution
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('duration, workout_type, created_at')
        .eq('user_id', user.id)
        .neq('workout_type', 'deleted')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (workoutsData && workoutsData.length > 0) {
        const dailyWorkouts = processWorkoutData(workoutsData, startDate, endDate);
        const typeDistribution = processWorkoutTypeData(workoutsData);
        setWorkoutTypeData(typeDistribution);
      } else {
        setWorkoutTypeData([]);
      }

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processNutritionData = (meals: any[], startDate: Date, endDate: Date) => {
    const labels = [];
    const data = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = meals.filter(meal => meal.date === dateStr);
      const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(totalCalories);
    }

    return {
      labels: labels.slice(-7), // Show last 7 days
      datasets: [{ data: data.slice(-7) }],
    };
  };

  const processWorkoutData = (workouts: any[], startDate: Date, endDate: Date) => {
    const labels = [];
    const data = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(workout => 
        workout.created_at.split('T')[0] === dateStr
      );
      const totalDuration = dayWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(totalDuration);
    }

    return {
      labels: labels.slice(-7), // Show last 7 days
      datasets: [{ data: data.slice(-7) }],
    };
  };

  const processWorkoutTypeData = (workouts: any[]) => {
    const typeCounts: { [key: string]: number } = {};
    
    workouts.forEach(workout => {
      typeCounts[workout.workout_type] = (typeCounts[workout.workout_type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count], index) => ({
      name: type,
      population: count,
      color: pieChartColors[index % pieChartColors.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  };

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={styles.timeRangeButton}
            onPress={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <Text style={styles.timeRangeText}>
              {timeRangeOptions.find(option => option.value === timeRange)?.label}
            </Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          
          {showTimeRangeDropdown && (
            <View style={styles.timeRangeDropdown}>
              {timeRangeOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.timeRangeOption}
                  onPress={() => {
                    setTimeRange(option.value);
                    setShowTimeRangeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeRangeOptionText,
                      timeRange === option.value && styles.timeRangeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {nutritionData ? (
        <Card title="Nutrition" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Daily Calories</Text>
          </View>
          <LineChart
            data={nutritionData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.chartStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(nutritionData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / nutritionData.datasets[0].data.length)}
              </Text>
              <Text style={styles.statLabel}>Avg. Daily</Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card title="Nutrition" style={styles.chartCard}>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>No nutrition data available</Text>
            <Text style={styles.emptyChartSubtext}>Start logging meals to see your nutrition analytics</Text>
          </View>
        </Card>
      )}

      {workoutData ? (
        <Card title="Workout Duration" style={styles.chartCard}>
          {(() => {
            // Dynamically determine Y-axis max and segments
            const allData = workoutData.datasets[0].data;
            const maxValue = Math.max(120, ...allData);
            const roundedMax = Math.ceil(maxValue / 10) * 10;
            const segments = roundedMax / 10;
            return (
              <BarChart
                data={workoutData}
                width={screenWidth - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix="min"
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 107, 0, ${opacity})`,
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
                segments={segments}
              />
            );
          })()}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Total Training Minutes</Text>
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: 'bold', marginTop: 4 }}>{totalWorkoutMinutes}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
              (Workouts + Drills)
            </Text>
          </View>
        </Card>
      ) : (
        <Card title="Workout Duration" style={styles.chartCard}>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>No training data available</Text>
            <Text style={styles.emptyChartSubtext}>Complete workouts or drills to see your training analytics</Text>
          </View>
        </Card>
      )}

      {workoutTypeData.length > 0 ? (
        <Card title="Workout Types" style={styles.chartCard}>
          <PieChart
            data={workoutTypeData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      ) : (
        <Card title="Workout Types" style={styles.chartCard}>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>No workout type data available</Text>
            <Text style={styles.emptyChartSubtext}>Create and complete workouts to see type distribution</Text>
          </View>
        </Card>
      )}

      <View style={{ marginVertical: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>Muscle Activation Map</Text>
        <MuscleHeatmap muscleScores={muscleScores} />
      </View>

      <Card title="Get Started" style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconContainer}>
            <Calendar size={24} color={colors.text} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Track Your Progress</Text>
            <Text style={styles.summaryValue}>Start logging meals and completing workouts to see detailed analytics</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  timeRangeContainer: {
    position: 'relative',
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeRangeText: {
    color: colors.text,
    marginRight: 8,
  },
  timeRangeDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.secondaryDark,
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    width: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  timeRangeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timeRangeOptionText: {
    color: colors.text,
  },
  timeRangeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  chartCard: {
    marginBottom: 24,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});