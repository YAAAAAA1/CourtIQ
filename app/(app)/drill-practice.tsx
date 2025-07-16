import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, Animated, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, ChevronLeft, Clock, Target, Lightbulb } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { drills, Drill } from '@/constants/drills';
import colors from '@/constants/colors';
import theme from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function DrillPracticeScreen() {
  const { drillId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [drill, setDrill] = useState<Drill | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [prePauseTime, setPrePauseTime] = useState<number | null>(null);
  const [showSetTimerModal, setShowSetTimerModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const countdownAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDrill();
  }, [drillId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            completeDrill();
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
    // Add navigation event listener for leaving the screen
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isPaused) {
        e.preventDefault();
        Alert.alert(
          'Save Progress?',
          'Do you want to save your current timer progress?',
          [
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                // Reset timer to pre-pause value
                if (prePauseTime !== null) {
                  setTimeRemaining(prePauseTime);
                  setElapsedTime((drill?.duration || 0) - prePauseTime);
                }
                setIsPaused(false);
                navigation.dispatch(e.data.action);
              },
            },
            {
              text: 'Save',
              style: 'default',
              onPress: () => {
                setIsPaused(false);
                navigation.dispatch(e.data.action);
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    });
    return unsubscribe;
  }, [isPaused, prePauseTime, drill, navigation]);

  const loadDrill = () => {
    const foundDrill = drills.find(d => d.id === drillId);
    if (foundDrill) {
      setDrill(foundDrill);
      setTimeRemaining(foundDrill.duration);
    } else {
      Alert.alert('Error', 'Drill not found');
      router.back();
    }
  };

  const startDrill = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const completeDrill = () => {
    Alert.alert(
      'Drill Complete!',
      'Great job! You\'ve completed the drill.',
      [
        {
          text: 'Practice Again',
          onPress: () => resetDrill(),
        },
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const resetDrill = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(drill?.duration || 0);
    setElapsedTime(0);
  };

  const togglePause = () => {
    if (!isPaused) setPrePauseTime(timeRemaining); // Save pre-pause time
    setIsPaused(!isPaused);
    if (!isPaused) setShowPauseModal(true);
  };

  const handleCompleteDrill = async () => {
    if (!user?.id || !drill) return;
    try {
      await supabase.from('drill_sessions').insert({
        user_id: user.id,
        drill_id: drill.id,
        duration: elapsedTime,
        completed_at: new Date().toISOString(),
      });
      setShowPauseModal(false);
      Alert.alert('Drill Complete!', 'Your drill session has been saved.', [
        { text: 'OK', onPress: () => router.push('/analytics') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save drill session.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!drill) return 0;
    return ((drill.duration - timeRemaining) / drill.duration) * 100;
  };

  if (!drill) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading drill...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF8C00', '#000000']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{drill.name}</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Set Timer Button */}
      {!isActive && !showCountdown && (
        <TouchableOpacity
          style={{ alignSelf: 'center', marginTop: 16, marginBottom: 0, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 }}
          onPress={() => setShowSetTimerModal(true)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Set Timer</Text>
        </TouchableOpacity>
      )}

      {/* Set Timer Modal */}
      <Modal visible={showSetTimerModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.backgroundCard, borderRadius: 16, padding: 32, alignItems: 'center', width: 300 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 24 }}>Set Drill Timer</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                style={{ backgroundColor: colors.gray[100], borderRadius: 8, padding: 8, width: 60, textAlign: 'center', fontSize: 18, color: colors.text }}
                keyboardType="numeric"
                placeholder="Min"
                value={customMinutes}
                onChangeText={setCustomMinutes}
                maxLength={2}
              />
              <Text style={{ fontSize: 18, color: colors.text, alignSelf: 'center' }}>:</Text>
              <TextInput
                style={{ backgroundColor: colors.gray[100], borderRadius: 8, padding: 8, width: 60, textAlign: 'center', fontSize: 18, color: colors.text }}
                keyboardType="numeric"
                placeholder="Sec"
                value={customSeconds}
                onChangeText={setCustomSeconds}
                maxLength={2}
              />
            </View>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 32, marginTop: 8 }}
              onPress={() => {
                const min = parseInt(customMinutes) || 0;
                const sec = parseInt(customSeconds) || 0;
                const total = min * 60 + sec;
                if (total > 0) {
                  setTimeRemaining(total);
                  setElapsedTime(0);
                  setShowSetTimerModal(false);
                  setCustomMinutes('');
                  setCustomSeconds('');
                } else {
                  Alert.alert('Invalid Time', 'Please enter a valid time greater than 0.');
                }
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Set</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => setShowSetTimerModal(false)}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          {/* Drill Info */}
          <View style={styles.drillInfoContainer}>
            <View style={styles.drillHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{drill.category}</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{drill.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.drillDescription}>{drill.description}</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerLabel}>Remaining</Text>
            </View>
            
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
                {formatTime(drill.duration - timeRemaining)} / {formatTime(drill.duration)}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetDrill}
            >
              <RotateCcw size={24} color="white" />
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={isActive ? togglePause : startDrill}
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
          <View style={styles.equipmentContainer}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            <View style={styles.equipmentList}>
              {drill.equipment.map((equipment, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Text style={styles.equipmentText}>{equipment}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>How to Do This Drill</Text>
            <Text style={styles.instructionsText}>{drill.instructions}</Text>
          </View>

          {/* Tips */}
          {drill.tips && drill.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.sectionTitle}>Pro Tips</Text>
              {drill.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Lightbulb size={16} color={colors.warning} style={styles.tipIcon} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Muscle Groups */}
          <View style={styles.muscleContainer}>
            <Text style={styles.sectionTitle}>Muscle Groups</Text>
            <View style={styles.muscleList}>
              {drill.muscle_groups.map((muscle, index) => (
                <View key={index} style={styles.muscleItem}>
                  <Text style={styles.muscleText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Pause Modal */}
      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.backgroundCard, borderRadius: 16, padding: 32, alignItems: 'center', width: 300 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 24 }}>Drill Paused</Text>
            <TouchableOpacity style={[styles.controlButton, styles.playButton, { marginBottom: 16 }]} onPress={() => { setIsPaused(false); setShowPauseModal(false); }}>
              <Play size={32} color="white" />
              <Text style={styles.controlButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={handleCompleteDrill}>
              <Text style={styles.controlButtonText}>Complete Drill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  drillHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  timerLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
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
  resetButton: {
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
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  tipsContainer: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  muscleContainer: {
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
  muscleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  muscleItem: {
    backgroundColor: colors.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  muscleText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 50,
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
}); 