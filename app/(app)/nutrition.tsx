import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Dimensions, Modal } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, ArrowLeft, Minus, Target, Calculator, X, Camera as CameraIcon, RotateCcw, Check } from 'lucide-react-native';
import { CameraView, Camera } from 'expo-camera';
import { useAuth } from '@/hooks/useAuth.js';
import { supabase } from '@/lib/supabase.js';
import Card from '@/components/Card.js';
import Button from '@/components/Button.js';
import CircularProgress from '@/components/CircularProgress.js';
import colors from '@/constants/colors.js';
import theme from '@/constants/theme.js';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateAllReminders } from '@/lib/notifications.js';

const { width } = Dimensions.get('window');

interface NutritionGoals {
  id?: string;
  daily_calories: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

interface Meal {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  created_at: string;
}

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
}

interface CustomFood {
  id?: string;
  user_id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface CalorieGoalForm {
  height: string;
  weight: string;
  age: string;
  activityLevel: string;
  goal: string;
  gender: string;
}

const foodDatabase: FoodItem[] = [
  { id: '1', name: 'Cheeseburger', calories_per_100g: 456, protein_per_100g: 20, carbs_per_100g: 25, fat_per_100g: 30, category: 'fast-food' },
  { id: '2', name: 'Grilled Chicken Salad', calories_per_100g: 150, protein_per_100g: 25, carbs_per_100g: 8, fat_per_100g: 4, category: 'healthy' },
  { id: '3', name: 'Sushi Roll', calories_per_100g: 200, protein_per_100g: 8, carbs_per_100g: 30, fat_per_100g: 6, category: 'japanese' },
  { id: '4', name: 'Mashed Potatoes', calories_per_100g: 87, protein_per_100g: 2, carbs_per_100g: 20, fat_per_100g: 0.1, category: 'sides' },
  { id: '5', name: 'Greek Yogurt', calories_per_100g: 100, protein_per_100g: 10, carbs_per_100g: 6, fat_per_100g: 4, category: 'dairy' },
  { id: '6', name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, category: 'fruit' },
];

const categories = ['Recent', 'Favorites', 'Personal'];

interface FoodRecognitionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  confidence: number;
}

// ErrorBoundary component
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught an error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: 'red', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Something went wrong.</Text>
          <Text style={{ color: 'gray', fontSize: 16 }}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function NutritionScreen() {
  const { user } = useAuth();
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    daily_calories: 2000,
    protein_goal: 150,
    carbs_goal: 250,
    fat_goal: 65,
  });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [showCalorieGoalModal, setShowCalorieGoalModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedCustomFood, setSelectedCustomFood] = useState<CustomFood | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Recent');
  const [foodWeight, setFoodWeight] = useState(100);
  const [loading, setLoading] = useState(true);
  const [calculatingGoals, setCalculatingGoals] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodRecognitionResults, setFoodRecognitionResults] = useState<FoodRecognitionResult[]>([]);
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [showFoodDescriptionModal, setShowFoodDescriptionModal] = useState(false);
  const [foodDescription, setFoodDescription] = useState('');

  const [customFoodForm, setCustomFoodForm] = useState<CustomFood>({
    user_id: user?.id || '',
    name: '',
    serving_size: 100,
    serving_unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const [foodImage, setFoodImage] = useState<string | null>(null);

  const [calorieGoalForm, setCalorieGoalForm] = useState<CalorieGoalForm>({
    height: '',
    weight: '',
    age: '',
    activityLevel: '1.2',
    goal: 'maintain',
    gender: 'male',
  });

  // Add state for modal meal type selection
  const [modalMealType, setModalMealType] = useState<string>('');
  // Add state for showing meal type modal
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);

  useEffect(() => {
    loadNutritionData();
    // Mark app opened today
    const markAppOpened = async () => {
      const today = new Date().toISOString().split('T')[0];
      await (AsyncStorage as any).setItem('lastOpenedDate', today);
    };
    markAppOpened();
  }, []);

  // After meals are loaded, update notifications
  useEffect(() => {
    const updateNotifications = async () => {
      const today = new Date().toISOString().split('T')[0];
      const breakfastLogged = meals.some(m => m.meal_type === 'breakfast' && m.date === today);
      const lunchLogged = meals.some(m => m.meal_type === 'lunch' && m.date === today);
      const dinnerLogged = meals.some(m => m.meal_type === 'dinner' && m.date === today);
      // Check if app opened today
      const lastOpened = await (AsyncStorage as any).getItem('lastOpenedDate');
      const appOpenedToday = lastOpened === today;
      // TODO: Load calendar events for today (replace with real events if available)
      const calendarEvents: { id: string, title: string, date: Date }[] = [];
      await updateAllReminders({
        breakfastLogged,
        lunchLogged,
        dinnerLogged,
        appOpenedToday,
        calendarEvents,
      });
    };
    updateNotifications();
  }, [meals]);

  useEffect(() => {
    console.log('NutritionGoals state changed:', nutritionGoals);
  }, [nutritionGoals]);

  useEffect(() => {
    console.log('showCamera:', showCamera, 'capturedImage:', capturedImage);
    console.log('showFoodDescriptionModal:', showFoodDescriptionModal);
    console.log('showFoodResults:', showFoodResults);
  }, [showCamera, capturedImage, showFoodDescriptionModal, showFoodResults]);

  const cleanupDuplicateGoals = async () => {
    try {
      // Get all nutrition goals for the user
      const { data: allGoals, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If there are multiple goals, keep only the most recent one
      if (allGoals && allGoals.length > 1) {
        const mostRecent = allGoals[0];
        const olderGoals = allGoals.slice(1);
        
        // Delete older goals
        for (const goal of olderGoals) {
          await supabase
            .from('nutrition_goals')
            .delete()
            .eq('id', goal.id);
        }
        
        console.log(`Cleaned up ${olderGoals.length} duplicate nutrition goals`);
      }
    } catch (error) {
      console.error('Error cleaning up duplicate goals:', error);
    }
  };

  const loadNutritionData = async () => {
    if (!user?.id) return;

    try {
      console.log('Loading nutrition data for user:', user.id);
      
      // Clean up any duplicate nutrition goals first
      await cleanupDuplicateGoals();
      
      // Load nutrition goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Goals data:', goalsData);
      console.log('Goals error:', goalsError);

      if (goalsError) {
        console.error('Goals error:', goalsError);
        throw goalsError;
      }

      if (goalsData && goalsData.length > 0) {
        console.log('Setting nutrition goals:', goalsData[0]);
        setNutritionGoals(goalsData[0]);
      } else {
        console.log('No goals found, using defaults');
      }

      // Load today's meals
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (mealsError) throw mealsError;
      if (mealsData) setMeals(mealsData);

      // Load custom foods
      const { data: customFoodsData, error: customFoodsError } = await supabase
        .from('custom_foods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (customFoodsError) throw customFoodsError;
      if (customFoodsData) setCustomFoods(customFoodsData);

    } catch (error) {
      console.error('Error loading nutrition data:', error);
      Alert.alert('Error', 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (!user?.id || (!selectedFood && !selectedCustomFood) || !selectedMealType) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      let mealData;

      if (selectedFood) {
        const multiplier = foodWeight / 100;
        mealData = {
          user_id: user.id,
          meal_type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          name: `${selectedFood.name} (${foodWeight}g)`,
          calories: Math.round(selectedFood.calories_per_100g * multiplier),
          protein: Math.round(selectedFood.protein_per_100g * multiplier),
          carbs: Math.round(selectedFood.carbs_per_100g * multiplier),
          fat: Math.round(selectedFood.fat_per_100g * multiplier),
          date: today,
        };
      } else if (selectedCustomFood) {
        const multiplier = foodWeight / selectedCustomFood.serving_size;
        mealData = {
          user_id: user.id,
          meal_type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          name: `${selectedCustomFood.name} (${foodWeight}${selectedCustomFood.serving_unit})`,
          calories: Math.round(selectedCustomFood.calories * multiplier),
          protein: Math.round(selectedCustomFood.protein * multiplier),
          carbs: Math.round(selectedCustomFood.carbs * multiplier),
          fat: Math.round(selectedCustomFood.fat * multiplier),
          date: today,
        };
      }
      
      const { error } = await supabase
        .from('meals')
        .insert(mealData);

      if (error) throw error;

      Alert.alert('Success', 'Food added successfully!');
      resetFoodSelection();
      loadNutritionData();
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food');
    }
  };

  const handleCreateCustomFood = async () => {
    if (!user?.id || !customFoodForm.name || customFoodForm.calories <= 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_foods')
        .insert({
          ...customFoodForm,
          user_id: user.id,
        });

      if (error) throw error;

      Alert.alert('Success', 'Custom food created successfully!');
      setShowCustomFoodModal(false);
      setCustomFoodForm({
        user_id: user?.id || '',
        name: '',
        serving_size: 100,
        serving_unit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      });
      loadNutritionData();
    } catch (error) {
      console.error('Error creating custom food:', error);
      Alert.alert('Error', 'Failed to create custom food');
    }
  };

  const resetCalorieGoalForm = () => {
    setCalorieGoalForm({
      height: '',
      weight: '',
      age: '',
      activityLevel: '1.2',
      goal: 'maintain',
      gender: 'male',
    });
  };

  const calculateCalorieGoals = async () => {
    if (!calorieGoalForm.height || !calorieGoalForm.weight || !calorieGoalForm.age) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setCalculatingGoals(true);

    try {
      // Parse user inputs
      const height = parseFloat(calorieGoalForm.height);
      const weight = parseFloat(calorieGoalForm.weight);
      const age = parseFloat(calorieGoalForm.age);
      const activityLevel = parseFloat(calorieGoalForm.activityLevel);
      const gender = calorieGoalForm.gender;
      const goal = calorieGoalForm.goal;

      // Calculate BMR using Mifflin-St Jeor equation
      let bmr = 0;
      if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }

      // Calculate TDEE (Total Daily Energy Expenditure)
      let tdee = bmr * activityLevel;

      // Adjust calories based on goal
      let dailyCalories = tdee;
      if (goal === 'lose') {
        dailyCalories = tdee - 500; // 500 calorie deficit for weight loss
      } else if (goal === 'gain') {
        dailyCalories = tdee + 500; // 500 calorie surplus for weight gain
      }

      // Calculate macros
      // Protein: 1.6-2.2g per kg bodyweight (0.73-1g per lb)
      const proteinPerLb = goal === 'lose' ? 1.0 : goal === 'gain' ? 0.8 : 0.9;
      const proteinGoal = Math.round(weight * proteinPerLb);
      const proteinCalories = proteinGoal * 4; // 4 calories per gram

      // Fat: 20-35% of total calories
      const fatPercentage = goal === 'lose' ? 0.30 : goal === 'gain' ? 0.25 : 0.28;
      const fatCalories = dailyCalories * fatPercentage;
      const fatGoal = Math.round(fatCalories / 9); // 9 calories per gram

      // Carbs: remaining calories
      const remainingCalories = dailyCalories - proteinCalories - fatCalories;
      const carbsGoal = Math.round(remainingCalories / 4); // 4 calories per gram

      const goals = {
        daily_calories: Math.round(dailyCalories),
        protein_goal: proteinGoal,
        carbs_goal: carbsGoal,
        fat_goal: fatGoal,
      };

      console.log('Calculated goals:', goals); // Debug log

      // First, delete any existing nutrition goals for this user
      await supabase
        .from('nutrition_goals')
        .delete()
        .eq('user_id', user?.id);

      // Then insert the new nutrition goals
      const { data, error } = await supabase
        .from('nutrition_goals')
        .insert({
          user_id: user?.id,
          daily_calories: goals.daily_calories,
          protein_goal: goals.protein_goal,
          carbs_goal: goals.carbs_goal,
          fat_goal: goals.fat_goal,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Saved to database:', data); // Debug log

      // Update local state
      setNutritionGoals(goals);
      setShowCalorieGoalModal(false);
      
      // Show success message with calculated values
      Alert.alert(
        'Nutrition Goals Calculated!',
        `Daily Calories: ${goals.daily_calories}\nProtein: ${goals.protein_goal}g\nCarbs: ${goals.carbs_goal}g\nFat: ${goals.fat_goal}g`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh data after user acknowledges
              loadNutritionData();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error calculating goals:', error);
      Alert.alert('Error', 'Failed to calculate nutrition goals. Please try again.');
    } finally {
      setCalculatingGoals(false);
    }
  };

  const resetFoodSelection = () => {
    setShowFoodDetail(false);
    setShowFoodSearch(false);
    setSelectedFood(null);
    setSelectedCustomFood(null);
    setSelectedMealType('');
    setFoodWeight(100);
  };

  const takeFoodPicture = async () => {
    console.log('takeFoodPicture called');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take food pictures');
        console.log('Gallery permission denied');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFoodImage(result.assets[0].uri);
        console.log('Gallery image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture from gallery:', error);
      Alert.alert('Error', 'Failed to take picture from gallery.');
    }
  };

  const removeFoodImage = () => {
    setFoodImage(null);
  };

  const calculateTotals = () => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();
  const caloriesProgress = totals.calories / nutritionGoals.daily_calories;

  // Debug logging to track nutrition goals state
  console.log('Current nutritionGoals state:', nutritionGoals);
  console.log('Calories progress:', caloriesProgress);
  console.log('Totals:', totals);

  const allFoods = [
    ...foodDatabase,
    ...customFoods.map(food => ({
      id: food.id || '',
      name: food.name,
      calories_per_100g: Math.round((food.calories / food.serving_size) * 100),
      protein_per_100g: Math.round((food.protein / food.serving_size) * 100),
      carbs_per_100g: Math.round((food.carbs / food.serving_size) * 100),
      fat_per_100g: Math.round((food.fat / food.serving_size) * 100),
      category: 'custom',
    }))
  ];

  const filteredFoods = allFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading nutrition data...</Text>
      </View>
    );
  }

  // Food Detail Modal
  if (showFoodDetail && (selectedFood || selectedCustomFood)) {
    const food = selectedFood || selectedCustomFood;
    const multiplier = selectedFood ? foodWeight / 100 : foodWeight / (selectedCustomFood?.serving_size || 100);
    const calories = selectedFood 
      ? Math.round(selectedFood.calories_per_100g * multiplier)
      : Math.round((selectedCustomFood?.calories || 0) * multiplier);
    const protein = selectedFood
      ? Math.round(selectedFood.protein_per_100g * multiplier)
      : Math.round((selectedCustomFood?.protein || 0) * multiplier);
    const carbs = selectedFood
      ? Math.round(selectedFood.carbs_per_100g * multiplier)
      : Math.round((selectedCustomFood?.carbs || 0) * multiplier);
    const fat = selectedFood
      ? Math.round(selectedFood.fat_per_100g * multiplier)
      : Math.round((selectedCustomFood?.fat || 0) * multiplier);

    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={resetFoodSelection}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{food?.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.foodImageContainer}>
            <Text style={styles.foodEmoji}>🍔</Text>
          </View>

          <Text style={styles.foodName}>{food?.name}</Text>
          <Text style={styles.foodCalories}>{calories} Kcal</Text>

          <View style={styles.macroCards}>
            <View style={[styles.macroCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.macroValue}>{protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={[styles.macroCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.macroValue}>{carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={[styles.macroCard, { backgroundColor: colors.info }]}>
              <Text style={styles.macroValue}>{fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.weightSelector}>
            <Text style={styles.weightLabel}>Weight</Text>
            <View style={styles.weightControls}>
              <TouchableOpacity 
                style={styles.weightButton}
                onPress={() => setFoodWeight(Math.max(10, foodWeight - 10))}
              >
                <Minus size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.weightValue}>{foodWeight}g</Text>
              <TouchableOpacity 
                style={styles.weightButton}
                onPress={() => setFoodWeight(foodWeight + 10)}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.addButtonContainer}>
          <Button
            title="Add"
            variant="gradient"
            size="large"
            onPress={handleAddFood}
            fullWidth
          />
        </View>
      </View>
    );
  }

  // Food Search Modal
  if (showFoodSearch) {
    return (
      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={() => setShowFoodSearch(false)}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.searchTitle}>{selectedMealType}</Text>
          <TouchableOpacity onPress={() => setShowCustomFoodModal(true)}>
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.foodList}>
          {filteredFoods.map(food => (
            <TouchableOpacity
              key={food.id}
              style={styles.foodItem}
              onPress={() => {
                if (food.category === 'custom') {
                  const customFood = customFoods.find(cf => cf.name === food.name);
                  setSelectedCustomFood(customFood || null);
                  setSelectedFood(null);
                } else {
                  setSelectedFood(food);
                  setSelectedCustomFood(null);
                }
                setShowFoodDetail(true);
              }}
            >
              <View style={styles.foodItemContent}>
                <View style={styles.foodItemInfo}>
                  <Text style={styles.foodItemName}>{food.name}</Text>
                  <Text style={styles.foodItemDetails}>
                    {food.calories_per_100g} Kcal • {food.protein_per_100g}g protein
                    {food.category === 'custom' && <Text style={styles.customBadge}> • Custom</Text>}
                  </Text>
                </View>
                <TouchableOpacity style={styles.addFoodButton}>
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Camera functions
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const openCamera = async () => {
    console.log('openCamera called');
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
      setCapturedImage(null);
      console.log('Camera opened');
    } else {
      Alert.alert('Permission Required', 'Camera permission is required to scan meals.');
      console.log('Camera permission denied');
    }
  };

  const takePicture = async () => {
    console.log('takePicture called');
    if (!cameraRef) {
      Alert.alert('Error', 'Camera not ready.');
      console.log('Camera not ready');
      return;
    }
    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      setCapturedImage(photo.uri);
      console.log('Picture taken:', photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const analyzeFood = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No image to analyze.');
      return;
    }
    setAnalyzingFood(true);

    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(capturedImage, { encoding: FileSystem.EncodingType.Base64 });

      // Clarifai API request
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs',
        {
          user_app_id: {
            user_id: 'clarifai',
            app_id: 'main'
          },
          inputs: [
            {
              data: {
                image: {
                  base64: base64
                }
              }
            }
          ]
        },
        {
          headers: {
            'Authorization': 'Key 9b96e68a057c4aa1af4fa0a6f9ddc294',
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse predictions
      const concepts = response.data.outputs[0].data.concepts;
      if (!concepts || concepts.length === 0) {
        Alert.alert('No food detected', 'Try a clearer photo.');
        setAnalyzingFood(false);
        return;
      }

      // Map to foodRecognitionResults (top 3)
      const recognizedFoods = concepts.slice(0, 3).map((concept: { name: string; value: number }) => ({
        name: concept.name,
        confidence: concept.value,
      }));

      setFoodRecognitionResults(recognizedFoods);
      setShowFoodResults(true);
      setShowCamera(false);
      setShowFoodDescriptionModal(false);
    } catch (error) {
      console.error('Clarifai error:', error);
      Alert.alert('Error', 'Failed to analyze food image.');
    } finally {
      setAnalyzingFood(false);
    }
  };

  const addRecognizedFood = async (food: FoodRecognitionResult) => {
    if (!user?.id) return;

    // Only allow valid meal types
    const allowedMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealTypeToUse = selectedMealType || modalMealType;
    if (!mealTypeToUse || !allowedMealTypes.includes(mealTypeToUse)) {
      Alert.alert('Select Meal Type', 'Please select a meal type (breakfast, lunch, dinner, or snack) before logging.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fuzzy match: ignore case, punctuation, and do partial match
      function normalize(str: string) {
        return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
      }
      const foodNorm = normalize(food.name);
      let match = allFoods.find(f => normalize(f.name) === foodNorm);
      if (!match) {
        match = allFoods.find(f => normalize(f.name).includes(foodNorm) || foodNorm.includes(normalize(f.name)));
      }

      let calories = 0, protein = 0, carbs = 0, fat = 0, serving_size = 100;
      let foodName = food.name;
      if (match) {
        calories = match.calories_per_100g;
        protein = match.protein_per_100g;
        carbs = match.carbs_per_100g;
        fat = match.fat_per_100g;
        serving_size = 100;
        foodName = match.name;
      } else {
        Alert.alert('Nutrition Info Not Found', `No nutrition info found for "${food.name}". Logging with 0 values. Try adding this food manually for better results.`);
      }

      const multiplier = foodWeight / serving_size;
      const mealData = {
        user_id: user.id,
        meal_type: mealTypeToUse as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        name: `${foodName} (${foodWeight}g)`,
        calories: Math.round(calories * multiplier),
        protein: Math.round(protein * multiplier),
        carbs: Math.round(carbs * multiplier),
        fat: Math.round(fat * multiplier),
        date: today,
      };

      const { error } = await supabase
        .from('meals')
        .insert(mealData);

      if (error) throw error;

      Alert.alert('Success', 'Food added successfully!');
      setShowFoodResults(false);
      setFoodRecognitionResults([]);
      loadNutritionData();
    } catch (error) {
      console.error('Error adding recognized food:', error);
      Alert.alert('Error', 'Failed to add food');
    }
  };

  const flipCamera = () => {
    setCameraType((current: 'front' | 'back') => 
      current === 'back' ? 'front' : 'back'
    );
  };

  // Add the food results modal
  const renderFoodResultsModal = () => (
    <Modal
      visible={showFoodResults}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { setShowFoodResults(false); console.log('Results modal closed'); }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { setShowFoodResults(false); console.log('Results modal closed'); }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Recognized Foods</Text>
          <View style={{ width: 60 }} />
        </View>
        {/* Meal type dropdown if not set */}
        {!selectedMealType && (
          <View style={{ paddingHorizontal: 24, marginTop: 12, marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>Select Meal Type</Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.gray[800],
                padding: 12,
              }}
              onPress={() => setShowMealTypeModal(true)}
            >
              <Text style={{ color: modalMealType ? colors.text : colors.textSecondary }}>
                {modalMealType ? modalMealType.charAt(0).toUpperCase() + modalMealType.slice(1) : 'Choose...'}
              </Text>
            </TouchableOpacity>
            {/* Meal type selection modal */}
            <Modal
              visible={showMealTypeModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowMealTypeModal(false)}
            >
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}
                activeOpacity={1}
                onPressOut={() => setShowMealTypeModal(false)}
              >
                <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 24, minWidth: 220 }}>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={{ paddingVertical: 12, alignItems: 'center' }}
                      onPress={() => {
                        setModalMealType(type);
                        setShowMealTypeModal(false);
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 18 }}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}
        <ScrollView style={styles.modalContent}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsSubtitle}>
              Select the food that best matches your meal:
            </Text>
          </View>
          {Array.isArray(foodRecognitionResults) && foodRecognitionResults.length > 0 ? (
            foodRecognitionResults.map((food, index) => {
              // Find nutrition info
              const match = allFoods.find(f =>
                f.name.toLowerCase().includes(food.name.toLowerCase()) ||
                food.name.toLowerCase().includes(f.name.toLowerCase())
              );
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.foodResultCardModern}
                  onPress={() => addRecognizedFood(food)}
                  activeOpacity={0.85}
                >
                  <View style={styles.foodResultImageContainer}>
                    <Text style={styles.foodResultEmoji}>🍽️</Text>
                  </View>
                  <View style={styles.foodResultInfoModern}>
                    <Text style={styles.foodResultNameModern}>{food.name}</Text>
                    <Text style={styles.foodResultDetailsModern}>
                      {match
                        ? `${match.calories_per_100g} cal • ${match.protein_per_100g}g protein • ${match.carbs_per_100g}g carbs • ${match.fat_per_100g}g fat`
                        : 'Nutrition info not found'}
                    </Text>
                    <Text style={styles.foodResultServingModern}>
                      Serving: 100g • Confidence: {Math.round(food.confidence * 100)}%
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.logResultButton}>
                    <Text style={styles.logResultButtonText}>Log</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 24 }}>No results found. Please try again.</Text>
          )}
          <View style={styles.resultsFooter}>
            <Text style={styles.resultsFooterText}>
              Don't see your food? Try taking a clearer photo or add it manually.
            </Text>
            <Button
              title="Add Manually"
              variant="outline"
              onPress={() => {
                setShowFoodResults(false);
                setShowFoodSearch(true);
                console.log('Manual add opened');
              }}
              style={styles.manualAddButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Fix the Camera component usage in the modal:
  const renderCameraModal = () => (
    <Modal
      visible={showCamera}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => { setShowCamera(false); console.log('Camera modal closed'); }}
    >
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => { setShowCamera(false); console.log('Camera modal closed'); }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan Your Meal</Text>
              <View style={{ width: 24 }} />
            </View>
            {/* Camera and overlays only if no captured image */}
            <View style={{ flex: 0, height: 500, width: '100%' }}>
              {/* Defensive try/catch for CameraView rendering */}
              {(() => {
                try {
                  return (
                    <CameraView
                      ref={(ref: CameraView | null) => setCameraRef(ref)}
                      style={styles.camera}
                      facing={cameraType}
                    />
                  );
                } catch (err) {
                  console.error('CameraView render error:', err);
                  return (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: 'red' }}>Camera failed to load.</Text>
                      <Button title="Back" onPress={() => setShowCamera(false)} />
                    </View>
                  );
                }
              })()}
              {/* Overlay the scan frame and instructions absolutely on top of the camera */}
              <View style={styles.cameraOverlayCustom} pointerEvents="none">
                <View style={styles.scanFrameCustom} />
              </View>
              <View style={[styles.scanInstructionsContainer, { position: 'absolute', bottom: 120, left: 0, right: 0, zIndex: 10 }]}> 
                <Text style={styles.scanInstructionsCustom}>
                  Position your food in the frame
                </Text>
                <TouchableOpacity style={styles.galleryButton} onPress={takeFoodPicture}>
                  <Text style={styles.galleryButtonText}>Select from gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Preview UI after picture is taken
          <>
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={retakePicture}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Review Photo</Text>
              <TouchableOpacity onPress={() => { setShowCamera(false); console.log('Camera modal closed'); }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              contentFit="cover"
            />
            <View style={styles.previewControls}>
              <Button
                title="Retake"
                variant="outline"
                onPress={retakePicture}
                style={styles.previewButton}
              />
              <Button
                title={analyzingFood ? "Analyzing..." : "Analyze Food"}
                variant="gradient"
                onPress={analyzeFood}
                style={styles.analyzeFoodButton}
                disabled={analyzingFood}
                leftIcon={!analyzingFood ? <Check size={28} color={colors.text} /> : undefined}
                textStyle={styles.analyzeFoodButtonText}
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );

  // Add the food description modal
  const renderFoodDescriptionModal = () => (
    <Modal
      visible={showFoodDescriptionModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { setShowFoodDescriptionModal(false); console.log('Description modal closed'); }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { setShowFoodDescriptionModal(false); console.log('Description modal closed'); }}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Describe Your Food</Text>
          {/* Search button removed since searchFoodWithNutritionix is no longer used */}
        </View>
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What did you eat?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={foodDescription}
              onChangeText={setFoodDescription}
              placeholder="e.g., grilled chicken breast, apple, pizza slice"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.inputSubtext}>
              Be as specific as possible for better results
            </Text>
          </View>
          <View style={styles.descriptionExamples}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => setFoodDescription('grilled chicken breast')}
            >
              <Text style={styles.exampleText}>Grilled Chicken Breast</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => setFoodDescription('medium apple')}
            >
              <Text style={styles.exampleText}>Medium Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => setFoodDescription('slice of pizza')}
            >
              <Text style={styles.exampleText}>Slice of Pizza</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleButton}
              onPress={() => setFoodDescription('cup of brown rice')}
            >
              <Text style={styles.exampleText}>Cup of Brown Rice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi {user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
          <Text style={styles.goalText}>Daily Goal: {nutritionGoals.daily_calories} Kcal</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCalorieGoalModal(true)}>
          <View style={styles.headerGoalButton}>
            <Target size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Calorie Progress Circle */}
      <View style={styles.progressSection}>
        <CircularProgress
          size={150}
          strokeWidth={10}
          progress={caloriesProgress}
          color={colors.primary}
          backgroundColor={colors.gray[800]}
          showPercentage={false}
        >
          <View style={styles.progressContent}>
            <Text style={styles.caloriesNumber}>{totals.calories}/{nutritionGoals.daily_calories}</Text>
            <Text style={styles.caloriesLabel}>Kcal</Text>
          </View>
        </CircularProgress>
        
        <View style={styles.progressLabels}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressLabelValue}>Eaten</Text>
            <Text style={styles.progressLabelText}>{totals.calories} Kcal</Text>
          </View>
          <View style={styles.progressLabel}>
            <Text style={styles.progressLabelValue}>Remaining</Text>
            <Text style={styles.progressLabelText}>{Math.max(0, nutritionGoals.daily_calories - totals.calories)} Kcal</Text>
          </View>
        </View>
      </View>

      {/* Macro Cards */}
      <View style={styles.macroSection}>
        <View style={[styles.macroCard, { backgroundColor: colors.warning }]}>
          <Text style={styles.macroCardValue}>Carbs</Text>
          <Text style={styles.macroCardLabel}>{totals.carbs}g</Text>
          <Text style={styles.macroCardGoal}>/{nutritionGoals.carbs_goal}g</Text>
        </View>
        <View style={[styles.macroCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.macroCardValue}>Protein</Text>
          <Text style={styles.macroCardLabel}>{totals.protein}g</Text>
          <Text style={styles.macroCardGoal}>/{nutritionGoals.protein_goal}g</Text>
        </View>
        <View style={[styles.macroCard, { backgroundColor: colors.info }]}>
          <Text style={styles.macroCardValue}>Fat</Text>
          <Text style={styles.macroCardLabel}>{totals.fat}g</Text>
          <Text style={styles.macroCardGoal}>/{nutritionGoals.fat_goal}g</Text>
        </View>
      </View>

      {/* Set Calorie Goal Button */}
      <View style={styles.goalSection}>
        <Button
          title="Set Calorie Goal"
          variant="outline"
          onPress={() => setShowCalorieGoalModal(true)}
          leftIcon={<Calculator size={20} color={colors.primary} />}
          fullWidth
        />
      </View>

      {/* Meals Section */}
      <View style={styles.mealsSection}>
        {['breakfast', 'lunch', 'dinner'].map(mealType => {
          const mealData = meals.filter(meal => meal.meal_type === mealType);
          const mealCalories = mealData.reduce((sum, meal) => sum + meal.calories, 0);
          const mealProgress = mealCalories / (nutritionGoals.daily_calories / 3);
          
          return (
            <TouchableOpacity
              key={mealType}
              style={styles.mealCard}
              onPress={() => {
                setSelectedMealType(mealType);
                setShowFoodSearch(true);
              }}
            >
              <View style={styles.mealCardContent}>
                <View style={styles.mealImageContainer}>
                  <Text style={styles.mealEmoji}>
                    {mealType === 'breakfast' ? '🥞' : mealType === 'lunch' ? '🥗' : '🍽️'}
                  </Text>
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                  <View style={styles.mealProgress}>
                    <View style={[styles.mealProgressBar, { width: `${Math.min(mealProgress * 100, 100)}%` }]} />
                  </View>
                  <Text style={styles.mealCalories}>{mealCalories} Kcal</Text>
                </View>
                <TouchableOpacity style={styles.addMealButton}>
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Food Modal */}
      <Modal
        visible={showCustomFoodModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomFoodModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Custom Food</Text>
            <TouchableOpacity onPress={handleCreateCustomFood}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name *</Text>
              <TextInput
                style={styles.input}
                value={customFoodForm.name}
                onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter food name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {/* Food Image Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Picture (Optional)</Text>
              {foodImage ? (
                <View style={styles.foodImageContainer}>
                  <Image source={{ uri: foodImage }} style={styles.foodImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removeFoodImage}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={takeFoodPicture}
                >
                  <CameraIcon size={24} color={colors.primary} />
                  <Text style={styles.cameraButtonText}>Take Picture</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Serving Size *</Text>
                <TextInput
                  style={styles.input}
                  value={customFoodForm.serving_size.toString()}
                  onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, serving_size: parseInt(text) || 0 }))}
                  placeholder="100"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={customFoodForm.serving_unit}
                  onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, serving_unit: text }))}
                  placeholder="g"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories *</Text>
              <TextInput
                style={styles.input}
                value={customFoodForm.calories.toString()}
                onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, calories: parseInt(text) || 0 }))}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 5 }]}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={customFoodForm.protein.toString()}
                  onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, protein: parseInt(text) || 0 }))}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  value={customFoodForm.carbs.toString()}
                  onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, carbs: parseInt(text) || 0 }))}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 5 }]}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  value={customFoodForm.fat.toString()}
                  onChangeText={(text) => setCustomFoodForm(prev => ({ ...prev, fat: parseInt(text) || 0 }))}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Calorie Goal Modal */}
      <Modal
        visible={showCalorieGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onShow={resetCalorieGoalForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCalorieGoalModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Calorie Goal</Text>
            <TouchableOpacity onPress={calculateCalorieGoals} disabled={calculatingGoals}>
              <Text style={[styles.modalSave, calculatingGoals && { opacity: 0.5 }]}>
                {calculatingGoals ? 'Calculating...' : 'Calculate'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Height (inches) *</Text>
                <TextInput
                  style={styles.input}
                  value={calorieGoalForm.height}
                  onChangeText={(text) => setCalorieGoalForm(prev => ({ ...prev, height: text }))}
                  placeholder="70"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Weight (lbs) *</Text>
                <TextInput
                  style={styles.input}
                  value={calorieGoalForm.weight}
                  onChangeText={(text) => setCalorieGoalForm(prev => ({ ...prev, weight: text }))}
                  placeholder="180"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  value={calorieGoalForm.age}
                  onChangeText={(text) => setCalorieGoalForm(prev => ({ ...prev, age: text }))}
                  placeholder="25"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[styles.segmentButton, calorieGoalForm.gender === 'male' && styles.segmentButtonActive]}
                    onPress={() => setCalorieGoalForm(prev => ({ ...prev, gender: 'male' }))}
                  >
                    <Text style={[styles.segmentText, calorieGoalForm.gender === 'male' && styles.segmentTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentButton, calorieGoalForm.gender === 'female' && styles.segmentButtonActive]}
                    onPress={() => setCalorieGoalForm(prev => ({ ...prev, gender: 'female' }))}
                  >
                    <Text style={[styles.segmentText, calorieGoalForm.gender === 'female' && styles.segmentTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level</Text>
              <View style={styles.activityButtons}>
                {[
                  { value: '1.2', label: 'Sedentary', description: 'Little to no exercise' },
                  { value: '1.375', label: 'Light', description: 'Light exercise 1-3 days/week' },
                  { value: '1.55', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
                  { value: '1.725', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
                  { value: '1.9', label: 'Extremely Active', description: 'Very hard exercise, physical job' },
                ].map(activity => (
                  <TouchableOpacity
                    key={activity.value}
                    style={[
                      styles.activityButton,
                      calorieGoalForm.activityLevel === activity.value && styles.activityButtonActive
                    ]}
                    onPress={() => setCalorieGoalForm(prev => ({ ...prev, activityLevel: activity.value }))}
                  >
                    <Text style={[
                      styles.activityButtonText,
                      calorieGoalForm.activityLevel === activity.value && styles.activityButtonTextActive
                    ]}>
                      {activity.label}
                    </Text>
                    <Text style={[
                      styles.activityButtonDescription,
                      calorieGoalForm.activityLevel === activity.value && styles.activityButtonTextActive
                    ]}>
                      {activity.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal</Text>
              <View style={styles.goalButtons}>
                {[
                  { value: 'lose', label: 'Lose Weight', description: 'Create a calorie deficit' },
                  { value: 'maintain', label: 'Maintain Weight', description: 'Keep current weight' },
                  { value: 'gain', label: 'Gain Weight', description: 'Build muscle and weight' },
                ].map(goal => (
                  <TouchableOpacity
                    key={goal.value}
                    style={[
                      styles.goalButton,
                      calorieGoalForm.goal === goal.value && styles.goalButtonActive
                    ]}
                    onPress={() => setCalorieGoalForm(prev => ({ ...prev, goal: goal.value }))}
                  >
                    <Text style={[
                      styles.goalButtonText,
                      calorieGoalForm.goal === goal.value && styles.goalButtonTextActive
                    ]}>
                      {goal.label}
                    </Text>
                    <Text style={[
                      styles.goalButtonDescription,
                      calorieGoalForm.goal === goal.value && styles.goalButtonTextActive
                    ]}>
                      {goal.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add this after the existing Quick Actions section: */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowAddMealModal(true)}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight] as const}
            style={styles.quickActionGradient}
          >
            <Plus size={24} color={colors.text} />
            <Text style={styles.quickActionText}>Add Meal</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={openCamera}
        >
          <View style={styles.quickActionSecondary}>
            <CameraIcon size={24} color={colors.primary} />
            <Text style={styles.quickActionSecondaryText}>Scan Meal</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add the camera modal */}
      {renderCameraModal()}
      
      {/* Add the food description modal */}
      {renderFoodDescriptionModal()}
      
      {/* Add the food results modal */}
      {renderFoodResultsModal()}
    </ScrollView>
  );
}

// Wrap the NutritionScreen export in ErrorBoundary
export default function NutritionScreenWithBoundary(props: any) {
  return (
    <ErrorBoundary>
      <NutritionScreen {...props} />
    </ErrorBoundary>
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
  welcomeText: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerGoalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  progressContent: {
    alignItems: 'center',
  },
  caloriesNumber: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  caloriesLabel: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  progressLabel: {
    alignItems: 'center',
  },
  progressLabelValue: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  progressLabelText: {
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginTop: theme.spacing.xs,
  },
  macroSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },
  macroCard: {
    flex: 1,
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  macroCardValue: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  macroCardLabel: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginTop: theme.spacing.xs,
  },
  macroCardGoal: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.text,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  goalSection: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  mealsSection: {
    paddingHorizontal: theme.spacing.l,
  },
  mealCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.s,
    ...theme.shadows.small,
  },
  mealCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  mealImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  mealProgress: {
    height: 3,
    backgroundColor: colors.gray[800],
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
  },
  mealProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  mealCalories: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Food Search Styles
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  searchTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    textTransform: 'capitalize',
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
  foodList: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  foodItem: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    padding: theme.spacing.m,
  },
  foodItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  foodItemDetails: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
  },
  customBadge: {
    color: colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  addFoodButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Food Detail Styles
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
  },
  detailTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  foodImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  foodEmoji: {
    fontSize: 80,
  },
  foodName: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  foodCalories: {
    fontSize: theme.typography.fontSizes.l,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  macroCards: {
    flexDirection: 'row',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },
  macroValue: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  macroLabel: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.text,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  weightSelector: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  weightLabel: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  weightControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.l,
  },
  weightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightValue: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  addButtonContainer: {
    padding: theme.spacing.l,
    backgroundColor: colors.background,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
  modalCancel: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
  },
  modalSave: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.l,
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
  },
  inputLabel: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    color: colors.text,
    fontSize: theme.typography.fontSizes.m,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  textArea: {
    minHeight: 80,
    paddingTop: theme.spacing.s,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing.s,
    alignItems: 'center',
    borderRadius: theme.borderRadius.s,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  activityButtons: {
    gap: theme.spacing.s,
  },
  activityButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  activityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityButtonText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeights.medium,
  },
  activityButtonTextActive: {
    fontWeight: theme.typography.fontWeights.semibold,
  },
  goalButtons: {
    gap: theme.spacing.s,
  },
  goalButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  goalButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalButtonText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeights.medium,
  },
  goalButtonTextActive: {
    fontWeight: theme.typography.fontWeights.semibold,
  },
  inputSubtext: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  activityButtonDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  goalButtonDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  // New styles for custom food modal
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    marginTop: theme.spacing.s,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  cameraButtonText: {
    marginLeft: theme.spacing.s,
    fontSize: theme.typography.fontSizes.m,
    color: colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.s,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  goalsDisplay: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    width: '100%',
  },
  goalsTitle: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  goalsCalories: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  goalsMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  goalsMacro: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // New styles for camera modal
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl * 1.8, // Increased from 1.0 to 1.8 for better touch area
    paddingBottom: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  cameraTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlayCustom: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrameCustom: {
    width: '80%',
    height: '80%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  scanInstructionsCustom: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    marginTop: theme.spacing.l,
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.l,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.text,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  previewTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 320,
    borderRadius: 10,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },
  analyzeFoodButton: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.l,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: theme.spacing.m,
  },
  analyzeFoodButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: theme.typography.fontSizes.l,
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.l,
  },
  quickActionButton: {
    width: '45%',
    alignItems: 'center',
  },
  quickActionGradient: {
    width: '100%',
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    marginTop: theme.spacing.s,
    fontWeight: theme.typography.fontWeights.medium,
  },
  quickActionSecondary: {
    width: '100%',
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  quickActionSecondaryText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.primary,
    marginTop: theme.spacing.s,
    fontWeight: theme.typography.fontWeights.medium,
  },
  resultsHeader: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  resultsSubtitle: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  foodResultCardModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  foodResultImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  foodResultEmoji: {
    fontSize: 32,
  },
  foodResultInfoModern: {
    flex: 1,
    justifyContent: 'center',
  },
  foodResultNameModern: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  foodResultDetailsModern: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  foodResultServingModern: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textTertiary,
  },
  logResultButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginLeft: theme.spacing.m,
  },
  logResultButtonText: {
    color: colors.text,
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.m,
  },
  resultsFooter: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    alignItems: 'center',
  },
  resultsFooterText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  manualAddButton: {
    width: '100%',
  },
  descriptionExamples: {
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.s,
  },
  examplesTitle: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  exampleButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    alignItems: 'center',
  },
  exampleText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  scanInstructionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  galleryButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.s,
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
});