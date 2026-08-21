import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, StatusBar, SafeAreaView, Platform, TouchableOpacity} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';
import {Registration} from '../services/registrationService';

interface SuccessScreenProps {
  route: {
    params: {
      event: Event;
      student: any;
      registration?: Registration;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({route, navigation}) => {
  const {event, student, registration} = route.params;
  const {colors, isDarkMode} = useTheme();
  const {registerForEvent, refreshNotifications} = useApp();
  const [regId, setRegId] = useState(registration?.registrationId || '');

  useEffect(() => {
    if (!regId) {
      const randomId = `FST-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegId(randomId);
    }

    // Register event in global state / local storage
    registerForEvent(event.id);

    // Refresh notifications from backend — the registration controller
    // already created the notification in MongoDB when registration was saved.
    refreshNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={[styles.container, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          
          {/* Custom SVG Checkmark Icon */}
          <View style={styles.iconContainer}>
            <Svg width={80} height={80} viewBox="0 0 80 80">
              <Circle cx={40} cy={40} r={38} fill={isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#E8F9EE'} stroke={Colors.success} strokeWidth={3} />
              <Path
                d="M26 40 L35 49 L54 30"
                fill="none"
                stroke={Colors.success}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={[styles.title, {color: colors.text}]}>Registration Successful!</Text>
          <Text style={[styles.subtitle, {color: colors.primary}]}>{event.name}</Text>

          {/* Ticket ID Card Details */}
          <View style={[styles.detailsBox, {backgroundColor: colors.background, borderColor: colors.border}]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>STUDENT</Text>
              <Text style={[styles.detailValue, {color: colors.text}]}>{student.name}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>DATE & TIME</Text>
              <Text style={[styles.detailValue, {color: colors.text}]}>{event.date} • {event.time}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>VENUE</Text>
              <Text style={[styles.detailValue, {color: colors.text}]}>{event.location}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>PAYMENT STATUS</Text>
              <Text style={[styles.detailValue, {color: event.isFree ? Colors.primary : Colors.success}]}>
                {event.isFree ? 'Free Entry' : 'Paid (Online)'}
              </Text>
            </View>
          </View>

          {/* Ticket ID Badge */}
          <View style={[styles.idBadge, {backgroundColor: isDarkMode ? 'rgba(255, 79, 163, 0.12)' : '#FFF2F9', borderColor: isDarkMode ? '#5B2BFF' : '#FFD3EC'}]}>
            <Text style={[styles.idLabel, {color: colors.textSecondary}]}>REGISTRATION ID</Text>
            <Text style={[styles.idValue, {color: colors.accent}]}>{regId}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="View Ticket"
              onPress={() => navigation.navigate('Ticket', { registrationId: registration?.id || registration?._id || '', registration })}
            />
            <View style={{height: 12}} />
            <TouchableOpacity 
              onPress={() => navigation.navigate('MainApp', {screen: 'MyEvents'})}
              style={{paddingVertical: 12, alignItems: 'center'}}
              activeOpacity={0.7}
            >
              <Text style={{color: colors.primary, fontWeight: '700', fontSize: 16}}>Go to My Events</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '700',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsBox: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  idBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  idLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  idValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default SuccessScreen;
