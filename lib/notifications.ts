import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Helper: get today's date string (YYYY-MM-DD)
function todayString() {
  return new Date().toISOString().split('T')[0];
}

// Notification IDs for each type
const NOTIF_IDS = {
  breakfast: 'breakfast-reminder',
  lunch: 'lunch-reminder',
  dinner: 'dinner-reminder',
  streak: 'streak-reminder',
};

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Enable notifications to get reminders!');
  }
}

// Schedule a meal reminder if not logged
export async function scheduleMealReminder(mealType: 'breakfast' | 'lunch' | 'dinner', isLogged: boolean) {
  // Cancel any existing notification for this meal
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDS[mealType]);
  if (isLogged) return;

  // Set trigger time
  let hour = 8, minute = 1;
  if (mealType === 'lunch') { hour = 12; minute = 1; }
  if (mealType === 'dinner') { hour = 19; minute = 1; }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS[mealType],
    content: {
      title: 'CourtIQ',
      body: `Don’t forget to log your ${mealType}!`,
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

// Schedule/cancel streak reminder
export async function scheduleStreakReminder(appOpenedToday: boolean) {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.streak);
  if (appOpenedToday) return;
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS.streak,
    content: {
      title: 'CourtIQ',
      body: 'Keep the streak alive! Open the app today to continue your progress.',
      sound: true,
    },
    trigger: {
      hour: 14,
      minute: 0,
      repeats: true,
    },
  });
}

// Schedule a calendar event reminder 30 min before event
export async function scheduleCalendarEventReminder(eventId: string, eventTitle: string, eventDate: Date) {
  // Cancel any existing notification for this event
  await Notifications.cancelScheduledNotificationAsync(eventId);
  // 30 min before event
  const triggerDate = new Date(eventDate.getTime() - 30 * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    identifier: eventId,
    content: {
      title: 'CourtIQ',
      body: `Upcoming event: ${eventTitle} in 30 minutes!`,
      sound: true,
    },
    trigger: triggerDate,
  });
}

// Cancel a calendar event reminder
export async function cancelCalendarEventReminder(eventId: string) {
  await Notifications.cancelScheduledNotificationAsync(eventId);
}

// Call this on app open or when meals are logged
export async function updateAllReminders({
  breakfastLogged,
  lunchLogged,
  dinnerLogged,
  appOpenedToday,
  calendarEvents, // [{ id, title, date: Date }]
}: {
  breakfastLogged: boolean,
  lunchLogged: boolean,
  dinnerLogged: boolean,
  appOpenedToday: boolean,
  calendarEvents: { id: string, title: string, date: Date }[],
}) {
  await requestNotificationPermissions();
  await scheduleMealReminder('breakfast', breakfastLogged);
  await scheduleMealReminder('lunch', lunchLogged);
  await scheduleMealReminder('dinner', dinnerLogged);
  await scheduleStreakReminder(appOpenedToday);
  for (const event of calendarEvents) {
    await scheduleCalendarEventReminder(event.id, event.title, event.date);
  }
} 