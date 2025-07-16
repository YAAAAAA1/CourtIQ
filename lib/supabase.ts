import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgbutvnbqzjtexgfxvkl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnV0dm5icXpqdGV4Z2Z4dmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjY1NzQsImV4cCI6MjA2Nzg0MjU3NH0.Uk6CLz14z3xDFkH52SYHnsvJSaHy88f1xn8sjhAnJjM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Tables = {
  users: {
    id: string;
    email: string;
    name: string;
    age: number;
    height: number;
    weight: number;
    profile_image_url: string;
    activity_level: number;
    main_focus: string;
    personal_goal: string;
    created_at: string;
  };
  nutrition_goals: {
    id: string;
    user_id: string;
    daily_calories: number;
    protein_goal: number;
    carbs_goal: number;
    fat_goal: number;
    created_at: string;
    updated_at: string;
  };
  meals: {
    id: string;
    user_id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
    created_at: string;
  };
  custom_foods: {
    id: string;
    user_id: string;
    name: string;
    serving_size: number;
    serving_unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    created_at: string;
  };
  workouts: {
    id: string;
    user_id: string;
    name: string;
    description: string;
    duration: number;
    workout_type: string;
    created_at: string;
  };
  workout_drills: {
    id: string;
    workout_id: string;
    drill_id: string;
    order_num: number;
    duration: number;
    created_at: string;
  };
  drills: {
    id: string;
    name: string;
    description: string;
    category: 'shooting' | 'dribbling' | 'passing' | 'conditioning' | 'recovery';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    instructions: string;
    equipment: string;
    image_url: string;
    created_at: string;
  };
  workout_sessions: {
    id: string;
    user_id: string;
    workout_id: string;
    start_time: string;
    end_time: string;
    completed: boolean;
    created_at: string;
  };
  calendar_events: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
    workout_id: string | null;
    created_at: string;
  };
  goals: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    target_date: string;
    progress: number;
    completed: boolean;
    created_at: string;
  };
  ai_chats: {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
  };
  ai_messages: {
    id: string;
    chat_id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
  };
};