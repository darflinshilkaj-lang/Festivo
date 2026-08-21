import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import Colors from '../constants/Colors';
import {Registration} from '../services/registrationService';
import {useTheme} from '../context/ThemeContext';

interface RegisteredEventCardProps {
  registration: Registration;
  onViewEvent: () => void;
  onViewTicket: () => void;
}

const defaultFallbackImage = require('../assets/images/college_fest.jpg');

const RegisteredEventCard: React.FC<RegisteredEventCardProps> = ({
  registration,
  onViewEvent,
  onViewTicket,
}) => {
  const {colors, isDarkMode} = useTheme();

  // Safely resolve image source
  let bannerImageSource = defaultFallbackImage;
  if (typeof registration.eventImage === 'number') {
    bannerImageSource = registration.eventImage;
  } else if (registration.eventImage && typeof registration.eventImage === 'object' && registration.eventImage.uri) {
    bannerImageSource = registration.eventImage;
  } else if (typeof registration.eventImage === 'string' && registration.eventImage.startsWith('http')) {
    bannerImageSource = {uri: registration.eventImage};
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time;
  };

  const getPaymentStatusColor = () => {
    switch (registration.paymentStatus) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.accent;
      case 'failed':
        return Colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getRegistrationStatusColor = () => {
    switch (registration.registrationStatus) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.accent;
      case 'cancelled':
        return Colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getPaymentStatusText = () => {
    if (registration.registrationType === 'free') {
      return 'Not Required';
    }
    switch (registration.paymentStatus) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return registration.paymentStatus;
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
      <Image source={bannerImageSource} style={styles.eventImage} resizeMode="cover" />
      
      <View style={styles.content}>
        <Text style={[styles.eventName, {color: colors.text}]}>{registration.eventName}</Text>
        <Text style={[styles.collegeName, {color: colors.primary}]}>{registration.eventCollege}</Text>
        
        <View style={styles.metaRow}>
          <Text style={[styles.eventType, {color: colors.textSecondary}]}>
            {registration.eventType || 'Event'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>📅</Text>
          <Text style={[styles.infoText, {color: colors.text}]}>
            {formatDate(registration.eventDate)}
          </Text>
        </View>

        {registration.startTime && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>⏰</Text>
            <Text style={[styles.infoText, {color: colors.text}]}>
              {formatTime(registration.startTime)}
              {registration.endTime && ` - ${formatTime(registration.endTime)}`}
            </Text>
          </View>
        )}

        {registration.venue && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>📍</Text>
            <Text style={[styles.infoText, {color: colors.text}]}>{registration.venue}</Text>
          </View>
        )}

        {registration.organizer && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>👤</Text>
            <Text style={[styles.infoText, {color: colors.text}]}>{registration.organizer}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.feeRow}>
          <Text style={[styles.feeLabel, {color: colors.textSecondary}]}>Registration:</Text>
          <Text style={[styles.feeValue, {color: colors.accent}]}>
            {registration.registrationType === 'free' ? 'FREE' : `₹${registration.registrationFee}`}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, {color: colors.textSecondary}]}>Payment:</Text>
            <Text style={[styles.statusValue, {color: getPaymentStatusColor()}]}>
              {getPaymentStatusText()}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, {color: colors.textSecondary}]}>Status:</Text>
            <Text style={[styles.statusValue, {color: getRegistrationStatusColor()}]}>
              {registration.registrationStatus.charAt(0).toUpperCase() + registration.registrationStatus.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.viewEventButton, {backgroundColor: colors.primary}]}
            onPress={onViewEvent}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>VIEW EVENT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.viewTicketButton, {borderColor: colors.primary}]}
            onPress={onViewTicket}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewTicketButtonText, {color: colors.primary}]}>VIEW TICKET</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    marginBottom: 8,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewEventButton: {
    flex: 1,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  viewTicketButton: {
    flex: 1,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  viewTicketButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RegisteredEventCard;
