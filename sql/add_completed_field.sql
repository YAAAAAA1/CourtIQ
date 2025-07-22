-- Add actual_duration field to workout_sessions table
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS actual_duration INTEGER;

-- Add index for better performance when filtering by actual_duration
CREATE INDEX IF NOT EXISTS idx_workout_sessions_actual_duration ON workout_sessions(actual_duration);

-- Add completed field to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering completed workouts
CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);
CREATE INDEX IF NOT EXISTS idx_workouts_user_completed ON workouts(user_id, completed); 