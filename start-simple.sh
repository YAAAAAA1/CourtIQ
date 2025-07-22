#!/bin/bash

# Set file descriptor limits
echo "Setting file descriptor limits..."
ulimit -n 65536

# Set environment variables
export WATCHMAN_DISABLED=1
export EXPO_USE_WATCHMAN=0
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Starting Expo server..."
npx expo start --clear 