import React, {useState, useEffect, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Colors from '../constants/Colors';
import {sampleEvents} from '../constants/Strings';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';
import {eventService} from '../services/eventService';
import {registrationService, Registration} from '../services/registrationService';
import RegisteredEventCard from '../components/RegisteredEventCard';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface MyEventsScreenProps {
  route?: {
    params?: {
      tab?: 'registered' | 'organized';
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const MyEventsScreen: React.FC<MyEventsScreenProps> = ({route, navigation}) => {
  const {registeredEventIds, updateRegisteredEventIds, cancelRegistration, addNotification, student} = useApp();
  const {colors, isDarkMode} = useTheme();
  const isFocused = useIsFocused();

  // Tab State: 'registered' or 'organized'
  const [activeTab, setActiveTab] = useState<'registered' | 'organized'>('registered');

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  // Organized Events State
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // We also want to fetch all events to resolve the registered events details dynamically if they are from backend
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const fetchEventsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    try {
      // Fetch all events, organized events, and registrations
      const [fetchedAll, fetchedOrganized, fetchedRegistrations] = await Promise.all([
        eventService.getEvents(),
        eventService.getMyEvents(),
        registrationService.getMyRegistrations(),
      ]);

      setAllEvents(fetchedAll);
      setOrganizedEvents(fetchedOrganized);
      setRegistrations(fetchedRegistrations);
      
      // Update registered event IDs from backend
      const registeredIds = fetchedRegistrations.map(reg => reg.eventId);
      updateRegisteredEventIds(registeredIds);
    } catch (err: any) {
      console.warn('Failed to load events in MyEventsScreen:', err);
      setErrorMsg(err.message || 'Unable to load events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchEventsData();
    }
  }, [isFocused, fetchEventsData]);

  // Combine sampleEvents with dynamic DB events to show full details of registered events
  const registeredEvents = React.useMemo(() => {
    const combined = [...allEvents];
    // Add sample events if they aren't already represented by ID
    sampleEvents.forEach(se => {
      if (!combined.some(e => e.id === se.id)) {
        combined.push(se);
      }
    });
    
    // Filter events that the user has registered for (from backend)
    const backendRegisteredEvents = combined.filter(event => {
      const eventId = event._id || event.id;
      return registeredEventIds.includes(eventId);
    });
    
    return backendRegisteredEvents;
  }, [allEvents, registeredEventIds]);

  const handleCancelRegistration = async (registrationId: string, eventId: string) => {
    Alert.alert(
      'Cancel Registration ⚠️',
      'Are you sure you want to cancel this registration? This action cannot be undone.',
      [
        {text: 'No, Keep It', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await registrationService.cancelRegistration(registrationId);
              cancelRegistration(eventId);
              addNotification(
                'Registration Cancelled 🚨',
                'Your registration has been cancelled successfully.',
                'alert'
              );
              Alert.alert('Cancelled', 'Your registration has been cancelled successfully.');
              fetchEventsData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Unable to cancel registration.');
            }
          },
        },
      ]
    );
  };

  const handleViewEvent = (registration: Registration) => {
    navigation.navigate('EventDetails', {eventId: registration.eventId});
  };

  const handleViewTicket = (registration: Registration) => {
    navigation.navigate('Ticket', { registrationId: registration.id || registration._id, registration });
  };

  const handleDeleteOrganized = (event: Event) => {
    Alert.alert(
      'Delete Event 🗑️',
      `Are you sure you want to permanently delete your event "${event.name}"? This will remove it for everyone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await eventService.deleteEvent(event.id);
              if (success) {
                addNotification(
                  'Event Deleted 🗑️',
                  `Your event "${event.name}" was successfully deleted.`,
                  'alert'
                );
                Alert.alert('Deleted', 'Event deleted successfully.');
                fetchEventsData();
              } else {
                Alert.alert('Error', 'Unable to delete the event.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Server error deleting event.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header Tabs */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>My Events</Text>
        <View style={[styles.tabBar, {backgroundColor: colors.lavender, borderColor: colors.border}]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'registered' && {backgroundColor: colors.primary}]}
            onPress={() => setActiveTab('registered')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, {color: colors.primary}, activeTab === 'registered' && {color: colors.white}]}>
              Registered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'organized' && {backgroundColor: colors.primary}]}
            onPress={() => setActiveTab('organized')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, {color: colors.primary}, activeTab === 'organized' && {color: colors.white}]}>
              Organized
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEventsData(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading your registered events...</Text>
          </View>
        ) : activeTab === 'registered' ? (
          // REGISTERED EVENTS LIST
          registrations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={[styles.emptyText, {color: colors.text}]}>No Registered Events Yet</Text>
              <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                Explore events and register for something exciting!
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, {backgroundColor: colors.primary}]}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.8}
              >
                <Text style={[styles.exploreBtnText, {color: colors.white}]}>Explore Events</Text>
              </TouchableOpacity>
            </View>
          ) : (
            registrations.map(registration => (
              <RegisteredEventCard
                key={registration.id}
                registration={registration}
                onViewEvent={() => handleViewEvent(registration)}
                onViewTicket={() => handleViewTicket(registration)}
              />
            ))
          )
        ) : (
          // ORGANIZED EVENTS LIST
          organizedEvents.map(event => (
            <View
              key={event.id}
              style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}
            >
              <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
              <View style={styles.info}>
                <Text style={[styles.eventName, {color: colors.text}]}>{event.name}</Text>
                <Text style={[styles.college, {color: colors.primary}]}>{event.college}</Text>
                <Text style={[styles.meta, {color: colors.textSecondary}]}>
                  {event.date} • {event.location || event.venue}
                </Text>
                <Text style={[styles.limitText, {color: colors.textSecondary}]}>
                  Limit: {event.registrationLimit} participants
                </Text>
                <Text style={[styles.feeText, {color: colors.accent}]}>
                  {event.registrationType === 'paid' ? `₹${event.registrationFee}` : 'FREE'}
                </Text>
                
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.detailsBtn, {backgroundColor: colors.primary}]}
                    onPress={() => navigation.navigate('EventDetails', {eventId: event._id})}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailsText}>View</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.editBtn, {borderColor: colors.primary}]}
                      onPress={() => navigation.navigate('CreateEvent', {event})}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.editBtnText, {color: colors.primary}]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.cancelBtn, {borderColor: Colors.danger}]}
                      onPress={() => handleDeleteOrganized(event)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Organizer Actions: View Participants + Scan QR */}
                <View style={{height: 1, backgroundColor: colors.border, marginVertical: 12}} />
                <View style={styles.participantActionsRow}>
                  <TouchableOpacity
                    style={[styles.participantsBtn, {flex: 1, backgroundColor: colors.lavender, borderColor: colors.primary}]}
                    onPress={() => navigation.navigate('EventParticipants', {eventId: event.id || event._id, eventName: event.name, collegeName: event.college})}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.participantsBtnText, {color: colors.primary}]}>👥 Participants</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.participantsBtn, {flex: 1, backgroundColor: '#F0FDF4', borderColor: Colors.success}]}
                    onPress={() => navigation.navigate('ScanQR', {eventId: event.id || event._id, eventName: event.name})}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.participantsBtnText, {color: Colors.success}]}>📷 Scan QR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Empty State for Organized Events */}
        {activeTab === 'organized' && organizedEvents.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={[styles.emptyText, {color: colors.text}]}>No Organized Events</Text>
            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
              You haven't hosted any events yet. Organize your first college symposium or workshop!
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, {backgroundColor: colors.primary}]}
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.8}
            >
              <Text style={[styles.exploreBtnText, {color: colors.white}]}>Create Event</Text>
            </TouchableOpacity>
          </View>
        )}

        {errorMsg && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, {color: colors.text}]}>{errorMsg}</Text>
            <TouchableOpacity
              style={[styles.exploreBtn, {backgroundColor: colors.primary}]}
              onPress={() => fetchEventsData()}
              activeOpacity={0.8}
            >
              <Text style={[styles.exploreBtnText, {color: colors.white}]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    height: 48,
  },
  tabButton: {
    flex: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 130,
  },
  info: {
    padding: 16,
    gap: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
  },
  college: {
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  limitText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  feeText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  statusCheck: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  exploreBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  participantsBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantsBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  participantActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default MyEventsScreen;
