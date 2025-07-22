import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500">Welcome to HoopMaster</Text>
      <Text className="mt-4 text-gray-600">NativeWind is working!</Text>
    </View>
  );
}
