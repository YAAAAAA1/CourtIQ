import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Filter, ChevronRight, X, Clock, Play, Star, Calendar, ArrowLeft, Target, Check, Trash2, Sparkles } from 'lucide-react-native';
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
    seedDrillsDatabase(); // Add this line to seed drills
  }, []);

  // Function to seed drills database
  const seedDrillsDatabase = async () => {
    try {
      // Check if drills already exist
      const { data: existingDrills, error: checkError } = await supabase
        .from('drills')
        .select('id, name')
        .limit(1);

      if (checkError) throw checkError;

      // If drills already exist, don't seed again
      if (existingDrills && existingDrills.length > 0) {
        return;
      }

      // Insert drills from constants
      const drillsToInsert = drills.map(drill => ({
        id: drill.id, // Use the string ID from constants
        name: drill.name,
        description: drill.description,
        category: drill.category,
        difficulty: drill.difficulty,
        instructions: drill.instructions,
        equipment: drill.equipment.join(', '), // Convert array to string
        image_url: drill.image_url || null,
      }));

      const { error: insertError } = await supabase
        .from('drills')
        .insert(drillsToInsert);

      if (insertError) {
        console.error('Error seeding drills:', insertError);
      } else {
        console.log('Drills seeded successfully');
      }
    } catch (error) {
      console.error('Error in seedDrillsDatabase:', error);
    }
  };

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
          .neq('workout_type', 'deleted')
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

  // AI Drill Selection Function
  const selectDrillsWithAI = () => {
    if (!newWorkout.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name first');
      return;
    }

    const workoutName = newWorkout.name.toLowerCase();
    const workoutDescription = (newWorkout.description || '').toLowerCase();
    const combinedText = `${workoutName} ${workoutDescription}`;

    // Clear current selections
    setSelectedDrills([]);

    // Enhanced keyword mappings with more specific patterns
    const keywordMappings = {
      // Shooting keywords
      'shoot': 'shooting',
      'shot': 'shooting',
      'basket': 'shooting',
      'score': 'shooting',
      'form': 'shooting',
      'free throw': 'shooting',
      'three point': 'shooting',
      '3 point': 'shooting',
      'catch and shoot': 'shooting',
      'fadeaway': 'shooting',
      'pull up': 'shooting',
      
      // Dribbling keywords
      'dribble': 'dribbling',
      'ball': 'dribbling',
      'handle': 'dribbling',
      'crossover': 'dribbling',
      'between legs': 'dribbling',
      'behind back': 'dribbling',
      'speed dribble': 'dribbling',
      'weak hand': 'dribbling',
      'cone': 'dribbling',
      
      // Passing keywords
      'pass': 'passing',
      'assist': 'passing',
      'throw': 'passing',
      'chest pass': 'passing',
      'bounce pass': 'passing',
      'overhead': 'passing',
      
      // Conditioning keywords
      'condition': 'conditioning',
      'cardio': 'conditioning',
      'sprint': 'conditioning',
      'endurance': 'conditioning',
      'suicide': 'conditioning',
      'defensive': 'conditioning',
      'slide': 'conditioning',
      'jump': 'conditioning',
      'plyometric': 'conditioning',
      
      // Recovery keywords
      'recover': 'recovery',
      'stretch': 'recovery',
      'flexibility': 'recovery',
      'warm': 'recovery',
      'cool': 'recovery',
      'foam roll': 'recovery',
      'dynamic': 'recovery',
      'static': 'recovery',
    };

    // Determine focus areas based on keywords with scoring
    const focusScores: { [key: string]: number } = {
      shooting: 0,
      dribbling: 0,
      passing: 0,
      conditioning: 0,
      recovery: 0,
    };

    Object.entries(keywordMappings).forEach(([keyword, category]) => {
      if (combinedText.includes(keyword)) {
        focusScores[category] += 1;
      }
    });

    // Analyze workout characteristics
    const isIntense = combinedText.includes('intense') || combinedText.includes('hard') || combinedText.includes('advanced') || combinedText.includes('challenging');
    const isBeginner = combinedText.includes('beginner') || combinedText.includes('easy') || combinedText.includes('basic') || combinedText.includes('fundamental');
    const isShort = combinedText.includes('quick') || combinedText.includes('short') || combinedText.includes('fast') || combinedText.includes('brief');
    const isLong = combinedText.includes('long') || combinedText.includes('extended') || combinedText.includes('comprehensive') || combinedText.includes('full');
    const isWarmup = combinedText.includes('warm') || combinedText.includes('prep') || combinedText.includes('prepare');
    const isCooldown = combinedText.includes('cool') || combinedText.includes('recovery') || combinedText.includes('stretch');

    // Adjust focus scores based on workout characteristics
    if (isWarmup) {
      focusScores.recovery += 2;
      focusScores.shooting += 1;
    }
    if (isCooldown) {
      focusScores.recovery += 3;
    }
    if (isIntense) {
      focusScores.conditioning += 2;
    }
    if (isBeginner) {
      focusScores.shooting += 1;
      focusScores.dribbling += 1;
    }

    // Select top focus areas (at least 2, max 3)
    const sortedFocuses = Object.entries(focusScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0)
      .slice(0, 3)
      .map(([focus]) => focus);

    // If no specific keywords found, use a balanced approach
    if (sortedFocuses.length === 0) {
      sortedFocuses.push('shooting', 'dribbling');
    }

    // Update selected focuses
    setSelectedFocuses(sortedFocuses);

    // Get available drills for detected focuses
    const availableDrills = sortedFocuses.flatMap(focus => getDrillsByCategory(focus));

    // Calculate target workout duration
    let targetDuration = 1800; // Default 30 minutes
    if (isShort) targetDuration = 900; // 15 minutes
    else if (isLong) targetDuration = 3600; // 60 minutes
    else if (isWarmup || isCooldown) targetDuration = 600; // 10 minutes

    // Enhanced drill selection algorithm
    const drillScores: { drill: Drill; score: number }[] = [];

    availableDrills.forEach(drill => {
      let score = 0;

      // Difficulty matching (higher weight)
      if (isBeginner && drill.difficulty === 'beginner') score += 5;
      else if (isIntense && drill.difficulty === 'advanced') score += 5;
      else if (!isBeginner && !isIntense && drill.difficulty === 'intermediate') score += 3;
      else if (!isBeginner && !isIntense) score += 1; // Balanced approach

      // Duration preference (higher weight)
      if (isShort && drill.duration <= 300) score += 4; // Prefer short drills for short workouts
      else if (isLong && drill.duration >= 600) score += 4; // Prefer longer drills for long workouts
      else if (!isShort && !isLong && drill.duration >= 300 && drill.duration <= 600) score += 3; // Balanced duration
      else score += 1;

      // Category balance (prefer drills from different categories)
      const existingCategories = selectedDrills.map(d => 
        availableDrills.find(drill => drill.id === d.drill_id)?.category
      );
      if (!existingCategories.includes(drill.category)) score += 2;

      // Special workout type bonuses
      if (isWarmup && drill.category === 'recovery') score += 3;
      if (isCooldown && drill.category === 'recovery') score += 4;
      if (isIntense && drill.category === 'conditioning') score += 3;
      if (isBeginner && drill.category === 'shooting') score += 2;

      // Name-based matching (bonus for drills that match workout name)
      if (workoutName.includes('shoot') && drill.category === 'shooting') score += 2;
      if (workoutName.includes('dribble') && drill.category === 'dribbling') score += 2;
      if (workoutName.includes('pass') && drill.category === 'passing') score += 2;

      drillScores.push({ drill, score });
    });

    // Sort by score and select top drills
    drillScores.sort((a, b) => b.score - a.score);

    let currentDuration = 0;
    const selectedDrillIds: string[] = [];
    const maxDrills = isShort ? 4 : isLong ? 8 : 6; // Adjust max drills based on workout length

    for (const { drill } of drillScores) {
      if (currentDuration + drill.duration <= targetDuration && selectedDrillIds.length < maxDrills) {
        selectedDrillIds.push(drill.id);
        currentDuration += drill.duration;
      }
    }

    // Ensure we have at least 3 drills (unless it's a very short warmup/cooldown)
    const minDrills = (isWarmup || isCooldown) ? 2 : 3;
    if (selectedDrillIds.length < minDrills) {
      const remainingDrills = availableDrills.filter(drill => !selectedDrillIds.includes(drill.id));
      const additionalNeeded = Math.min(minDrills - selectedDrillIds.length, remainingDrills.length);
      
      for (let i = 0; i < additionalNeeded; i++) {
        const randomDrill = remainingDrills[Math.floor(Math.random() * remainingDrills.length)];
        if (randomDrill && !selectedDrillIds.includes(randomDrill.id)) {
          selectedDrillIds.push(randomDrill.id);
        }
      }
    }

    // Create workout drill objects
    const newSelectedDrills: WorkoutDrill[] = selectedDrillIds.map((drillId, index) => {
      const drill = availableDrills.find(d => d.id === drillId);
      return {
        drill_id: drillId,
        duration: drill?.duration || 300,
        order_num: index + 1,
        drill: drill,
      };
    });

    setSelectedDrills(newSelectedDrills);

    const totalMinutes = Math.round(newSelectedDrills.reduce((sum, drill) => sum + drill.duration, 0) / 60);
    const focusAreas = sortedFocuses.join(', ');
    
    Alert.alert(
      'AI Drill Selection Complete!',
      `I've selected ${newSelectedDrills.length} drills (${totalMinutes} minutes) focused on: ${focusAreas}\n\nBased on your workout: "${newWorkout.name}"\n\nYou can modify the selection as needed.`
    );
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

  const renderDrillCard = ({ item }: { item: Drill }) => {
    const isSelected = selectedDrills.some(drill => drill.drill_id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.drillCard,
          isSelected && styles.selectedDrillCard
        ]}
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
            style={[
              styles.addButton,
              isSelected && styles.selectedAddButton
            ]}
            onPress={() => addDrillToWorkout(item)}
          >
            {isSelected ? (
              <Check size={20} color="white" />
            ) : (
              <Plus size={20} color="white" />
            )}
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
  };

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
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Available Drills</Text>
                  <TouchableOpacity
                    style={styles.aiButton}
                    onPress={selectDrillsWithAI}
                  >
                    <Sparkles size={20} color={colors.warning} />
                    <Text style={styles.aiButtonText}>AI Select</Text>
                  </TouchableOpacity>
                </View>
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
  selectedDrillCard: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  selectedAddButton: {
    backgroundColor: colors.warning,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
}); 