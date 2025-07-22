-- Fix drills table schema to use TEXT primary keys
-- This allows us to use the string IDs from the constants file

-- First, drop the workout_drills table since it references drills
DROP TABLE IF EXISTS workout_drills CASCADE;

-- Drop the drills table
DROP TABLE IF EXISTS drills CASCADE;

-- Recreate drills table with TEXT primary key
CREATE TABLE drills (
  id TEXT PRIMARY KEY, -- Changed from UUID to TEXT
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shooting', 'dribbling', 'passing', 'conditioning', 'recovery')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT NOT NULL,
  equipment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Recreate workout_drills table
CREATE TABLE workout_drills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  drill_id TEXT REFERENCES drills(id) ON DELETE CASCADE NOT NULL, -- Now properly references drills.id
  order_num INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Disable RLS on drills table since drills are shared data
-- ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed for drills since they are shared data

-- Enable RLS on workout_drills table
ALTER TABLE workout_drills ENABLE ROW LEVEL SECURITY;

-- Workout drills policies
CREATE POLICY "Users can view their own workout drills" ON workout_drills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_drills.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout drills" ON workout_drills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_drills.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout drills" ON workout_drills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_drills.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout drills" ON workout_drills
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_drills.workout_id
      AND workouts.user_id = auth.uid()
    )
  ); 