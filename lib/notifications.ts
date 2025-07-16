import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleEventReminder(title: string, body: string, eventTime: Date) {
  // Schedule notification 30 minutes before event
  const trigger = new Date(eventTime.getTime() - 30 * 60 * 1000);
  if (trigger.getTime() < Date.now()) return null; // Don't schedule if in the past
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}

export async function scheduleDailyMealReminder(title: string, body: string, hour: number, minute: number, id: string) {
  // Cancel any existing notification with this id
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
    identifier: id,
  });
}

export async function cancelMealReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function cancelAllMealReminders() {
  await cancelMealReminder('breakfast');
  await cancelMealReminder('lunch');
  await cancelMealReminder('dinner');
}

export async function scheduleAllMealReminders() {
  await scheduleDailyMealReminder('Log your breakfast', 'Don’t forget to log your breakfast!', 8, 0, 'breakfast');
  await scheduleDailyMealReminder('Log your lunch', 'Time to log your lunch!', 12, 0, 'lunch');
  await scheduleDailyMealReminder('Log your dinner', 'Log your dinner to stay on track!', 20, 30, 'dinner');
} 