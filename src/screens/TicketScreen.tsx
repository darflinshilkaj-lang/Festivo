import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, Image, StatusBar, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity} from 'react-native';
import Colors from '../constants/Colors';
import {Registration} from '../services/registrationService';
import {registrationService} from '../services/registrationService';
import {useTheme} from '../context/ThemeContext';
import QRCode from 'react-native-qrcode-svg';

interface TicketScreenProps {
  route: {
    params: {
      registrationId: string;
      registration?: Registration;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const defaultFallbackImage = require('../assets/images/college_fest.jpg');

const TicketScreen: React.FC<TicketScreenProps> = ({route, navigation}) => {
  const {registrationId, registration: passedRegistration} = route.params;
  const {colors, isDarkMode} = useTheme();

  // Always start with null and always fetch from backend so we get the
  // server-assigned registrationId (handles old registrations that lacked one).
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      // Determine which ID to use for the backend lookup.
      // Prefer the MongoDB _id passed via navigation (most reliable).
      const lookupId =
        (passedRegistration?.id || passedRegistration?._id || registrationId || '').trim();

      if (!lookupId) {
        setLoading(false);
        setError('Registration not found');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedReg = await registrationService.getRegistrationById(lookupId);
        if (!fetchedReg) {
          setError('Registration not found');
        } else {
          setRegistration(fetchedReg);
        }
      } catch (err: any) {
        if (err.message?.includes('Network') || err.message?.includes('connect')) {
          setError('Unable to connect to Festivo server');
        } else {
          setError(err.message || 'Unable to load ticket');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Fetching ticket details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !registration) {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.centerBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, {color: colors.text}]}>{error || 'Registration not found'}</Text>
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

  // Resolve Image source
  let bannerImageSource = defaultFallbackImage;
  const rawImage = registration.eventImage;
  if (rawImage) {
    if (typeof rawImage === 'number') {
      bannerImageSource = rawImage;
    } else if (typeof rawImage === 'object' && rawImage.uri) {
      bannerImageSource = rawImage;
    } else if (typeof rawImage === 'string' && rawImage.startsWith('http')) {
      bannerImageSource = {uri: rawImage};
    }
  }

  // Formatting variables
  const isFree = registration.registrationType === 'free';
  const displayFee = isFree ? 'FREE' : `₹${registration.registrationFee}`;
  const displayPaymentStatus = isFree ? 'Not Required' : (registration.paymentStatus === 'completed' ? 'Paid' : 'Pending');

  // Format Date safely
  let dateStr = 'Upcoming';
  if (registration.eventDate) {
    const d = new Date(registration.eventDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  const qrValue = JSON.stringify({
    registrationId: registration.registrationId,
    eventId: registration.eventId,
  });

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={[styles.container, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
        
        {/* Header Banner */}
        <View style={styles.bannerContainer}>
          <Image source={bannerImageSource} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.headerOverlay}>
            <View style={styles.backRow}>
              <Text style={styles.backBtn} onPress={() => navigation.goBack()}>← Back</Text>
            </View>
          </View>
        </View>

        {/* Ticket Container */}
        <View style={[styles.ticketCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          
          <Text style={[styles.brandTitle, {color: colors.primary}]}>FESTIVO</Text>
          <View style={[styles.dashDivider, {borderColor: colors.border}]} />

          {/* Event Details */}
          <Text style={[styles.eventName, {color: colors.text}]}>{registration.eventName}</Text>
          <Text style={styles.collegeName}>{registration.eventCollege}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={[styles.metaVal, {color: colors.text}]}>{dateStr}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>TIME</Text>
              <Text style={[styles.metaVal, {color: colors.text}]}>
                {registration.startTime || '09:00 AM'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColFull}>
              <Text style={styles.metaLabel}>VENUE</Text>
              <Text style={[styles.metaVal, {color: colors.text}]}>{registration.venue || 'Campus Auditorium'}</Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Student Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>STUDENT NAME</Text>
              <Text style={[styles.metaVal, {color: colors.text}]}>{registration.studentName}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>STATUS</Text>
              <Text style={[styles.statusBadge, {color: Colors.success, backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE'}]}>
                {registration.registrationStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Fee & Payment */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>REGISTRATION FEE</Text>
              <Text style={[styles.metaVal, {color: colors.text}]}>{displayFee}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>PAYMENT STATUS</Text>
              <Text style={[styles.metaVal, {color: isFree ? colors.textSecondary : Colors.success}]}>
                {displayPaymentStatus}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Registration ID */}
          <View style={styles.regIdContainer}>
            <Text style={styles.metaLabel}>REGISTRATION ID</Text>
            <Text style={[styles.registrationIdText, {color: colors.accent}]}>
              {registration.registrationId}
            </Text>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={150}
              color={Colors.textDark}
              backgroundColor={colors.card}
            />
            <Text style={[styles.qrTip, {color: colors.textSecondary}]}>
              Show this QR code at the entry gate
            </Text>
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
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
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
  bannerContainer: {
    height: 180,
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
  ticketCard: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: 'KaushanScript-Regular',
    textAlign: 'center',
    letterSpacing: 2,
  },
  dashDivider: {
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaColFull: {
    width: '100%',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  regIdContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  registrationIdText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  qrTip: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default TicketScreen;
