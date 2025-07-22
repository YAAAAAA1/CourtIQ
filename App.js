import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = require.context('./app');
  return (
    <ExpoRoot context={ctx} />
  );
}

// Register the root component
registerRootComponent(App);
