import React from 'react';
import { View, Text } from 'react-native';

export default function TestNativeWind() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500">NativeWind Test</Text>
      <Text className="mt-4 text-gray-600">If you see this, NativeWind is working!</Text>
    </View>
  );
}
