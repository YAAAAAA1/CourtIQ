import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Dumbbell } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import Button from '@/components/Button';
import colors from '@/constants/colors';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  workout_id: string | null;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

export default function CalendarScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date(currentYear, currentMonth, currentDay));
  const [visibleDates, setVisibleDates] = useState(generateWeekDates(currentDate));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  function generateWeekDates(date: Date) {
    const result = [];
    const day = date.getDay();
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - day + i);
      result.push(newDate);
    }
    
    return result;
  }

  const loadEvents = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!user?.id || !newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      Alert.alert('Error', 'Please fill in title, start time, and end time');
      return;
    }

    try {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const startDateTime = `${selectedDateStr}T${newEvent.startTime}:00`;
      const endDateTime = `${selectedDateStr}T${newEvent.endTime}:00`;

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          description: newEvent.description,
          start_time: startDateTime,
          end_time: endDateTime,
          location: newEvent.location,
        });

      if (error) throw error;

      Alert.alert('Success', 'Event added successfully!');
      setShowAddEventModal(false);
      setNewEvent({ title: '', description: '', location: '', startTime: '', endTime: '' });
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(visibleDates[0]);
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setVisibleDates(generateWeekDates(newDate));
  };

  const isToday = (date: Date) => {
    return date.getDate() === currentDay && 
           date.getMonth() === currentMonth && 
           date.getFullYear() === currentYear;
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const getEventIcon = (event: CalendarEvent) => {
    if (event.workout_id) {
      return <Dumbbell size={20} color={colors.text} />;
    }
    return <Clock size={20} color={colors.text} />;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateWeek('prev')}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek('next')}>
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        {visibleDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              isSelected(date) && styles.selectedDayContainer,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[styles.dayName, isSelected(date) && styles.selectedDayText]}>
              {days[date.getDay()]}
            </Text>
            <View
              style={[
                styles.dateContainer,
                isToday(date) && styles.todayContainer,
                isSelected(date) && styles.selectedDateContainer,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isToday(date) && styles.todayText,
                  isSelected(date) && styles.selectedDateText,
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
            {events.some(event => {
              const eventDate = new Date(event.start_time);
              return eventDate.getDate() === date.getDate() && 
                     eventDate.getMonth() === date.getMonth() && 
                     eventDate.getFullYear() === date.getFullYear();
            }) && (
              <View style={styles.eventIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {getEventsForSelectedDate().length > 0 ? (
        getEventsForSelectedDate().map(event => (
          <Card key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventIconContainer}>
                {getEventIcon(event)}
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <Clock size={14} color={colors.textSecondary} style={styles.eventDetailIcon} />
                    <Text style={styles.eventDetailText}>
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </Text>
                  </View>
                  {event.location && (
                    <View style={styles.eventDetailItem}>
                      <MapPin size={14} color={colors.textSecondary} style={styles.eventDetailIcon} />
                      <Text style={styles.eventDetailText}>{event.location}</Text>
                    </View>
                  )}
                </View>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
              </View>
            </View>
          </Card>
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for this day</Text>
          <Text style={styles.noEventsSubtext}>Tap the button below to add an event</Text>
        </View>
      )}

      <Button
        title="Add Event"
        onPress={() => setShowAddEventModal(true)}
        leftIcon={<Plus size={20} color={colors.text} />}
        style={styles.addEventButton}
      />

      {showAddEventModal && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Event title"
              placeholderTextColor={colors.gray[500]}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Description (optional)"
              placeholderTextColor={colors.gray[500]}
              value={newEvent.description}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Location (optional)"
              placeholderTextColor={colors.gray[500]}
              value={newEvent.location}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Start time (HH:MM)"
              placeholderTextColor={colors.gray[500]}
              value={newEvent.startTime}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, startTime: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="End time (HH:MM)"
              placeholderTextColor={colors.gray[500]}
              value={newEvent.endTime}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, endTime: text }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddEventModal(false);
                  setNewEvent({ title: '', description: '', location: '', startTime: '', endTime: '' });
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.modalSaveText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  contentContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayContainer: {
    alignItems: 'center',
    width: 40,
  },
  selectedDayContainer: {
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedDayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  dateContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayContainer: {
    backgroundColor: colors.secondaryLight,
  },
  selectedDateContainer: {
    backgroundColor: colors.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  todayText: {
    fontWeight: '700',
  },
  selectedDateText: {
    color: colors.text,
    fontWeight: '700',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  selectedDateHeader: {
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDetails: {
    marginBottom: 8,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailIcon: {
    marginRight: 4,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addEventButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  modalContent: {
    width: '100%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    color: colors.text,
    fontWeight: '600',
  },
});