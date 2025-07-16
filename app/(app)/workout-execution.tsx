import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, SkipForward, X, Clock, Droplets, ChevronLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface WorkoutDrill {
  id: string;
  drill_id: string;
  duration: number;
  order_num: number;
  drill?: {
    name: string;
    description: string;
    instructions: string;
    equipment: string[];
  };
}

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  workout_type: string;
  created_at: string;
}

export default function WorkoutExecutionScreen() {
  const { workoutId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutDrills, setWorkoutDrills] = useState<WorkoutDrill[]>([]);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isWaterBreak, setIsWaterBreak] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState(0); // seconds remaining
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const countdownAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  useEffect(() => {
    if (workoutDrills.length > 0) {
      const total = workoutDrills.reduce((sum, drill) => sum + drill.duration, 0);
      setTotalDuration(total);
      setTimeRemaining(workoutDrills[0]?.duration || 0);
    }
  }, [workoutDrills]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            nextDrill();
            return 0;
          }
          return time - 1;
        });
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setIsActive(true);
    }
  }, [showCountdown, countdown]);

  useEffect(() => {
    async function fetchWorkout() {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      if (data) {
        setWorkout(data);
        setTimer(data.duration); // duration in seconds
      }
    }
    fetchWorkout();
  }, [workoutId]);

  useEffect(() => {
    if (isRunning && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && isRunning) {
      handleEndWorkout();
    }
    return () => clearTimeout(timerRef.current!);
  }, [isRunning, timer]);

  const loadWorkout = async () => {
    try {
      // Load workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) throw workoutError;
      setWorkout(workoutData);

      // Load workout drills with drill details
      const { data: drillsData, error: drillsError } = await supabase
        .from('workout_drills')
        .select(`
          *,
          drill:drills(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_num');

      if (drillsError) throw drillsError;
      setWorkoutDrills(drillsData || []);
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    }
  };

  const startWorkout = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const nextDrill = () => {
    if (currentDrillIndex < workoutDrills.length - 1) {
      const nextIndex = currentDrillIndex + 1;
      setCurrentDrillIndex(nextIndex);
      setTimeRemaining(workoutDrills[nextIndex].duration);
      
      // Add water break every 3 drills
      if ((nextIndex + 1) % 3 === 0) {
        setIsWaterBreak(true);
        setTimeRemaining(60); // 1 minute water break
      } else {
        setIsWaterBreak(false);
      }
    } else {
      // Workout complete
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    try {
      // Save workout session
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user?.id,
          workout_id: workoutId,
          start_time: new Date(Date.now() - (elapsedTime * 1000)).toISOString(),
          end_time: new Date().toISOString(),
          completed: true,
        });

      if (error) throw error;

      Alert.alert(
        'Workout Complete!',
        'Great job! Your workout has been completed and saved.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to save workout session');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipDrill = () => {
    nextDrill();
  };

  const handleStartWorkout = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handleEndWorkout = async () => {
    setIsRunning(false);
    clearTimeout(timerRef.current!);
    const endTime = new Date();
    let actualDuration = 0;
    if (startTime) {
      actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // in minutes
    }
    // Save session to DB
    await supabase.from('workout_sessions').insert({
      user_id: user.id,
      workout_id: workoutId,
      start_time: startTime?.toISOString(),
      end_time: endTime.toISOString(),
      completed: true,
      actual_duration: actualDuration,
    });
    // Navigate to summary or home
    router.replace('WorkoutSummary', { workoutId, actualDuration });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (totalDuration === 0) return 0;
    return (elapsedTime / totalDuration) * 100;
  };

  const getCurrentDrillProgress = () => {
    if (!workoutDrills[currentDrillIndex]) return 0;
    const drillDuration = workoutDrills[currentDrillIndex].duration;
    const remaining = timeRemaining;
    return ((drillDuration - remaining) / drillDuration) * 100;
  };

  const currentDrill = workoutDrills[currentDrillIndex];
  const allEquipment = workoutDrills
    .flatMap(drill => drill.drill?.equipment || [])
    .filter((equipment, index, array) => array.indexOf(equipment) === index);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.name}</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentDrillIndex + 1} of {workoutDrills.length} drills
        </Text>
      </View>

      {showCountdown ? (
        /* Countdown Screen */
        <View style={styles.countdownContainer}>
          <Animated.Text style={[styles.countdownText, { transform: [{ scale: countdownAnimation }] }]}>
            {countdown}
          </Animated.Text>
          <Text style={styles.countdownSubtext}>Get Ready!</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Drill Info */}
          <View style={styles.drillInfoContainer}>
            <Text style={styles.drillTitle}>
              {isWaterBreak ? 'Water Break' : currentDrill?.drill?.name || 'Drill'}
            </Text>
            <Text style={styles.drillDescription}>
              {isWaterBreak 
                ? 'Take a moment to hydrate and prepare for the next drill.'
                : currentDrill?.drill?.description || 'Drill description'
              }
            </Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              {isWaterBreak && <Droplets size={32} color={colors.info} style={styles.waterIcon} />}
            </View>
            
            {/* Drill Progress Bar */}
            <View style={styles.drillProgressContainer}>
              <View style={styles.drillProgressBar}>
                <Animated.View
                  style={[
                    styles.drillProgressFill,
                    {
                      width: `${getCurrentDrillProgress()}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={skipDrill}
            >
              <SkipForward size={24} color="white" />
              <Text style={styles.controlButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={isActive ? togglePause : startWorkout}
            >
              {isActive ? (
                isPaused ? (
                  <>
                    <Play size={32} color="white" />
                    <Text style={styles.controlButtonText}>Resume</Text>
                  </>
                ) : (
                  <>
                    <Pause size={32} color="white" />
                    <Text style={styles.controlButtonText}>Pause</Text>
                  </>
                )
              ) : (
                <>
                  <Play size={32} color="white" />
                  <Text style={styles.controlButtonText}>Start</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Equipment Needed */}
          {!isWaterBreak && (
            <View style={styles.equipmentContainer}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <View style={styles.equipmentList}>
                {allEquipment.map((equipment, index) => (
                  <View key={index} style={styles.equipmentItem}>
                    <Text style={styles.equipmentText}>{equipment}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {!isWaterBreak && currentDrill?.drill?.instructions && (
            <View style={styles.instructionCard}>
              <Text style={styles.sectionTitle}>How to Do This Drill</Text>
              <Text style={styles.instructionsText}>
                {currentDrill.drill.instructions}
              </Text>
            </View>
          )}

          {/* Upcoming Drills */}
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming Drills</Text>
            {workoutDrills.slice(currentDrillIndex + 1, currentDrillIndex + 4).map((drill, index) => (
              <View key={index} style={styles.upcomingDrill}>
                <Text style={styles.upcomingDrillName}>
                  {drill.drill?.name || 'Drill'}
                </Text>
                <Text style={styles.upcomingDrillDuration}>
                  {formatTime(drill.duration)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.backgroundCard,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[700],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: colors.primary,
  },
  countdownSubtext: {
    fontSize: 24,
    color: colors.gray[600],
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  drillInfoContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drillTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  drillDescription: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  waterIcon: {
    position: 'absolute',
    bottom: 20,
  },
  drillProgressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  drillProgressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  drillProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: colors.gray[500],
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  equipmentContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  instructionsContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsText: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 24,
  },
  instructionCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingDrill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  upcomingDrillName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  upcomingDrillDuration: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 50,
  },
  upcomingDrillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
}); 