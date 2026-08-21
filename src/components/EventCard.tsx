import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Colors from '../constants/Colors';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const EventCard: React.FC<EventCardProps> = ({event, onPress}) => {
  const {colors} = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={[styles.title, {color: colors.text}]}>{event.name}</Text>
        <Text style={styles.college}>{event.college}</Text>
        <Text style={[styles.meta, {color: colors.textSecondary}]}>{event.date} • {event.location}</Text>
        <View style={styles.footer}>
          <Text style={styles.fee}>
            {event.registrationType === 'paid' ? `₹${event.registrationFee}` : 'FREE'}
          </Text>
          <Text style={[styles.cta, {color: colors.primary}]}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  info: {
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  college: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  fee: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  cta: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default EventCard;
