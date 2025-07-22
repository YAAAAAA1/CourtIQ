-- Add actual_duration field to workout_sessions table
ALTER TABLE workout_sessions ADD COLUMN actual_duration INTEGER;

-- Add index for better performance when filtering by actual_duration
CREATE INDEX idx_workout_sessions_actual_duration ON workout_sessions(actual_duration); 