# Database Migration Instructions

## Issue
The app is trying to use a `completed` field in the `workouts` table that doesn't exist yet, causing database errors.

## Solution
Run the following SQL migration in your Supabase database:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Create a new query

### Step 2: Run the Migration
Copy and paste this SQL:

```sql
-- Add actual_duration field to workout_sessions table
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS actual_duration INTEGER;

-- Add index for better performance when filtering by actual_duration
CREATE INDEX IF NOT EXISTS idx_workout_sessions_actual_duration ON workout_sessions(actual_duration);

-- Add completed field to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering completed workouts
CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);
CREATE INDEX IF NOT EXISTS idx_workouts_user_completed ON workouts(user_id, completed);
```

### Step 3: Execute
Click "Run" to execute the migration.

### Step 4: Re-enable Completed Workouts
After running the migration, the completed workouts functionality will work automatically. The code has been temporarily disabled to prevent errors, but will work once the migration is complete.

## What This Fixes
- ✅ Analytics will show workout duration charts
- ✅ Analytics will show muscle activation heatmap
- ✅ Completed workouts will be tracked properly
- ✅ Individual drill sessions will be tracked
- ✅ No more database errors about missing columns

## Files Modified
- `sql/add_completed_field.sql` - Migration script
- `sql/schema.sql` - Updated schema
- `lib/supabase.ts` - Updated TypeScript types
- `app/(app)/analytics.tsx` - Fixed analytics data loading
- `app/(app)/drill-practice.tsx` - Fixed drill session tracking
- `app/(app)/workouts.tsx` - Temporarily disabled completed filtering
- `app/(app)/workouts-new.tsx` - Temporarily disabled completed filtering
- `app/(app)/index.tsx` - Temporarily disabled completed filtering 