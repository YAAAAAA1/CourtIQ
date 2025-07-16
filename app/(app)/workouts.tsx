import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Alert, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Filter, ChevronRight, X, Clock, Play, Star, Calendar, ArrowLeft, Target, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import theme from '@/constants/theme';
import { useRouter } from 'expo-router';
import { drills as allDrills } from '@/constants/drills';

const { width } = Dimensions.get('window');

interface Drill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  duration?: number;
  image_url: string;
  description: string;
  instructions: string;
  equipment: string;
  muscle_groups: string[];
}

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
}

const drillCategories = [
  { id: 'shooting', name: 'Shooting', icon: '🏀', gradient: [colors.primary, colors.primaryLight] as const },
  { id: 'dribbling', name: 'Dribbling', icon: '⚡', gradient: [colors.warning, colors.warningLight] as const },
  { id: 'passing', name: 'Passing', icon: '🤝', gradient: [colors.info, colors.infoLight] as const },
  { id: 'conditioning', name: 'Conditioning', icon: '💪', gradient: [colors.success, colors.successLight] as const },
  { id: 'recovery', name: 'Recovery', icon: '🧘', gradient: [colors.accent.purple, colors.accent.pink] as const },
];

const muscleGroups = [
  'Abs', 'Back', 'Biceps', 'Calves', 'Chest', 'Forearms', 'Glutes', 
  'Hamstrings', 'Neck', 'Quadriceps', 'Shoulders', 'Trapezius', 'Triceps'
];

const equipmentTypes = [
  'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Hammer', 'TRX', 
  'Kettlebell', 'Basketball', 'Cones', 'Ladder'
];

const basketballDrills = {
  shooting: [
    {
      id: 'shoot1',
      name: 'Form Shooting',
      description: 'Close-range shooting focusing on proper form and follow-through',
      instructions: 'Start 3 feet from basket. Focus on elbow under ball, follow through, and arc. Make 10 shots before moving back.',
      equipment: 'Basketball, Hoop',
      difficulty: 'beginner',
      muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    },
    {
      id: 'shoot2',
      name: 'Spot Shooting',
      description: '5 spots around the arc, focusing on consistency',
      instructions: 'Shoot from 5 spots: corners, wings, and top of key. Make 5 shots from each spot.',
      equipment: 'Basketball, Hoop',
      difficulty: 'intermediate',
      muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    },
    {
      id: 'shoot3',
      name: 'Game Speed Shooting',
      description: 'Shooting off the dribble at game speed',
      instructions: 'Dribble to spot, pull up and shoot. Focus on quick release and balance.',
      equipment: 'Basketball, Hoop',
      difficulty: 'advanced',
      muscle_groups: ['Shoulders', 'Triceps', 'Forearms', 'Quadriceps'],
    },
  ],
  dribbling: [
    {
      id: 'drib1',
      name: 'Stationary Dribbling',
      description: 'Basic ball handling skills while stationary',
      instructions: 'Dribble with right hand, left hand, alternating. Keep head up, ball below waist.',
      equipment: 'Basketball',
      difficulty: 'beginner',
      muscle_groups: ['Forearms', 'Shoulders'],
    },
    {
      id: 'drib2',
      name: 'Crossover Dribble',
      description: 'Master the crossover move',
      instructions: 'Dribble low and hard across body. Sell the fake with eyes and shoulders.',
      equipment: 'Basketball',
      difficulty: 'intermediate',
      muscle_groups: ['Forearms', 'Shoulders', 'Abs'],
    },
    {
      id: 'drib3',
      name: 'Cone Dribbling',
      description: 'Dribbling through cones with various moves',
      instructions: 'Set up 5 cones. Use different moves: crossover, between legs, behind back.',
      equipment: 'Basketball, Cones',
      difficulty: 'advanced',
      muscle_groups: ['Forearms', 'Shoulders', 'Quadriceps', 'Calves'],
    },
  ],
  passing: [
    {
      id: 'pass1',
      name: 'Chest Pass',
      description: 'Basic two-handed chest pass',
      instructions: 'Step into pass, push through with thumbs down. Aim for partner\'s chest.',
      equipment: 'Basketball, Partner',
      difficulty: 'beginner',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    },
    {
      id: 'pass2',
      name: 'Bounce Pass',
      description: 'Two-handed bounce pass',
      instructions: 'Aim for spot 2/3 to target. Ball should bounce once before reaching partner.',
      equipment: 'Basketball, Partner',
      difficulty: 'beginner',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    },
    {
      id: 'pass3',
      name: 'Outlet Pass',
      description: 'Long pass to start fast break',
      instructions: 'Step into pass, use full body. Aim ahead of running teammate.',
      equipment: 'Basketball, Partner',
      difficulty: 'intermediate',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps', 'Abs'],
    },
  ],
  conditioning: [
    {
      id: 'cond1',
      name: 'Suicide Sprints',
      description: 'Court sprints for endurance',
      instructions: 'Sprint to free throw line and back, half court and back, far free throw and back, full court and back.',
      equipment: 'Basketball Court',
      difficulty: 'advanced',
      muscle_groups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes'],
    },
    {
      id: 'cond2',
      name: 'Defensive Slides',
      description: 'Lateral movement conditioning',
      instructions: 'Stay low, slide side to side. Don\'t cross feet. Keep hands active.',
      equipment: 'Basketball Court',
      difficulty: 'intermediate',
      muscle_groups: ['Quadriceps', 'Glutes', 'Calves'],
    },
    {
      id: 'cond3',
      name: 'Jump Training',
      description: 'Vertical jump improvement',
      instructions: 'Box jumps, squat jumps, single leg hops. Focus on landing softly.',
      equipment: 'Basketball Court',
      difficulty: 'intermediate',
      muscle_groups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes'],
    },
  ],
  recovery: [
    {
      id: 'rec1',
      name: 'Dynamic Stretching',
      description: 'Pre-workout movement preparation',
      instructions: 'Leg swings, arm circles, hip circles. 10 reps each direction.',
      equipment: 'None',
      difficulty: 'beginner',
      muscle_groups: ['Hamstrings', 'Quadriceps', 'Shoulders'],
    },
    {
      id: 'rec2',
      name: 'Static Stretching',
      description: 'Post-workout flexibility',
      instructions: 'Hold each stretch 30 seconds. Focus on major muscle groups used.',
      equipment: 'None',
      difficulty: 'beginner',
      muscle_groups: ['Hamstrings', 'Quadriceps', 'Calves', 'Shoulders'],
    },
    {
      id: 'rec3',
      name: 'Foam Rolling',
      description: 'Muscle recovery and maintenance',
      instructions: 'Roll slowly over tight areas. Spend extra time on problem spots.',
      equipment: 'Foam Roller',
      difficulty: 'beginner',
      muscle_groups: ['Quadriceps', 'Hamstrings', 'Calves', 'Back'],
    },
  ],
};

function TodayProgramSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [todayDrills, setTodayDrills] = useState<any[]>([]);
  const [program, setProgram] = useState<any>(null);
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    const fetchTodayProgram = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      // 1. Get active program
      const { data: prog, error: progErr } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!prog) {
        setDebug({ step: 'no program', prog, progErr });
        setLoading(false);
        return;
      }
      setProgram(prog);
      // 2. Get today's program workout
      const { data: progWorkout, error: progWorkoutErr } = await supabase
        .from('program_workouts')
        .select('*,workouts(*)')
        .eq('program_id', prog.id)
        .eq('scheduled_date', today)
        .single();
      if (!progWorkout || !progWorkout.workout_id) {
        setDebug({ step: 'no progWorkout', prog, progWorkout, progWorkoutErr });
        setLoading(false);
        return;
      }
      setTodayWorkout(progWorkout.workouts);
      // 3. Get drills for this workout
      const { data: workoutDrills, error: workoutDrillsErr } = await supabase
        .from('workout_drills')
        .select('*')
        .eq('workout_id', progWorkout.workout_id)
        .order('order_num', { ascending: true });
      if (workoutDrills) {
        // Map to drill details
        const drills = workoutDrills.map(wd => allDrills.find(d => d.id === wd.drill_id)).filter(Boolean);
        setTodayDrills(drills);
        setDebug({ step: 'success', prog, progWorkout, workoutDrills, drills });
      } else {
        setDebug({ step: 'no drills', prog, progWorkout, workoutDrills, workoutDrillsErr });
      }
      setLoading(false);
    };
    fetchTodayProgram();
  }, [user]);

  if (loading) return null;
  if (!program || !todayWorkout) {
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
        <View style={{ backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
            No program or workout for today.
          </Text>
        </View>
      </View>
    );
  }

  // --- DELETE PROGRAM LOGIC ---
  const handleDeleteProgram = async () => {
    Alert.alert(
      'Delete Program',
      'Are you sure you want to delete this program? This will remove all scheduled workouts and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              // 1. Get all workout_ids for this program
              const { data: progWorkouts, error: progWorkoutsErr } = await supabase
                .from('program_workouts')
                .select('workout_id')
                .eq('program_id', program.id);
              const workoutIds = progWorkouts ? progWorkouts.map((pw: any) => pw.workout_id) : [];
              // 2. Delete all related calendar_events for these workouts
              if (workoutIds.length > 0) {
                await supabase.from('calendar_events').delete().in('workout_id', workoutIds);
                // 3. Delete all workouts
                await supabase.from('workouts').delete().in('id', workoutIds);
              }
              // 4. Delete program_workouts
              await supabase.from('program_workouts').delete().eq('program_id', program.id);
              // 5. Delete the program itself
              await supabase.from('workout_programs').delete().eq('id', program.id);
              setProgram(null);
              setTodayWorkout && setTodayWorkout(null);
              setTodayDrills && setTodayDrills([]);
              setDebug && setDebug({ step: 'deleted' });
              Alert.alert('Program Deleted', 'Your program and all its workouts have been deleted.');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete program.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
      <View style={{
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>
          Today’s Program
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
          {todayWorkout.name}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
          {program.time_of_day} • {Math.round(todayWorkout.duration / 60)} min
        </Text>
        <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>Drills:</Text>
        {todayDrills.length === 0 && (
          <Text style={{ color: colors.textSecondary }}>No drills found for today.</Text>
        )}
        {todayDrills.map(drill => (
          <TouchableOpacity
            key={drill.id}
            onPress={() => router.push(`/drills-library?drillId=${drill.id}`)}
            style={{ paddingVertical: 6 }}
          >
            <Text style={{ color: colors.primary, fontSize: 15 }}>{drill.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={{ marginTop: 18, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}
          onPress={() => router.push('/program-schedule')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>View Full Schedule</Text>
        </TouchableOpacity>
        {/* Delete Program Button */}
        <TouchableOpacity
          style={{ marginTop: 12, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}
          onPress={handleDeleteProgram}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Delete Program</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProgramScheduleSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  // Add for delete
  const [deleting, setDeleting] = useState(false);

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
            ? workoutDrills.map((wd: any) => allDrills.find(d => d.id === wd.drill_id)).filter(Boolean)
            : [];
          return { ...pw, drills };
        })
      );
      setWorkouts(workoutsWithDrills);
      setLoading(false);
    };
    fetchSchedule();
  }, [user]);

  // Delete program logic (same as TodayProgramSection)
  const handleDeleteProgram = async () => {
    if (!program) return;
    Alert.alert(
      'Delete Program',
      'Are you sure you want to delete this program? This will remove all scheduled workouts and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await supabase.from('program_workouts').delete().eq('program_id', program.id);
              await supabase.from('workout_programs').delete().eq('id', program.id);
              setProgram(null);
              setWorkouts([]);
              Alert.alert('Program Deleted', 'Your program has been deleted.');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete program.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return null;
  }
  if (!program) {
    return null;
  }
  // Group workouts by week
  const weeks: Record<number, any[]> = {};
  workouts.forEach((w: any) => {
    const start = new Date(program.start_date);
    const date = new Date(w.scheduled_date);
    const weekNum = Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    if (!weeks[weekNum]) weeks[weekNum] = [];
    weeks[weekNum].push(w);
  });

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>Full Program Schedule</Text>
      <ScrollView style={{ maxHeight: 350 }}>
        {Object.keys(weeks).map((weekNumStr) => {
          const weekNum = Number(weekNumStr);
          return (
            <View key={weekNum} style={{ marginBottom: 18 }}>
              <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>Week {weekNum}</Text>
              {weeks[weekNum].map((w: any) => (
                <View key={w.workout_id} style={{ backgroundColor: colors.backgroundCard, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>{w.workouts?.name || 'Workout'}</Text>
                  <Text style={{ color: colors.textSecondary }}>{w.scheduled_date} • {Math.round((w.workouts?.duration || 0) / 60)} min</Text>
                  <Text style={{ fontWeight: 'bold', color: colors.text, marginTop: 4 }}>Drills:</Text>
                  {w.drills.length === 0 && (
                    <Text style={{ color: colors.textSecondary }}>No drills</Text>
                  )}
                  {w.drills.map((drill: any) => (
                    <TouchableOpacity
                      key={drill.id}
                      onPress={() => router.push(`/drills-library?drillId=${drill.id}`)}
                      style={{ paddingVertical: 2 }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 15 }}>{drill.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
      {/* Delete Program Button */}
      <TouchableOpacity
        style={{ marginTop: 12, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}
        onPress={handleDeleteProgram}
        disabled={deleting}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{deleting ? 'Deleting...' : 'Delete Program'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    duration: '',
    workout_type: '',
  });
  const [selectedDrills, setSelectedDrills] = useState<WorkoutDrill[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Convert basketball drills to the expected format
      const allDrills: Drill[] = [];
      Object.entries(basketballDrills).forEach(([category, categoryDrills]) => {
        categoryDrills.forEach(drill => {
          allDrills.push({
            ...drill,
            category,
            image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
          });
        });
      });
      setDrills(allDrills);

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
      console.error('Error loading workouts data:', error);
      Alert.alert('Error', 'Failed to load workouts data');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrills = drills.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || drill.category === selectedCategory;
    const matchesMuscleGroup = selectedMuscleGroups.length === 0 || 
      selectedMuscleGroups.some(group => drill.muscle_groups.includes(group));
    const matchesEquipment = selectedEquipment.length === 0 || 
      selectedEquipment.includes(drill.equipment);
    const matchesDifficulty = !selectedDifficulty || drill.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesMuscleGroup && matchesEquipment && matchesDifficulty;
  });

  const handleCreateWorkout = async () => {
    if (!user?.id || !newWorkout.name || !newWorkout.workout_type || selectedDrills.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one drill');
      return;
    }

    try {
      const totalDuration = selectedDrills.reduce((sum, drill) => sum + drill.duration, 0);

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: newWorkout.name,
          description: newWorkout.description,
          duration: totalDuration,
          workout_type: newWorkout.workout_type,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      const workoutDrills = selectedDrills.map(drill => ({
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
      resetWorkoutForm();
      loadData();
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('Error', 'Failed to create workout');
    }
  };

  const resetWorkoutForm = () => {
    setNewWorkout({ name: '', description: '', duration: '', workout_type: '' });
    setSelectedDrills([]);
  };

  const addDrillToWorkout = (drill: Drill) => {
    const newDrill: WorkoutDrill = {
      drill_id: drill.id,
      duration: 300,
      order_num: selectedDrills.length + 1,
    };
    setSelectedDrills(prev => [...prev, newDrill]);
  };

  const removeDrillFromWorkout = (drillId: string) => {
    setSelectedDrills(prev => prev.filter(drill => drill.drill_id !== drillId));
  };

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const clearFilters = () => {
    setSelectedMuscleGroups([]);
    setSelectedEquipment([]);
    setSelectedDifficulty('');
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
            const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
            if (error) {
              Alert.alert('Error', 'Failed to delete workout');
            } else {
              loadData();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  // Filter Modal
  if (showFilters) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.warning, colors.warning + 'CC', colors.background]}
          style={styles.filterHeader}
        >
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filter</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.filterContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>MUSCLE GROUP</Text>
            <View style={styles.filterGrid}>
              {muscleGroups.map(group => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.filterChip,
                    selectedMuscleGroups.includes(group) && styles.filterChipActive
                  ]}
                  onPress={() => toggleMuscleGroup(group)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedMuscleGroups.includes(group) && styles.filterChipTextActive
                  ]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>EQUIPMENT TYPE</Text>
            <View style={styles.filterGrid}>
              {equipmentTypes.map(equipment => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.filterChip,
                    selectedEquipment.includes(equipment) && styles.filterChipActive
                  ]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedEquipment.includes(equipment) && styles.filterChipTextActive
                  ]}>
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>DIFFICULTY</Text>
            <View style={styles.filterGrid}>
              {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedDifficulty(selectedDifficulty === difficulty ? '' : difficulty)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedDifficulty === difficulty && styles.filterChipTextActive
                  ]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.filterFooter}>
          <Button
            title="APPLY"
            variant="gradient"
            size="large"
            onPress={() => setShowFilters(false)}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#FF8C00', '#FF8C00' + 'CC', colors.background]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Basketball Training</Text>
        <Text style={styles.headerSubtitle}>Build your skills with professional basketball drills and workouts designed to improve your game.</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{myWorkouts.length} Workouts Created</Text>
        </View>
        <TouchableOpacity
          style={{ marginTop: 16, alignSelf: 'flex-end', backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 }}
          onPress={() => router.push('/workouts-new')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>My Workouts</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/workouts-new')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight] as const}
            style={styles.quickActionGradient}
          >
            <Plus size={24} color={colors.text} />
            <Text style={styles.quickActionText}>Create Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/drills-library')}
        >
          <View style={styles.quickActionSecondary}>
            <Search size={24} color={colors.primary} />
            <Text style={styles.quickActionSecondaryText}>Browse Drills</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Training Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {drillCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* My Workouts Section */}
      <View style={styles.workoutsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Workouts</Text>
          <TouchableOpacity onPress={() => router.push('/workouts-new')}>
            <Text style={styles.seeAllText}>Create New</Text>
          </TouchableOpacity>
        </View>
        
        {myWorkouts.length > 0 ? (
          myWorkouts.slice(0, 5).map((workout) => (
            <TouchableOpacity key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutCardContent}>
                <View style={styles.workoutIcon}>
                  <Text style={styles.workoutIconText}>
                    {drillCategories.find(cat => cat.id === workout.workout_type)?.icon || '💪'}
                  </Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {Math.round(workout.duration / 60)} min • {workout.workout_type}
                  </Text>
                  {workout.description && (
                    <Text style={styles.workoutDescription}>{workout.description}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteWorkout(workout.id)}>
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Card variant="glass" style={styles.emptyContainer}>
            <Target size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No workouts created yet</Text>
            <Text style={styles.emptySubtext}>Create your first basketball workout to get started</Text>
            <Button
              title="Create Workout"
              variant="gradient"
              onPress={() => router.push('/workouts-new')}
              style={styles.emptyButton}
            />
          </Card>
        )}
      </View>
      <TodayProgramSection />
      <ProgramScheduleSection />
      <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingVertical: 24,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => router.push('/program-creator')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>+ Create Program</Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4, fontSize: 14 }}>
            Build a long-term, AI-powered training plan
          </Text>
        </TouchableOpacity>
      </View>
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
  headerGradient: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.hero,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.fontSizes.m,
    marginBottom: theme.spacing.l,
  },
  headerStats: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
  },
  headerStatsText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    gap: theme.spacing.m,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
  },
  quickActionText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  quickActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickActionSecondaryText: {
    color: colors.primary,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  categoriesSection: {
    paddingVertical: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.m,
  },
  categoryCard: {
    width: 140,
    height: 120,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
  },
  categoryCardGradient: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.s,
  },
  categoryCardName: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryCardCount: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.s,
    opacity: 0.8,
    textAlign: 'center',
  },
  workoutsSection: {
    paddingVertical: theme.spacing.l,
  },
  workoutCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    marginHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.small,
  },
  workoutCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  workoutIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  workoutIconText: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  workoutDetails: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  workoutDescription: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textTertiary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.m,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxxxl,
    marginHorizontal: theme.spacing.l,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.s,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  emptyButton: {
    marginTop: theme.spacing.m,
  },
  // Exercise Library Styles
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  libraryTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.s,
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
  },
  categoryScroll: {
    marginBottom: theme.spacing.l,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.s,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
    gap: theme.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  categoryChipTextActive: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  exerciseIconText: {
    fontSize: 20,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  exerciseDetails: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  exerciseDescription: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textTertiary,
    marginBottom: theme.spacing.xs,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  addExerciseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedExercisesFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.l,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
  },
  selectedCount: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  // Filter Styles
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  filterTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  clearFilters: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
  },
  filterSectionTitle: {
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textSecondary,
    marginBottom: theme.spacing.m,
    letterSpacing: 1,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  filterChip: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  filterChipTextActive: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  filterFooter: {
    padding: theme.spacing.l,
    backgroundColor: colors.background,
  },
  // Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
    zIndex: 1000,
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  modalInput: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    color: colors.text,
    marginBottom: theme.spacing.m,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.medium,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalSectionTitle: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  workoutTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  workoutTypeButton: {
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  workoutTypeButtonActive: {
    ...theme.shadows.colored,
  },
  workoutTypeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    gap: theme.spacing.s,
  },
  workoutTypeIcon: {
    fontSize: 16,
  },
  workoutTypeText: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.medium,
  },
  workoutTypeTextActive: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  addExercisesButton: {
    marginBottom: theme.spacing.l,
  },
  selectedDrillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
  },
  selectedDrillInfo: {
    flex: 1,
  },
  selectedDrillName: {
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.xs,
  },
  selectedDrillDetails: {
    color: colors.textSecondary,
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.medium,
  },
  removeDrillButton: {
    padding: theme.spacing.s,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 1,
  },
});