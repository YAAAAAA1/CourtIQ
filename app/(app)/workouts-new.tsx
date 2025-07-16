import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Filter, ChevronRight, X, Clock, Play, Star, Calendar, ArrowLeft, Target, Check, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { drills, Drill, getDrillsByCategory } from '@/constants/drills';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Workout {
  id: string;
  name: string;
  duration: number;
  workout_type: string;
  description: string;
  created_at: string;
}

interface WorkoutDrill {
  drill_id: string;
  duration: number;
  order_num: number;
  drill?: Drill;
}

const trainingFocuses = [
  { id: 'shooting', name: 'Shooting', icon: '🏀', color: colors.primary },
  { id: 'dribbling', name: 'Dribbling', icon: '⚡', color: colors.warning },
  { id: 'passing', name: 'Passing', icon: '🤝', color: colors.info },
  { id: 'conditioning', name: 'Conditioning', icon: '💪', color: colors.success },
  { id: 'recovery', name: 'Recovery', icon: '🧘', color: colors.accent.purple },
];

export default function WorkoutsNewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);
  const [availableDrills, setAvailableDrills] = useState<Drill[]>([]);
  const [selectedDrills, setSelectedDrills] = useState<WorkoutDrill[]>([]);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    workout_type: '',
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (selectedFocuses.length > 0) {
      const drills = selectedFocuses.flatMap(focus => getDrillsByCategory(focus));
      setAvailableDrills(drills);
    } else {
      setAvailableDrills([]);
    }
  }, [selectedFocuses]);

  const loadWorkouts = async () => {
    try {
      if (user?.id) {
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (workoutsError) throw workoutsError;
        if (workoutsData) setMyWorkouts(workoutsData);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const toggleFocus = (focusId: string) => {
    setSelectedFocuses(prev => 
      prev.includes(focusId) 
        ? prev.filter(f => f !== focusId)
        : [...prev, focusId]
    );
  };

  const addDrillToWorkout = (drill: Drill) => {
    const existingDrill = selectedDrills.find(d => d.drill_id === drill.id);
    if (existingDrill) {
      Alert.alert('Drill already added', 'This drill is already in your workout');
      return;
    }

    const newDrill: WorkoutDrill = {
      drill_id: drill.id,
      duration: drill.duration,
      order_num: selectedDrills.length + 1,
      drill: drill,
    };
    setSelectedDrills(prev => [...prev, newDrill]);
  };

  const removeDrillFromWorkout = (drillId: string) => {
    setSelectedDrills(prev => {
      const filtered = prev.filter(drill => drill.drill_id !== drillId);
      // Reorder remaining drills
      return filtered.map((drill, index) => ({
        ...drill,
        order_num: index + 1,
      }));
    });
  };

  const createWorkout = async () => {
    if (!user?.id || !newWorkout.name || selectedDrills.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one drill');
      return;
    }

    try {
      const totalDuration = selectedDrills.reduce((sum, drill) => sum + drill.duration, 0);
      const workoutType = selectedFocuses.join(', ');

      // Create the workout first
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: newWorkout.name,
          description: newWorkout.description,
          duration: totalDuration,
          workout_type: workoutType,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create workout drills entries
      const workoutDrills = selectedDrills.map((drill) => ({
        workout_id: workoutData.id,
        drill_id: drill.drill_id,
        order_num: drill.order_num,
        duration: drill.duration,
      }));

      const { error: drillsError } = await supabase
        .from('workout_drills')
        .insert(workoutDrills);

      if (drillsError) throw drillsError;

      Alert.alert('Success', 'Workout created successfully!');
      resetForm();
      loadWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('Error', 'Failed to create workout');
    }
  };

  const addToCalendar = async (workout: Workout) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user?.id,
          title: workout.name,
          description: workout.description,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + workout.duration * 1000).toISOString(),
          workout_id: workout.id,
        });

      if (error) throw error;

      Alert.alert('Success', 'Workout added to calendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add workout to calendar');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First delete the workout_drills entries
              const { error: drillsError } = await supabase
                .from('workout_drills')
                .delete()
                .eq('workout_id', workoutId);
              
              if (drillsError) {
                console.error('Error deleting workout drills:', drillsError);
                Alert.alert('Error', 'Failed to delete workout drills');
                return;
              }

              // Then delete the workout
              const { error } = await supabase
                .from('workouts')
                .delete()
                .eq('id', workoutId);
              
              if (error) {
                console.error('Error deleting workout:', error);
                Alert.alert('Error', 'Failed to delete workout');
              } else {
                loadWorkouts();
              }
            } catch (error) {
              console.error('Error in delete operation:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewWorkout({ name: '', description: '', workout_type: '' });
    setSelectedDrills([]);
    setSelectedFocuses([]);
    setShowCreateModal(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWorkoutCard = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => router.push(`/workout-execution?workoutId=${item.id}`)}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutType}>{item.workout_type}</Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push(`/workout-execution?workoutId=${item.id}`)}
        >
          <Play size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 12, backgroundColor: colors.backgroundLight, borderRadius: 20, padding: 6 }}
          onPress={() => handleDeleteWorkout(item.id)}
        >
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.workoutDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.workoutFooter}>
        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>
        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => addToCalendar(item)}
          >
            <Calendar size={16} color={colors.primary} />
          </TouchableOpacity>
          <ChevronRight size={20} color={colors.gray[400]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDrillCard = ({ item }: { item: Drill }) => (
    <TouchableOpacity
      style={styles.drillCard}
      onPress={() => addDrillToWorkout(item)}
    >
      <View style={styles.drillHeader}>
        <View style={styles.drillInfo}>
          <Text style={styles.drillName}>{item.name}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addDrillToWorkout(item)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.drillDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.drillFooter}>
        <View style={styles.drillStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{item.muscle_groups.length} muscles</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.gray[500];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workouts...</Text>
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
        <Text style={styles.headerTitle}>My Workouts</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Workouts List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {myWorkouts.length > 0 ? (
          <View style={styles.workoutsList}>
            {myWorkouts.map((workout) => (
              <View key={workout.id}>
                {renderWorkoutCard({ item: workout })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first workout to get started
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Workout Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Workout</Text>
            <TouchableOpacity onPress={createWorkout} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Workout Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workout Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Workout name"
                value={newWorkout.name}
                onChangeText={(text) => setNewWorkout(prev => ({ ...prev, name: text }))}
                placeholderTextColor={colors.gray[500]}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={newWorkout.description}
                onChangeText={(text) => setNewWorkout(prev => ({ ...prev, description: text }))}
                placeholderTextColor={colors.gray[500]}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Training Focus */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Focus</Text>
              <Text style={styles.sectionSubtitle}>Select one or more areas to focus on</Text>
              <View style={styles.focusGrid}>
                {trainingFocuses.map((focus) => (
                  <TouchableOpacity
                    key={focus.id}
                    style={[
                      styles.focusCard,
                      selectedFocuses.includes(focus.id) && styles.selectedFocusCard,
                      { borderColor: focus.color }
                    ]}
                    onPress={() => toggleFocus(focus.id)}
                  >
                    <Text style={styles.focusIcon}>{focus.icon}</Text>
                    <Text style={[
                      styles.focusName,
                      selectedFocuses.includes(focus.id) && { color: focus.color }
                    ]}>
                      {focus.name}
                    </Text>
                    {selectedFocuses.includes(focus.id) && (
                      <Check size={16} color={focus.color} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Available Drills */}
            {selectedFocuses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Drills</Text>
                <Text style={styles.sectionSubtitle}>
                  Select drills to add to your workout
                </Text>
                <View style={styles.drillsList}>
                  {availableDrills.map((drill) => (
                    <View key={drill.id}>
                      {renderDrillCard({ item: drill })}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Selected Drills */}
            {selectedDrills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Drills ({selectedDrills.length})</Text>
                <View style={styles.selectedDrillsList}>
                  {selectedDrills.map((workoutDrill, index) => (
                    <View key={workoutDrill.drill_id} style={styles.selectedDrillItem}>
                      <View style={styles.selectedDrillInfo}>
                        <Text style={styles.selectedDrillNumber}>{index + 1}</Text>
                        <View style={styles.selectedDrillDetails}>
                          <Text style={styles.selectedDrillName}>
                            {workoutDrill.drill?.name || 'Drill'}
                          </Text>
                          <Text style={styles.selectedDrillDuration}>
                            {formatDuration(workoutDrill.duration)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeDrillFromWorkout(workoutDrill.drill_id)}
                      >
                        <X size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  workoutsList: {
    gap: 15,
  },
  workoutCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  workoutType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 15,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[600],
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 30,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[700],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedFocusCard: {
    backgroundColor: colors.backgroundLight,
  },
  focusIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  focusName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  drillsList: {
    gap: 15,
  },
  drillCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  drillInfo: {
    flex: 1,
  },
  drillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  addButton: {
    backgroundColor: colors.success,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 15,
  },
  drillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillStats: {
    flexDirection: 'row',
    gap: 15,
  },
  selectedDrillsList: {
    gap: 10,
  },
  selectedDrillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDrillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedDrillNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  selectedDrillDetails: {
    flex: 1,
  },
  selectedDrillName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedDrillDuration: {
    fontSize: 14,
    color: colors.gray[600],
  },
  removeButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: 18,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 50,
  },
}); 