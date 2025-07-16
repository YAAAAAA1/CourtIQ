import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Modal, TextInput, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { 
  ChevronRight, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Utensils, 
  Dumbbell,
  Target,
  BarChart3,
  Play,
  Bell,
  CheckCircle,
  Check,
  Medal
} from 'lucide-react-native';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import CircularProgress from '@/components/CircularProgress';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import theme from '@/constants/theme';
import { ScrollView as RNScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  profile_image_url: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface Workout {
  id: string;
  name: string;
  duration: number;
  created_at: string;
  workout_type: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  location: string;
}

const FOCUS_AREAS = [
  { id: 'shooting', label: 'Shooting' },
  { id: 'dribbling', label: 'Dribbling' },
  { id: 'passing', label: 'Passing' },
  { id: 'conditioning', label: 'Conditioning' },
  { id: 'recovery', label: 'Recovery' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [nutritionData, setNutritionData] = useState({ consumed: 0, goal: 2000 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaysWorkout, setTodaysWorkout] = useState<Workout | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [goalFocus, setGoalFocus] = useState<string[]>([]);
  const [goalProgress, setGoalProgress] = useState(0);
  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  // New state for health grade calculation
  const [todayMealsCount, setTodayMealsCount] = useState(0);
  const [todayCompletedWorkouts, setTodayCompletedWorkouts] = useState(0);
  const [todayCompletedDrills, setTodayCompletedDrills] = useState(0);
  const [calorieGoalReached, setCalorieGoalReached] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadTodayCompletionData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('name, profile_image_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title, progress')
        .eq('user_id', user.id)
        .eq('completed', false)
        .limit(3);

      if (goalsData) {
        setGoals(goalsData);
      }

      // Load recent workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, name, duration, created_at, workout_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (workoutsData) {
        setRecentWorkouts(workoutsData);
        // Set today's workout as the most recent one
        if (workoutsData.length > 0) {
          setTodaysWorkout(workoutsData[0]);
        }
      }

      // Load today's events
      const today = new Date().toISOString().split('T')[0];
      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, location')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`);

      if (eventsData) {
        setTodayEvents(eventsData);
      }

      // Load today's nutrition
      const { data: mealsData } = await supabase
        .from('meals')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', today);

      if (mealsData) {
        const totalCalories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
        setNutritionData(prev => ({ ...prev, consumed: totalCalories }));
      }

      // Load nutrition goal
      const { data: nutritionGoal } = await supabase
        .from('nutrition_goals')
        .select('daily_calories')
        .eq('user_id', user.id)
        .single();

      if (nutritionGoal) {
        setNutritionData(prev => ({ ...prev, goal: nutritionGoal.daily_calories }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // New: Load today's completed workouts and drills, and check calorie goal
  const loadTodayCompletionData = async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      // Completed workouts today
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`);
      setTodayCompletedWorkouts(workoutSessions ? workoutSessions.length : 0);
      // Completed drills today
      const { data: drillSessions } = await supabase
        .from('drill_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      setTodayCompletedDrills(drillSessions ? drillSessions.length : 0);
      // Calorie goal reached?
      setCalorieGoalReached(nutritionData.consumed >= nutritionData.goal && nutritionData.goal > 0);
    } catch (error) {
      setTodayCompletedWorkouts(0);
      setTodayCompletedDrills(0);
      setCalorieGoalReached(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await loadTodayCompletionData();
    setRefreshing(false);
  };

  // New health grade calculation
  const calculateHealthGrade = () => {
    let grade = 0;
    grade += todayMealsCount * 15;
    grade += todayCompletedWorkouts * 15;
    grade += todayCompletedDrills * 10;
    if (calorieGoalReached) grade += 25;
    if (grade > 100) grade = 100;
    return grade;
  };

  const toggleFocus = (id: string) => {
    setGoalFocus(goalFocus.includes(id) ? goalFocus.filter(f => f !== id) : [...goalFocus, id]);
  };

  const handleGoalSubmit = async () => {
    if (!goalTitle || !goalDate || goalFocus.length === 0 || !user) return;
    setSubmittingGoal(true);
    try {
      await supabase.from('goals').insert({
        user_id: user.id,
        title: goalTitle,
        target_date: goalDate.toISOString().split('T')[0],
        focus_areas: goalFocus,
        progress: goalProgress,
        completed: goalProgress === 100,
        created_at: new Date().toISOString(),
      });
      if (goalProgress === 100) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          setShowGoalModal(false);
        }, 2000);
      } else {
        setShowGoalModal(false);
      }
      setGoalTitle('');
      setGoalDate(new Date());
      setGoalFocus([]);
      setGoalProgress(0);
    } catch (err) {
      alert('Failed to create goal.');
    } finally {
      setSubmittingGoal(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const healthGrade = calculateHealthGrade();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(app)/settings')}>
            <Image
              source={{ uri: userProfile?.profile_image_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Good Day {userProfile?.name || user?.email?.split('@')[0] || 'Hooper'}</Text>
            <Text style={styles.subtitleText}>Your Daily Basketball Goals</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Health Grade Card */}
      <LinearGradient
        colors={['rgba(255, 107, 53, 0.15)', 'rgba(255, 107, 53, 0.05)'] as const}
        style={styles.healthGradeCard}
      >
        <View style={styles.healthGradeContent}>
          <View style={styles.healthGradeLeft}>
            <Text style={styles.healthGradeTitle}>Health Grade</Text>
            <Text style={styles.healthGradeSubtitle}>
              Perfect progress dude, keep{'\n'}going to apply your fitness{'\n'}activity
            </Text>
          </View>
          <View style={styles.healthGradeRight}>
            <CircularProgress
              size={100}
              strokeWidth={8}
              progress={healthGrade / 100}
              color={healthGrade === 100 ? colors.success : colors.primary}
              backgroundColor={colors.gray[800]}
            >
              <Text style={styles.healthGradePercentage}>{healthGrade}%</Text>
            </CircularProgress>
          </View>
        </View>
        
        <View style={styles.healthGradeActions}>
          <TouchableOpacity 
            style={styles.trackProgressButton}
            onPress={() => router.push('/(app)/analytics')}
          >
            <Text style={styles.trackProgressText}>Track Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.joinChallengeButton}
            onPress={() => router.push('/(app)/goals')}
          >
            <Text style={styles.joinChallengeText}>Join A Challenge</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions - now under health grade, smaller cards */}
      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, marginBottom: 24 }}
        style={{ marginTop: 0, marginBottom: 0 }}
      >
        <TouchableOpacity 
          style={styles.quickActionCardSmall}
          onPress={() => router.push('/workouts-new' as any)}
          activeOpacity={0.7}
          pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.quickActionGradientSmall}
          >
            <Dumbbell size={24} color="white" />
            <Text style={styles.quickActionTitleSmall}>Create Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionCardSmall}
          onPress={() => router.push('/drills-library' as any)}
          activeOpacity={0.7}
          pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <LinearGradient
            colors={[colors.warning, colors.warningLight]}
            style={styles.quickActionGradientSmall}
          >
            <Target size={24} color="white" />
            <Text style={styles.quickActionTitleSmall}>Drills</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionCardSmall}
          onPress={() => router.push('/goals' as any)}
          activeOpacity={0.7}
          pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <LinearGradient
            colors={[colors.info, colors.infoLight]}
            style={styles.quickActionGradientSmall}
          >
            <Medal size={24} color="white" />
            <Text style={styles.quickActionTitleSmall}>Goals</Text>
          </LinearGradient>
        </TouchableOpacity>
        {todaysWorkout && (
          <TouchableOpacity 
            style={styles.quickActionCardSmall}
            onPress={() => router.push(`/workout-execution?workoutId=${todaysWorkout.id}` as any)}
            activeOpacity={0.7}
            pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <LinearGradient
              colors={[colors.success, colors.successLight]}
              style={styles.quickActionGradientSmall}
            >
              <Play size={24} color="white" />
              <Text style={styles.quickActionTitleSmall}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.quickActionCardSmall, { marginRight: 24 }]}
          onPress={() => router.push('/calendar' as any)}
          activeOpacity={0.7}
          pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <LinearGradient
            colors={[colors.info, colors.infoLight]}
            style={styles.quickActionGradientSmall}
          >
            <CalendarIcon size={24} color="white" />
            <Text style={styles.quickActionTitleSmall}>Schedule</Text>
          </LinearGradient>
        </TouchableOpacity>
      </RNScrollView>

      {/* Activity Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activity Overview:</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/analytics')}>
          <Text style={styles.seeAllText}>See all <ChevronRight size={16} color={colors.primary} /></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityOverview}>
        <View style={styles.activityCard}>
          <Text style={styles.activityLabel}>Workouts:</Text>
          <CircularProgress
            size={80}
            strokeWidth={6}
            progress={recentWorkouts.length / 7}
            color={colors.card.workout}
            backgroundColor={colors.gray[800]}
            showPercentage={false}
          >
            <Text style={styles.activityValue}>{recentWorkouts.length}</Text>
            <Text style={styles.activityUnit}>This Week</Text>
          </CircularProgress>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityLabel}>Calories Consumed:</Text>
          <CircularProgress
            size={80}
            strokeWidth={6}
            progress={nutritionData.consumed / nutritionData.goal}
            color={colors.card.nutrition}
            backgroundColor={colors.gray[800]}
            showPercentage={false}
          >
            <Text style={styles.activityValue}>{nutritionData.consumed}</Text>
            <Text style={styles.activityUnit}>kcal</Text>
          </CircularProgress>
        </View>
      </View>

      {/* Today's Workout */}
      {todaysWorkout && (
        <>
          <Text style={styles.sectionTitle}>Workout Plan:</Text>
          <TouchableOpacity 
            style={styles.todaysWorkoutCard}
            onPress={() => router.push('/(app)/workouts')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.workoutCardImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.8)'] as const}
              style={styles.workoutCardOverlay}
            />
            <View style={styles.workoutCardContent}>
              <Text style={styles.workoutCardLabel}>Today's Workout:</Text>
              <Text style={styles.workoutCardTitle}>{todaysWorkout.name}</Text>
              <View style={styles.workoutCardDuration}>
                <Text style={styles.workoutCardTime}>{Math.round(todaysWorkout.duration / 60)}</Text>
                <Text style={styles.workoutCardTimeUnit}>Min</Text>
              </View>
              <TouchableOpacity 
                style={styles.startNowButton}
                onPress={() => router.push('/(app)/workouts')}
              >
                <Text style={styles.startNowText}>Start Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Recent Activity */}
      {recentWorkouts.length > 0 && (
        <Card title="Recent Activity" variant="elevated">
          {recentWorkouts.slice(0, 3).map((workout) => (
            <View key={workout.id} style={styles.workoutItem}>
              <View style={styles.workoutIconContainer}>
                <Dumbbell size={20} color={colors.text} />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutTime}>
                  {Math.round(workout.duration / 60)} min • {new Date(workout.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓</Text>
              </View>
            </View>
          ))}
          <Button
            title="View All Workouts"
            variant="text"
            onPress={() => router.push('/(app)/workouts')}
            rightIcon={<ChevronRight size={16} color={colors.primary} />}
            style={styles.viewAllButton}
          />
        </Card>
      )}

      {/* Today's Schedule */}
      {todayEvents.length > 0 && (
        <Card title="Today's Schedule" variant="elevated">
          {todayEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventTime}>
                <Text style={styles.eventTimeText}>
                  {new Date(event.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            </View>
          ))}
          <Button
            title="View Calendar"
            variant="text"
            onPress={() => router.push('/(app)/calender')}
            rightIcon={<ChevronRight size={16} color={colors.primary} />}
            style={styles.viewAllButton}
          />
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && recentWorkouts.length === 0 && todayEvents.length === 0 && (
        <Card title="Get Started" variant="gradient" gradientColors={colors.primaryGradient}>
          <Text style={styles.emptyStateText}>Welcome to HoopMaster AI! 🏀</Text>
          <Text style={styles.emptyStateSubtext}>Start your basketball journey today</Text>
          
          <View style={styles.emptyStateActions}>
            <Button
              title="Set Your First Goal"
              variant="secondary"
              onPress={() => router.push('/(app)/goals')}
              style={styles.emptyStateButton}
              leftIcon={<Target size={20} color={colors.text} />}
            />
            <Button
              title="Explore Workouts"
              variant="secondary"
              onPress={() => router.push('/(app)/workouts')}
              style={styles.emptyStateButton}
              leftIcon={<Dumbbell size={20} color={colors.text} />}
            />
          </View>
        </Card>
      )}
      {/* Create Goals Button */}
      <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingVertical: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => setShowGoalModal(true)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>+ Create Goal</Text>
        </TouchableOpacity>
      </View>
      {/* Goal Creation Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Create a Goal</Text>
            {/* Title */}
            <TextInput
              placeholder="Goal Title"
              value={goalTitle}
              onChangeText={setGoalTitle}
              style={{ borderWidth: 1, borderColor: colors.gray[400], borderRadius: 10, padding: 10, marginBottom: 16, fontSize: 16 }}
            />
            {/* Date Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: colors.primary }}>
                Target Date: {goalDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={goalDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: any, date?: Date) => {
                  setShowDatePicker(false);
                  if (date) setGoalDate(date);
                }}
                minimumDate={new Date()}
              />
            )}
            {/* Focus Areas */}
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Areas of Focus</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {FOCUS_AREAS.map(area => (
                <TouchableOpacity
                  key={area.id}
                  style={{
                    backgroundColor: goalFocus.includes(area.id) ? colors.primary : colors.backgroundCard,
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => toggleFocus(area.id)}
                >
                  <Text style={{ color: goalFocus.includes(area.id) ? 'white' : colors.text }}>{area.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Progress Slider */}
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Progress: {goalProgress}%</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={goalProgress}
                  onValueChange={setGoalProgress}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.gray[300]}
                  thumbTintColor={colors.primary}
                />
              </View>
              <Text style={{ width: 40, textAlign: 'center', fontWeight: 'bold' }}>{goalProgress}</Text>
            </View>
            {/* Submit Button */}
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 8, opacity: submittingGoal ? 0.6 : 1 }}
              onPress={handleGoalSubmit}
              disabled={submittingGoal || !goalTitle || !goalDate || goalFocus.length === 0}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{submittingGoal ? 'Saving...' : 'Save Goal'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.gray[300], borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setShowGoalModal(false)}
              disabled={submittingGoal}
            >
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            {/* Celebration */}
            {showCelebration && (
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <CheckCircle size={48} color={colors.success} />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.success, marginTop: 8 }}>Congratulations!</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Goal Completed!</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.medium,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xxxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    marginRight: theme.spacing.m,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  healthGradeCard: {
    marginHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.large,
  },
  healthGradeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  healthGradeLeft: {
    flex: 1,
  },
  healthGradeTitle: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  healthGradeSubtitle: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.fontSizes.m,
  },
  healthGradeRight: {
    alignItems: 'center',
  },
  healthGradePercentage: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
  },
  healthGradeActions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  trackProgressButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    ...theme.shadows.colored,
  },
  trackProgressText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  joinChallengeButton: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  joinChallengeText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityOverview: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  activityCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  activityLabel: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  activityValue: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
  },
  activityUnit: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  todaysWorkoutCard: {
    marginHorizontal: theme.spacing.l,
    height: 200,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.large,
  },
  workoutCardImage: {
    width: '100%',
    height: '100%',
  },
  workoutCardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  workoutCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  workoutCardLabel: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
    opacity: 0.9,
  },
  workoutCardTitle: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  workoutCardDuration: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.l,
  },
  workoutCardTime: {
    fontSize: theme.typography.fontSizes.hero,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
  },
  workoutCardTimeUnit: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.text,
    marginLeft: theme.spacing.s,
  },
  startNowButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.colored,
  },
  startNowText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.bold,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradient: {
    padding: theme.spacing.l,
    alignItems: 'center',
    minHeight: 120, // Increased height for better touch area
    justifyContent: 'space-between',
  },
  quickActionText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    marginTop: theme.spacing.s,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  workoutTime: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.bold,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  eventTime: {
    width: 80,
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  eventTimeText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  viewAllButton: {
    marginTop: theme.spacing.m,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: theme.spacing.xl,
  },
  emptyStateActions: {
    gap: theme.spacing.m,
  },
  emptyStateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },
  quickActionCard: {
    width: '48%', // Adjust as needed for 2 columns
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: 'white',
    textAlign: 'center',
    marginTop: theme.spacing.s,
  },
  quickActionSubtitle: {
    fontSize: theme.typography.fontSizes.s,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  quickActionCardSmall: {
    width: 110, // Fixed width for better horizontal scrolling
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  quickActionGradientSmall: {
    padding: theme.spacing.s,
    alignItems: 'center',
    minHeight: 80, // Reduced height for smaller cards
    justifyContent: 'space-between',
  },
  quickActionTitleSmall: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: 'white',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  quickActionCardLarge: {
    width: '48%', // Adjust as needed for 2 columns
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradientLarge: {
    padding: theme.spacing.l,
    alignItems: 'center',
    minHeight: 120, // Increased height for better touch area
    justifyContent: 'space-between',
  },
});