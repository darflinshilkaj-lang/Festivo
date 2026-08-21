import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, Image, StatusBar, SafeAreaView, Platform, Alert, ActivityIndicator, TouchableOpacity} from 'react-native';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';
import {registrationService} from '../services/registrationService';
import {eventService} from '../services/eventService';

interface EventDetailsScreenProps {
  route: {
    params?: {
      event?: Event;
      eventId?: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const defaultFallbackImage = require('../assets/images/college_fest.jpg');

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({route, navigation}) => {
  const routeParams = route?.params ?? {};
  const {event: passedEvent, eventId} = routeParams;
  const {colors, isDarkMode} = useTheme();
  const {registeredEventIds, registerForEvent, student} = useApp();
  
  const [event, setEvent] = useState<Event | null>(passedEvent || null);
  const [loading, setLoading] = useState(!passedEvent);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'available' | 'full' | 'deadline' | 'registered'>('available');

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (passedEvent) {
        setEvent(passedEvent);
        setLoading(false);
        setError(null);
        return;
      }

      const safeEventId = eventId?.trim();
      if (!safeEventId) {
        setLoading(false);
        setError('Event not found');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedEvent = await eventService.getEventById(safeEventId);
        setEvent(fetchedEvent);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [passedEvent, eventId]);

  useEffect(() => {
    if (!event) return;

    // Check if user is already registered
    const currentEventId = event._id || event.id;
    if (registeredEventIds.includes(currentEventId)) {
      setIsRegistered(true);
      setRegistrationStatus('registered');
    } else {
      // Check event availability
      const maxParticipants = event.registrationLimit || 100;
      const currentParticipants = event.registeredParticipants || 0;
      
      if (currentParticipants >= maxParticipants) {
        setRegistrationStatus('full');
      } else if (event.registrationDeadline) {
        const deadline = new Date(event.registrationDeadline);
        const now = new Date();
        if (now > deadline) {
          setRegistrationStatus('deadline');
        }
      }
    }
  }, [event, registeredEventIds]);

  const handleRegister = async () => {
    if (isRegistered || registrationStatus !== 'available' || !event) {
      return;
    }
    setIsRegistering(true);
    try {
      navigation.navigate('Registration', {event});
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to start registration. Please try again.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Safely resolve image source
  let bannerImageSource = defaultFallbackImage;
  if (event?.image) {
    if (typeof event.image === 'number') {
      bannerImageSource = event.image;
    } else if (typeof event.image === 'object' && event.image.uri) {
      bannerImageSource = event.image;
    } else if (typeof event.image === 'string' && event.image.startsWith('http')) {
      bannerImageSource = {uri: event.image};
    }
  }

  const titleText = event?.title || event?.name || 'Event';
  const typeText = (event?.eventType || event?.type || 'Event').toUpperCase();
  const venueText = event?.venue || event?.location || 'Venue';
  const timeText = event?.startTime || event?.time || 'Time';
  const organizerText = event?.organizer || event?.college || 'Organizer';

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.centerBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, {color: colors.text}]}>{error || 'Event not found'}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, {backgroundColor: colors.primary}]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={[styles.container, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
        
        {/* Event Header Banner */}
        <View style={styles.bannerContainer}>
          <Image source={bannerImageSource} style={styles.bannerImage} resizeMode="cover" />
          
          {/* Header overlay for back button */}
          <View style={styles.headerOverlay}>
            <View style={styles.backRow}>
              <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
            </View>
          </View>
        </View>

        {/* Content Details */}
        <View style={[styles.contentCard, {backgroundColor: colors.background}]}>
          <Text style={[styles.typeBadge, {backgroundColor: colors.lavender, color: colors.primary, borderColor: colors.border}]}>
            {typeText}
          </Text>
          <Text style={[styles.title, {color: colors.text}]}>{titleText}</Text>
          <Text style={styles.college}>{event.college}</Text>

          {/* Spaced Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={[styles.metaBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={[styles.metaValue, {color: colors.text}]}>{event.date}</Text>
            </View>
            <View style={[styles.metaBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={styles.metaLabel}>TIME</Text>
              <Text style={[styles.metaValue, {color: colors.text}]}>{timeText}</Text>
            </View>
            <View style={[styles.metaBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={styles.metaLabel}>VENUE</Text>
              <Text style={[styles.metaValue, {color: colors.text}]}>{venueText}</Text>
            </View>
          </View>

          {event.registrationDeadline && (
            <View style={{marginBottom: 20}}>
              <Text style={{fontSize: 12, fontWeight: '700', color: colors.textSecondary}}>
                REGISTRATION DEADLINE: <Text style={{color: Colors.danger}}>{new Date(event.registrationDeadline).toLocaleDateString()}</Text>
              </Text>
            </View>
          )}

          {/* Description Section */}
          <Text style={[styles.sectionHeader, {color: colors.text}]}>About Event</Text>
          <Text style={[styles.description, {color: colors.textSecondary}]}>{event.description}</Text>

          {/* Rules Section */}
          {event.rules && event.rules.length > 0 && (
            <View style={styles.rulesSection}>
              <Text style={[styles.sectionHeader, {color: colors.text}]}>Rules & Guidelines</Text>
              {event.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Text style={[styles.ruleBullet, {color: colors.primary}]}>•</Text>
                  <Text style={[styles.ruleText, {color: colors.textSecondary}]}>{rule}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Organizer / Coordinator Section */}
          {(event.coordinator || organizerText) && (
            <View style={[styles.coordinatorBox, {backgroundColor: colors.lavender, borderColor: colors.border}]}>
              <Text style={[styles.coordinatorTitle, {color: colors.primary}]}>Organizer Details</Text>
              <Text style={[styles.coordinatorName, {color: colors.text}]}>
                {organizerText}
              </Text>
              {event.coordinator ? (
                <Text style={[styles.coordinatorPhone, {color: colors.textSecondary}]}>
                  Coordinator: {event.coordinator}
                </Text>
              ) : null}
              {event.phone ? (
                <Text style={[styles.coordinatorPhone, {color: colors.textSecondary}]}>
                  Contact: {event.phone}
                </Text>
              ) : null}
            </View>
          )}

          {/* Footer Registration Action */}
          <View style={[styles.footerRow, {backgroundColor: colors.card, borderColor: colors.border}]}>
            {/* Left: Fee + participant count */}
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, {color: colors.textSecondary}]}>Registration Fee</Text>
              <Text style={styles.fee}>
                {event.registrationType === 'paid' ? `₹${event.registrationFee}` : 'FREE'}
              </Text>
              <Text style={[styles.participantLabel, {color: colors.textSecondary}]}>
                {event.registeredParticipants || 0} / {event.registrationLimit || 100} registered
              </Text>
            </View>

            {/* Right: Register button OR Registered badge */}
            <View style={styles.actionContainer}>
              {isRegistered ? (
                <View style={[styles.registeredBadge, {backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE', borderColor: Colors.success}]}>
                  <Text style={[styles.registeredBadgeText, {color: Colors.success}]}>✓ Registered</Text>
                </View>
              ) : registrationStatus === 'full' ? (
                <View style={[styles.registeredBadge, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEE2E2', borderColor: Colors.danger}]}>
                  <Text style={[styles.registeredBadgeText, {color: Colors.danger}]}>Registration Full</Text>
                </View>
              ) : registrationStatus === 'deadline' ? (
                <View style={[styles.registeredBadge, {backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : '#FEF3C7', borderColor: '#F59E0B'}]}>
                  <Text style={[styles.registeredBadgeText, {color: '#F59E0B'}]}>Deadline Passed</Text>
                </View>
              ) : (
                <CustomButton
                  title={event.registrationType === 'paid' ? `Register  ₹${event.registrationFee}` : 'Register Now'}
                  onPress={handleRegister}
                  loading={isRegistering}
                  style={styles.registerButton}
                  textStyle={styles.registerButtonText}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  bannerContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 44 : 34,
    paddingHorizontal: 20,
  },
  backRow: {
    flexDirection: 'row',
  },
  backBtn: {
    color: Colors.white,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '700',
    overflow: 'hidden',
  },
  contentCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lavender,
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
  },
  college: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  metaBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: Colors.textGray,
    lineHeight: 23,
    fontWeight: '500',
    marginBottom: 30,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textGray,
    fontWeight: '600',
  },
  fee: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.accent,
    marginTop: 2,
  },
  participantLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  actionContainer: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  registerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    alignSelf: 'flex-end',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  registeredBadge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registeredBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rulesSection: {
    marginBottom: 26,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  ruleBullet: {
    fontSize: 16,
    lineHeight: 18,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
  coordinatorBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 30,
  },
  coordinatorTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  coordinatorName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  coordinatorPhone: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default EventDetailsScreen;

