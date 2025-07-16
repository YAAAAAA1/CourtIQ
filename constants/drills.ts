export interface Drill {
  id: string;
  name: string;
  category: 'shooting' | 'dribbling' | 'passing' | 'conditioning' | 'recovery';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  description: string;
  instructions: string;
  equipment: string[];
  muscle_groups: string[];
  image_url?: string;
  tips?: string[];
}

export const drills: Drill[] = [
  // SHOOTING DRILLS
  {
    id: 'form_shooting',
    name: 'Form Shooting',
    category: 'shooting',
    difficulty: 'beginner',
    duration: 300,
    description: 'Master the fundamentals of shooting form',
    instructions: 'Start 3 feet from basket. Focus on elbow under ball, follow through with wrist snap, and proper arc. Make 10 shots before moving back 1 foot. Continue until you reach the free throw line.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Keep elbow under the ball', 'Follow through with wrist snap', 'Aim for the back of the rim']
  },
  {
    id: 'spot_shooting',
    name: 'Spot Shooting',
    category: 'shooting',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Shoot from 5 key spots around the arc',
    instructions: 'Shoot from 5 spots: both corners, both wings, and top of key. Make 5 shots from each spot before moving to the next. Focus on consistency and proper form.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Square your feet to the basket', 'Use the same form every time', 'Focus on rhythm']
  },
  {
    id: 'game_speed_shooting',
    name: 'Game Speed Shooting',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 900,
    description: 'Shooting off the dribble at game speed',
    instructions: 'Dribble to a spot, pull up and shoot quickly. Focus on quick release, balance, and maintaining proper form under pressure. Practice from different angles.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms', 'Quadriceps'],
    tips: ['Keep your head up while dribbling', 'Quick release after the dribble', 'Maintain balance']
  },
  {
    id: 'free_throw_practice',
    name: 'Free Throw Practice',
    category: 'shooting',
    difficulty: 'beginner',
    duration: 600,
    description: 'Master the free throw with consistent routine',
    instructions: 'Develop a consistent routine: 3 dribbles, deep breath, focus on target, shoot. Make 20 free throws in a row. If you miss, start over.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Develop a consistent routine', 'Focus on the back of the rim', 'Stay relaxed']
  },
  {
    id: 'three_point_shooting',
    name: 'Three Point Shooting',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 900,
    description: 'Practice three-point shooting from various spots',
    instructions: 'Shoot from 5 spots beyond the arc: corners, wings, and top. Make 3 shots from each spot. Focus on proper arc and follow-through for the longer distance.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms', 'Quadriceps'],
    tips: ['Use more leg power for distance', 'Higher arc for longer shots', 'Follow through completely']
  },
  {
    id: 'catch_and_shoot',
    name: 'Catch and Shoot',
    category: 'shooting',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Shooting immediately after catching a pass',
    instructions: 'Have a partner pass you the ball. Catch and shoot immediately without dribbling. Practice from different spots around the arc.',
    equipment: ['Basketball', 'Hoop', 'Partner'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Be ready to shoot before catching', 'Quick release', 'Maintain form under pressure']
  },
  {
    id: 'fadeaway_shooting',
    name: 'Fadeaway Shooting',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 600,
    description: 'Shooting while moving away from the basket',
    instructions: 'Start close to basket, step back while shooting. Focus on maintaining balance and proper form while moving backward.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms', 'Quadriceps', 'Abs'],
    tips: ['Maintain balance while moving', 'Use legs for power', 'Keep eyes on target']
  },

  // DRIBBLING DRILLS
  {
    id: 'stationary_dribbling',
    name: 'Stationary Dribbling',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 300,
    description: 'Basic ball handling skills while stationary',
    instructions: 'Dribble with right hand, left hand, alternating hands. Keep head up, ball below waist, and maintain control. Practice for 5 minutes.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Keep your head up', 'Dribble below waist', 'Use fingertips, not palm']
  },
  {
    id: 'crossover_dribble',
    name: 'Crossover Dribble',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 450,
    description: 'Master the crossover move',
    instructions: 'Dribble low and hard across body from right to left hand. Sell the fake with eyes and shoulders. Practice both directions.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Abs'],
    tips: ['Dribble low and hard', 'Sell the fake', 'Protect the ball']
  },
  {
    id: 'cone_dribbling',
    name: 'Cone Dribbling',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 600,
    description: 'Dribbling through cones with various moves',
    instructions: 'Set up 5 cones in a line. Use different moves: crossover, between legs, behind back. Practice at game speed.',
    equipment: ['Basketball', 'Cones'],
    muscle_groups: ['Forearms', 'Shoulders', 'Quadriceps', 'Calves'],
    tips: ['Keep head up', 'Use different moves', 'Practice at speed']
  },
  {
    id: 'between_legs',
    name: 'Between Legs Dribble',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 450,
    description: 'Dribbling the ball between your legs',
    instructions: 'Stand with legs shoulder-width apart. Dribble ball between legs from front to back. Practice both directions.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Quadriceps'],
    tips: ['Keep legs shoulder-width apart', 'Dribble low', 'Practice both directions']
  },
  {
    id: 'behind_back',
    name: 'Behind Back Dribble',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 450,
    description: 'Dribbling the ball behind your back',
    instructions: 'Dribble ball behind back from one hand to the other. Keep head up and maintain control. Practice both directions.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Abs'],
    tips: ['Keep head up', 'Maintain control', 'Practice both directions']
  },
  {
    id: 'speed_dribbling',
    name: 'Speed Dribbling',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Dribbling at high speed while maintaining control',
    instructions: 'Dribble at maximum speed while maintaining control. Practice in straight lines and around obstacles.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Quadriceps', 'Calves'],
    tips: ['Keep ball in front', 'Use fingertips', 'Maintain control at speed']
  },
  {
    id: 'weak_hand_dribbling',
    name: 'Weak Hand Dribbling',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 450,
    description: 'Improving dribbling with your non-dominant hand',
    instructions: 'Practice dribbling with your weak hand. Start slow and gradually increase speed. Focus on control and consistency.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Start slow', 'Focus on control', 'Gradually increase speed']
  },

  // PASSING DRILLS
  {
    id: 'chest_pass',
    name: 'Chest Pass',
    category: 'passing',
    difficulty: 'beginner',
    duration: 300,
    description: 'Basic two-handed chest pass',
    instructions: 'Step into pass, push through with thumbs down. Aim for partner\'s chest. Practice accuracy and power.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    tips: ['Step into the pass', 'Thumbs down on release', 'Aim for chest']
  },
  {
    id: 'bounce_pass',
    name: 'Bounce Pass',
    category: 'passing',
    difficulty: 'beginner',
    duration: 300,
    description: 'Two-handed bounce pass',
    instructions: 'Aim for spot 2/3 to target. Ball should bounce once before reaching partner. Practice different distances.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    tips: ['Aim 2/3 to target', 'One bounce only', 'Practice different distances']
  },
  {
    id: 'overhead_pass',
    name: 'Overhead Pass',
    category: 'passing',
    difficulty: 'intermediate',
    duration: 300,
    description: 'Two-handed overhead pass',
    instructions: 'Hold ball above head with both hands. Step into pass and release. Use for long passes and outlet passes.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Shoulders', 'Triceps', 'Abs'],
    tips: ['Hold ball above head', 'Step into pass', 'Use for long passes']
  },
  {
    id: 'baseball_pass',
    name: 'Baseball Pass',
    category: 'passing',
    difficulty: 'advanced',
    duration: 300,
    description: 'One-handed long pass',
    instructions: 'Hold ball in one hand, step into pass, and throw like a baseball. Use for very long passes.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Shoulders', 'Triceps', 'Abs'],
    tips: ['Step into pass', 'Follow through', 'Use for long distances']
  },
  {
    id: 'no_look_pass',
    name: 'No Look Pass',
    category: 'passing',
    difficulty: 'advanced',
    duration: 450,
    description: 'Passing without looking at the target',
    instructions: 'Look in one direction while passing to another. Practice with partner to develop court awareness.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    tips: ['Know where your target is', 'Practice court awareness', 'Use peripheral vision']
  },
  {
    id: 'outlet_pass',
    name: 'Outlet Pass',
    category: 'passing',
    difficulty: 'intermediate',
    duration: 300,
    description: 'Long pass to start fast break',
    instructions: 'After rebound, quickly pass to teammate running down court. Aim ahead of running teammate.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Chest', 'Shoulders', 'Triceps', 'Abs'],
    tips: ['Quick release', 'Aim ahead of runner', 'Use overhead or baseball pass']
  },

  // CONDITIONING DRILLS
  {
    id: 'suicide_sprints',
    name: 'Suicide Sprints',
    category: 'conditioning',
    difficulty: 'advanced',
    duration: 600,
    description: 'Build endurance and speed with basketball-specific conditioning',
    instructions: 'Start at baseline. Sprint to free throw line, touch line, sprint back to baseline. Sprint to half court, touch line, sprint back. Sprint to opposite free throw line, touch line, sprint back. Sprint to opposite baseline, touch line, sprint back. Rest 30 seconds, repeat 3-5 times.',
    equipment: ['Court', 'Stopwatch'],
    muscle_groups: ['Legs', 'Cardiovascular', 'Core'],
    tips: [
      'Touch each line completely',
      'Maintain proper form throughout',
      'Rest between sets',
      'Gradually increase repetitions'
    ]
  },
  {
    id: 'defensive_slides',
    name: 'Defensive Slides',
    category: 'conditioning',
    difficulty: 'advanced',
    duration: 480,
    description: 'Improve defensive footwork and lateral movement',
    instructions: 'Start in defensive stance at baseline. Slide laterally to free throw line, then back. Slide to half court, then back. Slide to opposite free throw line, then back. Slide to opposite baseline, then back. Keep knees bent, stay low, maintain proper defensive stance.',
    equipment: ['Court'],
    muscle_groups: ['Legs', 'Hip Flexors', 'Core', 'Cardiovascular'],
    tips: [
      'Stay in defensive stance throughout',
      'Keep feet shoulder-width apart',
      'Don\'t cross feet',
      'Stay low and balanced'
    ]
  },
  {
    id: 'jump_training',
    name: 'Jump Training',
    category: 'conditioning',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Vertical jump improvement',
    instructions: 'Box jumps, squat jumps, single leg hops. Focus on landing softly and exploding upward.',
    equipment: ['Basketball Court', 'Box (optional)'],
    muscle_groups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes'],
    tips: ['Land softly', 'Explode upward', 'Use full range of motion']
  },
  {
    id: 'agility_ladder',
    name: 'Agility Ladder',
    category: 'conditioning',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Footwork and agility training',
    instructions: 'Use agility ladder for various footwork drills: in-and-out, lateral hops, high knees. Focus on quick feet.',
    equipment: ['Agility Ladder'],
    muscle_groups: ['Quadriceps', 'Calves', 'Glutes'],
    tips: ['Quick feet', 'Stay on balls of feet', 'Practice different patterns']
  },
  {
    id: 'wall_sits',
    name: 'Wall Sits',
    category: 'conditioning',
    difficulty: 'beginner',
    duration: 300,
    description: 'Isometric leg strength training',
    instructions: 'Sit against wall with knees at 90 degrees. Hold position for 30-60 seconds. Repeat 3-5 times.',
    equipment: ['Wall'],
    muscle_groups: ['Quadriceps', 'Glutes'],
    tips: ['Keep back against wall', 'Knees at 90 degrees', 'Hold position']
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'conditioning',
    difficulty: 'advanced',
    duration: 600,
    description: 'Full body conditioning exercise',
    instructions: 'Squat down, kick feet back to plank, do push-up, jump feet forward, jump up. Repeat continuously.',
    equipment: ['None'],
    muscle_groups: ['Quadriceps', 'Chest', 'Shoulders', 'Triceps', 'Abs'],
    tips: ['Full range of motion', 'Keep moving', 'Modify if needed']
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'conditioning',
    difficulty: 'intermediate',
    duration: 450,
    description: 'Cardio and core conditioning',
    instructions: 'Start in plank position. Alternate bringing knees to chest quickly. Keep core engaged.',
    equipment: ['None'],
    muscle_groups: ['Abs', 'Shoulders', 'Quadriceps'],
    tips: ['Keep core engaged', 'Quick movements', 'Maintain plank position']
  },
  {
    id: 'box_jumps',
    name: 'Box Jumps',
    category: 'conditioning',
    difficulty: 'advanced',
    duration: 420,
    description: 'Build explosive power and vertical jump',
    instructions: 'Use plyometric box or sturdy platform. Start in athletic stance, explode upward, land softly on box. Step down and repeat. Work on height and explosiveness. Practice different heights. Focus on proper landing technique.',
    equipment: ['Plyometric Box', 'Open Space'],
    muscle_groups: ['Legs', 'Glutes', 'Core', 'Explosive Power'],
    tips: [
      'Land softly on balls of feet',
      'Keep knees aligned with toes',
      'Use arms for momentum',
      'Start with lower height and progress'
    ]
  },

  // RECOVERY DRILLS
  {
    id: 'dynamic_stretching',
    name: 'Dynamic Stretching',
    category: 'recovery',
    difficulty: 'advanced',
    duration: 300,
    description: 'Improve flexibility and prepare muscles for activity',
    instructions: 'Perform dynamic stretches: leg swings, arm circles, walking knee hugs, walking quad stretches, walking lunges with twist, high knees, butt kicks. Move through full range of motion. Focus on controlled movements. Perform 10-15 reps of each exercise.',
    equipment: ['Open Space'],
    muscle_groups: ['Full Body', 'Flexibility', 'Mobility'],
    tips: [
      'Move through full range of motion',
      'Keep movements controlled',
      'Don\'t bounce or force stretches',
      'Focus on proper form'
    ]
  },
  {
    id: 'static_stretching',
    name: 'Static Stretching',
    category: 'recovery',
    difficulty: 'beginner',
    duration: 900,
    description: 'Post-workout flexibility',
    instructions: 'Hold each stretch 30 seconds. Focus on major muscle groups: hamstrings, quads, calves, shoulders, chest.',
    equipment: ['None'],
    muscle_groups: ['Hamstrings', 'Quadriceps', 'Calves', 'Shoulders', 'Chest'],
    tips: ['Hold 30 seconds', 'Don\'t bounce', 'Breathe deeply']
  },
  {
    id: 'foam_rolling',
    name: 'Foam Rolling',
    category: 'recovery',
    difficulty: 'advanced',
    duration: 600,
    description: 'Release muscle tension and improve recovery',
    instructions: 'Use foam roller to target major muscle groups: calves, hamstrings, quadriceps, IT band, glutes, back. Roll slowly and find tight spots. Hold on tight areas for 30-60 seconds. Breathe deeply and relax into the pressure.',
    equipment: ['Foam Roller', 'Mat'],
    muscle_groups: ['Full Body', 'Recovery', 'Mobility'],
    tips: [
      'Roll slowly and controlled',
      'Find and hold on tight spots',
      'Breathe deeply throughout',
      'Don\'t roll over joints'
    ]
  },
  {
    id: 'cool_down_walk',
    name: 'Cool Down Walk',
    category: 'recovery',
    difficulty: 'beginner',
    duration: 300,
    description: 'Gradual heart rate reduction',
    instructions: 'Walk slowly for 5 minutes to gradually reduce heart rate. Focus on deep breathing.',
    equipment: ['None'],
    muscle_groups: ['Quadriceps', 'Calves'],
    tips: ['Walk slowly', 'Deep breathing', 'Gradual reduction']
  },
  {
    id: 'yoga_flow',
    name: 'Yoga Flow',
    category: 'recovery',
    difficulty: 'intermediate',
    duration: 900,
    description: 'Gentle yoga for recovery',
    instructions: 'Sun salutation sequence, gentle twists, hip openers. Focus on breathing and relaxation.',
    equipment: ['Yoga Mat'],
    muscle_groups: ['Full Body'],
    tips: ['Focus on breathing', 'Move slowly', 'Listen to your body']
  },
  {
    id: 'meditation',
    name: 'Meditation',
    category: 'recovery',
    difficulty: 'beginner',
    duration: 300,
    description: 'Mental recovery and focus',
    instructions: 'Sit comfortably, close eyes, focus on breathing. Clear mind and relax for 5 minutes.',
    equipment: ['None'],
    muscle_groups: ['None'],
    tips: ['Focus on breathing', 'Clear your mind', 'Be patient']
  },
  {
    id: 'yoga_for_basketball',
    name: 'Yoga for Basketball',
    category: 'recovery',
    difficulty: 'advanced',
    duration: 900,
    description: 'Improve flexibility, balance, and mental focus',
    instructions: 'Perform basketball-specific yoga poses: downward dog, warrior poses, triangle pose, pigeon pose, child\'s pose, cobra pose. Hold each pose for 30-60 seconds. Focus on breathing and proper alignment. Work on balance and stability.',
    equipment: ['Yoga Mat', 'Quiet Space'],
    muscle_groups: ['Full Body', 'Flexibility', 'Balance', 'Core'],
    tips: [
      'Focus on breathing throughout',
      'Hold poses for proper duration',
      'Don\'t force positions',
      'Work on balance and stability'
    ]
  },

  // ADVANCED DRILLS
  // Advanced Shooting Drills
  {
    id: 'advanced_form_shooting',
    name: 'Advanced Form Shooting',
    description: 'Perfect your shooting form with advanced techniques and footwork patterns',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 600,
    instructions: 'Start 3-5 feet from basket. Focus on perfect form: feet shoulder-width apart, knees bent, ball in shooting pocket. Use proper hand placement - shooting hand under ball, guide hand on side. Extend legs, arms, and follow through with wrist snap. Progress to 10-15 feet, then add movement. Practice 50 shots at each distance.',
    equipment: ['Basketball', 'Basket', 'Cones (optional)'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Triceps', 'Core', 'Legs'],
    tips: [
      'Keep elbow in line with basket',
      'Release ball at peak of jump',
      'Follow through with index finger pointing down',
      'Maintain consistent arc on every shot'
    ]
  },
  {
    id: 'catch_and_shoot_advanced',
    name: 'Catch and Shoot Advanced',
    description: 'Develop quick release shooting off the catch with proper footwork',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 480,
    instructions: 'Partner stands at top of key with ball. You start at wing or corner. Partner passes ball, you catch and immediately shoot. Focus on quick footwork - hop into shot or 1-2 step. Catch ball in shooting position. Practice from different spots: wings, corners, top of key. Rotate positions every 10 shots.',
    equipment: ['Basketball', 'Basket', 'Partner'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Triceps', 'Core', 'Legs'],
    tips: [
      'Catch ball in shooting pocket',
      'Use quick hop or 1-2 step footwork',
      'Keep eyes on rim throughout motion',
      'Practice from game-like positions'
    ]
  },
  {
    id: 'off_dribble_shooting',
    name: 'Off-Dribble Shooting',
    description: 'Master shooting off the dribble with various moves and footwork',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 540,
    instructions: 'Start at top of key. Dribble to wing or elbow, use crossover, between legs, or behind back move, then pull up for jump shot. Practice different moves: crossover pull-up, step-back, side-step, fadeaway. Focus on balance and proper shooting form after move. Work both directions.',
    equipment: ['Basketball', 'Basket', 'Cones (optional)'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Triceps', 'Core', 'Legs', 'Hip Flexors'],
    tips: [
      'Keep ball close during dribble moves',
      'Maintain balance throughout move',
      'Square shoulders to basket before shooting',
      'Practice game-like situations'
    ]
  },
  {
    id: 'shooting_off_screens',
    name: 'Shooting Off Screens',
    description: 'Learn to shoot effectively coming off screens with proper footwork',
    category: 'shooting',
    difficulty: 'advanced',
    duration: 600,
    instructions: 'Set up screen at wing or top of key. Start away from screen, run hard off screen, catch pass, and shoot. Practice different screen types: down screen, flare screen, back screen. Focus on proper footwork - curl, flare, or straight cut. Work on timing with passer.',
    equipment: ['Basketball', 'Basket', 'Partner', 'Screen (chair or cone)'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Triceps', 'Core', 'Legs', 'Cardiovascular'],
    tips: [
      'Run hard off screen',
      'Read defender\'s position',
      'Use proper footwork for screen type',
      'Communicate with passer'
    ]
  },

  // Advanced Dribbling Drills
  {
    id: 'advanced_ball_handling',
    name: 'Advanced Ball Handling',
    description: 'Master complex dribbling combinations and advanced moves',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 480,
    instructions: 'Practice advanced combinations: crossover-behind back-crossover, between legs-behind back-crossover, double crossover. Work on speed and control. Practice with both hands. Add movement - forward, backward, lateral. Focus on keeping ball low and controlled.',
    equipment: ['Basketball', 'Cones (optional)'],
    image_url: null,
    muscle_groups: ['Forearms', 'Wrists', 'Shoulders', 'Core'],
    tips: [
      'Keep ball below waist',
      'Use fingertips, not palm',
      'Practice at game speed',
      'Work both hands equally'
    ]
  },
  {
    id: 'dribble_weaving',
    name: 'Dribble Weaving',
    description: 'Navigate through cones with advanced dribbling moves',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 420,
    instructions: 'Set up 5-7 cones in zigzag pattern. Dribble through cones using different moves: crossover, between legs, behind back, spin move. Work on speed and control. Practice both directions. Time yourself and try to improve speed while maintaining control.',
    equipment: ['Basketball', 'Cones (5-7)'],
    image_url: null,
    muscle_groups: ['Forearms', 'Wrists', 'Shoulders', 'Core', 'Legs'],
    tips: [
      'Keep head up while dribbling',
      'Use quick, controlled moves',
      'Maintain proper spacing from cones',
      'Practice at increasing speeds'
    ]
  },
  {
    id: 'two_ball_dribbling',
    name: 'Two Ball Dribbling',
    description: 'Develop coordination and control with two basketballs',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 360,
    instructions: 'Start with two basketballs. Dribble both balls simultaneously - same rhythm, alternating rhythm, one high one low. Practice stationary first, then add movement. Work on different patterns: both crossover, both between legs, alternating moves.',
    equipment: ['2 Basketballs'],
    image_url: null,
    muscle_groups: ['Forearms', 'Wrists', 'Shoulders', 'Core', 'Coordination'],
    tips: [
      'Start slow and build speed',
      'Focus on control over speed',
      'Keep both balls at same height initially',
      'Practice different rhythms'
    ]
  },

  // Advanced Passing Drills
  {
    id: 'advanced_passing',
    name: 'Advanced Passing',
    description: 'Master advanced passing techniques and court vision',
    category: 'passing',
    difficulty: 'advanced',
    duration: 540,
    instructions: 'Practice advanced passes: no-look passes, behind-the-back passes, bounce passes through traffic, skip passes. Work with partner or wall. Focus on accuracy and proper technique. Practice different angles and distances.',
    equipment: ['Basketball', 'Partner or Wall'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Arms', 'Core', 'Wrists'],
    tips: [
      'Use proper hand placement for each pass type',
      'Lead receiver with pass',
      'Practice with both hands',
      'Focus on accuracy over flash'
    ]
  },
  {
    id: 'passing_off_dribble',
    name: 'Passing Off Dribble',
    description: 'Learn to pass effectively while dribbling and moving',
    category: 'passing',
    difficulty: 'advanced',
    duration: 480,
    instructions: 'Dribble while moving and pass to target. Practice different scenarios: drive and kick, pick and roll passes, outlet passes. Work on timing and accuracy. Practice with partner or targets. Focus on proper footwork and balance.',
    equipment: ['Basketball', 'Partner or Targets'],
    image_url: null,
    muscle_groups: ['Shoulders', 'Arms', 'Core', 'Legs'],
    tips: [
      'Keep head up while dribbling',
      'Use proper footwork for balance',
      'Lead receiver with pass',
      'Practice game-like situations'
    ]
  },

  // PDF-BASED INDIVIDUAL DRILLS
  {
    id: 'bh_finger_grabs',
    name: 'Finger Grabs',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 60,
    description: 'Develops fingertip control and ball feel.',
    instructions: 'Hold the ball with your fingertips, rotating it back and forth from hand to hand. The ball should not touch your palms. Do this for 30-60 seconds.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Hands'],
    tips: ['Use only fingertips', 'Keep palms off the ball', 'Rotate quickly']
  },
  {
    id: 'bh_slaps',
    name: 'Ball Slaps',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 60,
    description: 'Improves hand strength and ball control.',
    instructions: 'Pound or slap the ball hard from hand to hand for 30-60 seconds.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Hands'],
    tips: ['Slap hard', 'Alternate hands', 'Keep eyes up']
  },
  {
    id: 'bh_tipping',
    name: 'Tipping',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 60,
    description: 'Enhances fingertip control and coordination.',
    instructions: 'Tip the ball back and forth from one hand to the next, starting overhead, then down to chest, waist, knees, ankles, and back up. Keep elbows straight.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Keep elbows straight', 'Use fingertips', 'Move smoothly up and down']
  },
  {
    id: 'bh_circles',
    name: 'Circles',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 60,
    description: 'Improves ball control and coordination.',
    instructions: 'Make circles around your head, waist, knees, and ankles with the ball. Use your fingertips, not your palms.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core'],
    tips: ['Keep circles tight', 'Use fingertips', 'Keep eyes up']
  },
  {
    id: 'bh_figure_eight',
    name: 'Figure Eight',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 60,
    description: 'Improves coordination and quick hands.',
    instructions: 'Move the ball in a figure-eight motion around and between your legs, keeping your eyes up.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core'],
    tips: ['Keep eyes up', 'Move quickly', 'Stay low']
  },
  {
    id: 'bh_drops',
    name: 'Drops',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 60,
    description: 'Quick hand coordination drill.',
    instructions: 'Put the ball between your feet, grab with both hands (one in front, one behind). Drop and catch switching hand positions. Try to catch before it bounces.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Hands'],
    tips: ['Switch hands quickly', 'Try to catch before bounce', 'Stay balanced']
  },
  {
    id: 'bh_toss_catch_behind',
    name: 'Toss Up and Catch Behind',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 60,
    description: 'Fun drill for hand-eye coordination.',
    instructions: 'Toss the ball overhead, reverse pivot, and catch it behind your back.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Pivot quickly', 'Track the ball', 'Catch cleanly']
  },
  {
    id: 'bh_crab_walk',
    name: 'Crab Walk',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 90,
    description: 'Full-body coordination and ball control.',
    instructions: 'Bent over, walk up the floor, moving the ball between your legs as you go.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core', 'Legs'],
    tips: ['Stay low', 'Move ball smoothly', 'Keep moving']
  },
  {
    id: 'bh_rapid_fire_passing',
    name: 'One-Ball Rapid Fire Passing',
    category: 'passing',
    difficulty: 'beginner',
    duration: 120,
    description: 'Develops passing speed and accuracy.',
    instructions: 'Stand 2 feet from a wall, pass rapidly, moving back 2 feet with each pass up to 10 feet, then back in. Repeat for 20 passes.',
    equipment: ['Basketball', 'Wall'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Step into pass', 'Pass quickly', 'Use good form']
  },
  {
    id: 'drb_control',
    name: 'Control Dribble',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 120,
    description: 'Protect the ball from defenders with a low, controlled dribble.',
    instructions: 'Crouch, keep your body between the ball and defender, dribble low and close to your body. Practice with both hands.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core'],
    tips: ['Stay low', 'Use off arm to protect', 'Keep dribble tight']
  },
  {
    id: 'drb_speed',
    name: 'Speed Dribble',
    category: 'dribbling',
    difficulty: 'beginner',
    duration: 120,
    description: 'Advance the ball quickly up the court.',
    instructions: 'Push the ball forward several feet, dribble at least waist high, keep your head up. Practice with both hands.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Legs'],
    tips: ['Dribble at speed', 'Keep head up', 'Control the ball']
  },
  {
    id: 'drb_in_and_out',
    name: 'In and Out Dribble',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 90,
    description: 'Fake a crossover, keep the ball with the same hand.',
    instructions: 'Dribble as if to crossover, but roll your hand over the ball and bring it back. Practice both hands.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Sell the fake', 'Roll hand over ball', 'Explode out of move']
  },
  {
    id: 'drb_hesitation',
    name: 'Hesitation Dribble',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 90,
    description: 'Fake a stop, then accelerate past the defender.',
    instructions: 'Speed dribble, then suddenly stop and rock back, then accelerate forward. Combine with crossover for added effect.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Legs'],
    tips: ['Pause to freeze defender', 'Explode after hesitation', 'Keep head up']
  },
  {
    id: 'drb_v_dribble',
    name: 'V-Dribble',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 90,
    description: 'Dribble in a V-pattern in front or to the side.',
    instructions: 'Dribble right, then cross in front in a V-pattern. Repeat with both hands.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders'],
    tips: ['Keep dribble low', 'Use fingertips', 'Change direction quickly']
  },
  {
    id: 'drb_circle',
    name: 'Circle Dribbles',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 120,
    description: 'Dribble around legs, both standing and kneeling.',
    instructions: 'Dribble around each leg, then both legs together, then kneel and dribble around your body.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core'],
    tips: ['Stay low', 'Keep dribble tight', 'Use both hands']
  },
  {
    id: 'drb_figure_eight',
    name: 'Figure Eight Dribble',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 120,
    description: 'Dribble the ball in a figure-eight motion through your legs.',
    instructions: 'Dribble through your legs in a figure-eight, keeping your eyes up.',
    equipment: ['Basketball'],
    muscle_groups: ['Forearms', 'Shoulders', 'Core'],
    tips: ['Keep eyes up', 'Move quickly', 'Stay low']
  },
  {
    id: 'drb_tight_chairs',
    name: 'Tight Chairs Dribbling Drill',
    category: 'dribbling',
    difficulty: 'advanced',
    duration: 180,
    description: 'Dribble through cones/chairs, using various moves.',
    instructions: 'Set up 6 chairs/cones, dribble through using crossover, in-and-out, behind-the-back, through-the-legs, and spin moves.',
    equipment: ['Basketball', 'Cones/Chairs'],
    muscle_groups: ['Forearms', 'Shoulders', 'Legs', 'Core'],
    tips: ['Use different moves', 'Stay low', 'Go at game speed']
  },
  {
    id: 'sh_layup_footwork',
    name: 'Layup Footwork Drill',
    category: 'shooting',
    difficulty: 'beginner',
    duration: 120,
    description: 'Practice correct layup footwork on both sides.',
    instructions: 'Line up on the right side, step with left foot, jump and shoot with right hand. Repeat on left side. Progress to layups with dribbling.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Legs', 'Shoulders', 'Arms'],
    tips: ['Use correct footwork', 'Aim for the backboard', 'Practice both sides']
  },
  {
    id: 'sh_individual_workout',
    name: 'Individual Shooting Workout',
    category: 'shooting',
    difficulty: 'intermediate',
    duration: 900,
    description: 'Comprehensive shooting workout from multiple spots and ranges.',
    instructions: 'Shoot from 5 spots close, mid, and long range, making 5 shots at each spot. Include free throws and dribble pull-ups.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms', 'Legs'],
    tips: ['Keep record of makes', 'Use game-like shots', 'Focus on form']
  },
  // PDF-BASED DRILLS (JCCSTL Basketball Drills Packet)
  {
    id: 'mikan_layup_drill',
    name: 'Mikan Layup Drill',
    category: 'shooting',
    difficulty: 'beginner',
    duration: 240,
    description: 'Classic layup drill to develop finishing with both hands around the basket.',
    instructions: 'Stand under the basket. Shoot a right-handed layup, rebound, then shoot a left-handed layup. Continue alternating hands for the set duration.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Quadriceps', 'Calves', 'Shoulders', 'Forearms'],
    tips: ['Focus on using the backboard', 'Keep the ball high', 'Move quickly from side to side']
  },
  {
    id: 'around_the_world',
    name: 'Around the World',
    category: 'shooting',
    difficulty: 'intermediate',
    duration: 600,
    description: 'Shooting drill from multiple spots around the key to improve accuracy and consistency.',
    instructions: 'Shoot from designated spots around the key (corners, wings, top). Make a shot to move to the next spot. If you miss, stay at the same spot until you make it.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Shoulders', 'Triceps', 'Forearms'],
    tips: ['Use consistent form', 'Focus on follow-through', 'Visualize each shot']
  },
  {
    id: 'zigzag_dribbling',
    name: 'Zig-Zag Dribbling',
    category: 'dribbling',
    difficulty: 'intermediate',
    duration: 360,
    description: 'Develops ball handling and change-of-direction skills while moving up the court.',
    instructions: 'Start at the baseline. Dribble in a zig-zag pattern to half court, changing direction at each cone using a crossover, behind-the-back, or spin move. Return using a different move.',
    equipment: ['Basketball', 'Cones'],
    muscle_groups: ['Forearms', 'Shoulders', 'Quadriceps', 'Calves'],
    tips: ['Keep your head up', 'Stay low on direction changes', 'Use both hands']
  },
  {
    id: 'partner_passing',
    name: 'Partner Passing',
    category: 'passing',
    difficulty: 'beginner',
    duration: 300,
    description: 'Fundamental passing drill to improve accuracy and communication.',
    instructions: 'Stand 10 feet apart with a partner. Practice chest passes, bounce passes, and overhead passes. Focus on accuracy and catching with two hands.',
    equipment: ['Basketball', 'Partner'],
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    tips: ['Step into each pass', 'Communicate with your partner', 'Catch with soft hands']
  },
  {
    id: 'shell_defense',
    name: 'Shell Defense Drill',
    category: 'conditioning',
    difficulty: 'advanced',
    duration: 480,
    description: 'Team defensive drill to teach positioning, help defense, and rotations.',
    instructions: 'Four defenders set up in a shell around the key. Offense moves the ball around the perimeter. Defenders shift, help, and recover based on ball movement. Rotate positions after each rep.',
    equipment: ['Basketball', 'Hoop', '4+ Players'],
    muscle_groups: ['Quadriceps', 'Glutes', 'Calves', 'Shoulders'],
    tips: ['Stay low in stance', 'Communicate loudly', 'Move on the pass, not the catch']
  },
  {
    id: 'closeout_drill',
    name: 'Closeout Drill',
    category: 'conditioning',
    difficulty: 'intermediate',
    duration: 300,
    description: 'Teaches defenders to close out under control and contest shots.',
    instructions: 'Start under the basket. On coach’s signal, sprint to the perimeter, chop feet, and contest an imaginary shot. Repeat from different angles.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Quadriceps', 'Calves', 'Shoulders'],
    tips: ['Chop feet as you approach', 'Hands up to contest', 'Stay balanced']
  },
  {
    id: 'rebound_outlet',
    name: 'Rebound and Outlet Drill',
    category: 'recovery',
    difficulty: 'intermediate',
    duration: 360,
    description: 'Improves rebounding technique and quick outlet passing to start fast breaks.',
    instructions: 'Player rebounds the ball, pivots, and throws an outlet pass to a teammate or coach on the wing. Repeat from both sides.',
    equipment: ['Basketball', 'Hoop', 'Partner'],
    muscle_groups: ['Shoulders', 'Triceps', 'Quadriceps', 'Calves'],
    tips: ['Box out before jumping', 'Pivot quickly after rebound', 'Make strong, accurate passes']
  },
  {
    id: 'full_court_layups',
    name: 'Full Court Layups',
    category: 'conditioning',
    difficulty: 'intermediate',
    duration: 420,
    description: 'Develops finishing at speed and conditioning by running the full court for layups.',
    instructions: 'Start at one baseline. Dribble full speed to the other end and finish with a layup. Rebound, go the other way. Alternate hands each trip.',
    equipment: ['Basketball', 'Hoop'],
    muscle_groups: ['Quadriceps', 'Calves', 'Shoulders', 'Forearms'],
    tips: ['Push the pace', 'Use both hands', 'Focus on control at speed']
  }
];

export const getDrillsByCategory = (category: string): Drill[] => {
  return drills.filter(drill => drill.category === category);
};

export const getDrillsByDifficulty = (difficulty: string): Drill[] => {
  return drills.filter(drill => drill.difficulty === difficulty);
};

export const searchDrills = (query: string): Drill[] => {
  const lowercaseQuery = query.toLowerCase();
  return drills.filter(drill => 
    drill.name.toLowerCase().includes(lowercaseQuery) ||
    drill.description.toLowerCase().includes(lowercaseQuery) ||
    drill.category.toLowerCase().includes(lowercaseQuery)
  );
}; 