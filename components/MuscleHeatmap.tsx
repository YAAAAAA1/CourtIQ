import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

// Color gradient: yellow -> orange -> pink -> red -> maroon
const MUSCLE_COLORS = ['#FFEB3B', '#FFA500', '#FF69B4', '#FF0000', '#800000'];

function getMuscleColor(score: number) {
  if (score >= 4) return MUSCLE_COLORS[4];
  return MUSCLE_COLORS[score] || MUSCLE_COLORS[0];
}

// Map muscle group names to SVG path IDs
export const MUSCLE_GROUPS = [
  'chest', 'abs', 'obliques',
  'biceps_left', 'biceps_right',
  'triceps_left', 'triceps_right',
  'deltoid_left', 'deltoid_right',
  'forearm_left', 'forearm_right',
  'quads_left', 'quads_right',
  'hamstrings_left', 'hamstrings_right',
  'calves_left', 'calves_right',
  'glutes',
  'traps', 'lats_left', 'lats_right',
  'shoulder_left', 'shoulder_right',
  // Add more as needed
];

// Props: muscleScores is an object { [muscleId]: score }
export default function MuscleHeatmap({ muscleScores = {} }) {
  // Example: muscleScores = { chest: 2, biceps_left: 1, ... }
  return (
    <Svg width={320} height={380} viewBox="0 0 320 380">
      {/* FRONT VIEW */}
      <G>
        {/* Chest */}
        <Path id="chest" d="M80,60 Q100,40 120,60 Q140,80 120,100 Q100,120 80,100 Q60,80 80,60 Z" fill={getMuscleColor(muscleScores.chest || 0)} stroke="#222" strokeWidth={2}/>
        {/* Abs */}
        <Path id="abs" d="M110,110 Q120,130 120,170 Q120,210 110,230 Q100,210 100,170 Q100,130 110,110 Z" fill={getMuscleColor(muscleScores.abs || 0)} stroke="#222" strokeWidth={2}/>
        {/* Left Biceps */}
        <Path id="biceps_left" d="M60,80 Q50,100 60,140 Q70,180 80,140 Q90,100 80,80 Q70,60 60,80 Z" fill={getMuscleColor(muscleScores.biceps_left || 0)} stroke="#222" strokeWidth={2}/>
        {/* Right Biceps */}
        <Path id="biceps_right" d="M140,80 Q150,100 140,140 Q130,180 120,140 Q110,100 120,80 Q130,60 140,80 Z" fill={getMuscleColor(muscleScores.biceps_right || 0)} stroke="#222" strokeWidth={2}/>
        {/* Left Forearm */}
        <Path id="forearm_left" d="M70,180 Q60,200 70,240 Q80,280 90,240 Q100,200 90,180 Q80,160 70,180 Z" fill={getMuscleColor(muscleScores.forearm_left || 0)} stroke="#222" strokeWidth={2}/>
        {/* Right Forearm */}
        <Path id="forearm_right" d="M130,180 Q140,200 130,240 Q120,280 110,240 Q100,200 110,180 Q120,160 130,180 Z" fill={getMuscleColor(muscleScores.forearm_right || 0)} stroke="#222" strokeWidth={2}/>
        {/* Left Quad */}
        <Path id="quads_left" d="M90,230 Q80,250 90,320 Q100,370 110,320 Q120,250 110,230 Q100,210 90,230 Z" fill={getMuscleColor(muscleScores.quads_left || 0)} stroke="#222" strokeWidth={2}/>
        {/* Right Quad */}
        <Path id="quads_right" d="M110,230 Q120,250 110,320 Q100,370 90,320 Q80,250 90,230 Q100,210 110,230 Z" fill={getMuscleColor(muscleScores.quads_right || 0)} stroke="#222" strokeWidth={2}/>
        {/* Add more front muscles as needed */}
      </G>
      {/* BACK VIEW */}
      <G x={160}>
        {/* Traps */}
        <Path id="traps" d="M40,60 Q60,40 80,60 Q100,80 80,100 Q60,120 40,100 Q20,80 40,60 Z" fill={getMuscleColor(muscleScores.traps || 0)} stroke="#222" strokeWidth={2}/>
        {/* Lats Left */}
        <Path id="lats_left" d="M20,100 Q10,140 20,200 Q30,260 40,200 Q50,140 40,100 Q30,80 20,100 Z" fill={getMuscleColor(muscleScores.lats_left || 0)} stroke="#222" strokeWidth={2}/>
        {/* Lats Right */}
        <Path id="lats_right" d="M100,100 Q110,140 100,200 Q90,260 80,200 Q70,140 80,100 Q90,80 100,100 Z" fill={getMuscleColor(muscleScores.lats_right || 0)} stroke="#222" strokeWidth={2}/>
        {/* Glutes */}
        <Path id="glutes" d="M60,200 Q70,240 60,300 Q50,360 40,300 Q30,240 40,200 Q50,160 60,200 Z" fill={getMuscleColor(muscleScores.glutes || 0)} stroke="#222" strokeWidth={2}/>
        {/* Left Hamstring */}
        <Path id="hamstrings_left" d="M40,300 Q30,340 40,370 Q50,390 60,370 Q70,340 60,300 Q50,260 40,300 Z" fill={getMuscleColor(muscleScores.hamstrings_left || 0)} stroke="#222" strokeWidth={2}/>
        {/* Right Hamstring */}
        <Path id="hamstrings_right" d="M80,300 Q90,340 80,370 Q70,390 60,370 Q50,340 60,300 Q70,260 80,300 Z" fill={getMuscleColor(muscleScores.hamstrings_right || 0)} stroke="#222" strokeWidth={2}/>
        {/* Add more back muscles as needed */}
      </G>
    </Svg>
  );
} 