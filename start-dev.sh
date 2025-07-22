#!/bin/bash

# Set higher file descriptor limits for macOS
echo "Setting file descriptor limits..."
ulimit -n 65536

# Clear Metro cache
echo "Clearing Metro cache..."
npx expo start --clear --no-dev --minify

# If the above fails, try with different options
if [ $? -ne 0 ]; then
    echo "Retrying with different options..."
    npx expo start --clear --no-dev
fi 