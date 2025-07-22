const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgbutvnbqzjtexgfxvkl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration: Adding actual_duration field to workout_sessions...');
    
    // Add the actual_duration column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS actual_duration INTEGER;'
    });
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }
    
    // Add index for better performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_workout_sessions_actual_duration ON workout_sessions(actual_duration);'
    });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
      return;
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration(); 