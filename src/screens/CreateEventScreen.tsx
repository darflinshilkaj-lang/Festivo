import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/Colors';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {eventService} from '../services/eventService';
import {useApp} from '../context/AppContext';

interface CreateEventScreenProps {
  route?: {
    params?: {
      event?: Event;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const EVENT_TYPES = [
  'Symposium',
  'Workshop',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
];

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({route, navigation}) => {
  const {colors, isDarkMode} = useTheme();
  const {addNotification} = useApp();
  const editingEvent = route?.params?.event;

  // Form State
  const [eventName, setEventName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [eventType, setEventType] = useState('Symposium');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [registrationType, setRegistrationType] = useState<'free' | 'paid'>('free');
  const [registrationFee, setRegistrationFee] = useState('');
  const [rules, setRules] = useState('');
  const [coordinator, setCoordinator] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize fields if editing
  useEffect(() => {
    if (editingEvent) {
      setEventName(editingEvent.name || editingEvent.title || '');
      setCollegeName(editingEvent.college || '');
      setEventType(editingEvent.eventType || editingEvent.type || 'Symposium');
      setDescription(editingEvent.description || '');
      
      // Parse dates for text fields
      if (editingEvent.date) {
        let d = editingEvent.date;
        if (typeof d === 'object' && d !== null && 'toISOString' in d) {
          d = (d as any).toISOString().split('T')[0];
        } else if (typeof d === 'string' && d.includes('T')) {
          d = d.split('T')[0];
        }
        setEventDate(d);
      }
      
      setStartTime(editingEvent.startTime || editingEvent.time || '09:00 AM');
      setEndTime(editingEvent.endTime || '05:00 PM');
      setVenue(editingEvent.venue || editingEvent.location || '');
      setOrganizer(editingEvent.organizer || '');
      setOrganizerContact(editingEvent.phone || '');
      setMaxParticipants(String(editingEvent.registrationLimit || '100'));
      
      // Load registration type and fee
      setRegistrationType(editingEvent.registrationType || 'free');
      setRegistrationFee(editingEvent.registrationFee ? String(editingEvent.registrationFee) : '');
      
      // Load rules and coordinator
      setRules(editingEvent.rules ? (Array.isArray(editingEvent.rules) ? editingEvent.rules.join('\n') : String(editingEvent.rules)) : '');
      setCoordinator(editingEvent.coordinator || '');
      
      if (editingEvent.registrationDeadline) {
        let dl: string | Date = editingEvent.registrationDeadline;
        if (typeof dl === 'object' && dl !== null && 'toISOString' in dl) {
          dl = (dl as any).toISOString().split('T')[0];
        } else if (typeof dl === 'string' && dl.includes('T')) {
          dl = dl.split('T')[0];
        }
        setRegistrationDeadline(typeof dl === 'string' ? dl : '');
      }
      
      const rawImg = editingEvent.image;
      if (rawImg && typeof rawImg === 'object' && rawImg.uri) {
        setEventImage(rawImg.uri);
      } else if (typeof rawImg === 'string') {
        setEventImage(rawImg);
      }
    }
  }, [editingEvent]);

  // Form Validation helper
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!venue.trim()) newErrors.venue = 'Venue location is required';
    if (!organizer.trim()) newErrors.organizer = 'Organizer name is required';
    if (!coordinator.trim()) newErrors.coordinator = 'Coordinator name is required';

    // Date validations
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!eventDate.trim()) {
      newErrors.eventDate = 'Event date is required';
    } else if (!dateRegex.test(eventDate)) {
      newErrors.eventDate = 'Use format YYYY-MM-DD';
    } else {
      const parsedDate = new Date(eventDate);
      if (isNaN(parsedDate.getTime())) {
        newErrors.eventDate = 'Invalid event date';
      }
    }

    if (registrationDeadline.trim()) {
      if (!dateRegex.test(registrationDeadline)) {
        newErrors.registrationDeadline = 'Use format YYYY-MM-DD';
      } else {
        const parsedDeadline = new Date(registrationDeadline);
        const parsedEventDate = new Date(eventDate);
        if (isNaN(parsedDeadline.getTime())) {
          newErrors.registrationDeadline = 'Invalid deadline date';
        } else if (!isNaN(parsedEventDate.getTime()) && parsedDeadline > parsedEventDate) {
          newErrors.registrationDeadline = 'Deadline cannot be after event date';
        }
      }
    }

    // Number of participants validation
    const parsedMax = Number(maxParticipants);
    if (!maxParticipants.trim()) {
      newErrors.maxParticipants = 'Max participants count is required';
    } else if (isNaN(parsedMax) || parsedMax <= 0) {
      newErrors.maxParticipants = 'Must be a positive number';
    }

    // Phone validation
    const cleanPhone = organizerContact.replace(/\D/g, '');
    if (!organizerContact.trim()) {
      newErrors.organizerContact = 'Contact phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.organizerContact = 'Enter a valid 10-digit number';
    }

    // Registration type and fee validation
    if (!registrationType) {
      newErrors.registrationType = 'Please select registration type';
    }
    if (registrationType === 'paid') {
      if (!registrationFee.trim()) {
        newErrors.registrationFee = 'Please enter a registration fee for paid events';
      } else {
        const parsedFee = Number(registrationFee);
        if (isNaN(parsedFee) || parsedFee <= 0) {
          newErrors.registrationFee = 'Registration fee must be greater than ₹0';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error ⚠️', 'Please check and fill all the fields correctly.');
      return;
    }

    setLoading(true);

    const payload: any = {
      eventName,
      collegeName,
      eventType,
      description,
      eventDate: new Date(eventDate).toISOString(),
      startTime,
      endTime,
      venue,
      organizer,
      organizerContact,
      maxParticipants: Number(maxParticipants),
      registrationDeadline: registrationDeadline.trim() ? new Date(registrationDeadline).toISOString() : undefined,
      eventImage: eventImage.trim() || undefined,
      registrationType,
      registrationFee: registrationType === 'paid' ? Number(registrationFee) : 0,
      rules: rules.split('\n').filter(r => r.trim() !== ''),
      coordinator,
    };

    try {
      if (editingEvent) {
        console.log('UPDATE EVENT ID:', editingEvent.id);
        console.log('REQUEST BODY:', payload);

        const updatedResponse = await eventService.updateEvent(editingEvent.id, payload);
        console.log('API RESPONSE:', updatedResponse);

        addNotification(
          'Event Updated 📝',
          `Your event "${eventName}" was updated successfully.`,
          'success'
        );
        Alert.alert('Success 🎉', 'Event updated successfully.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        console.log('CREATE REQUEST BODY:', payload);
        const createdResponse = await eventService.createEvent(payload);
        console.log('API RESPONSE:', createdResponse);

        addNotification(
          'New Event Created 🚀',
          `Your event "${eventName}" was published successfully.`,
          'success'
        );
        Alert.alert('Success 🎉', 'Event created successfully.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MainApp', {screen: 'Home'});
            },
          },
        ]);
      }
    } catch (error: any) {
      console.warn('Error saving event:', error);
      console.log('API ERROR:', error);
      Alert.alert('Error ⚠️', error.message || 'Unable to save event. Please check details or server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, {backgroundColor: colors.card, borderColor: colors.border}]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, {color: colors.primary}]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          {editingEvent ? 'Edit Event' : 'Organize Event'}
        </Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Event Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Event Name *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.eventName ? Colors.danger : colors.border}]}
            placeholder="e.g. National Hackfest 2026"
            placeholderTextColor={colors.textSecondary}
            value={eventName}
            onChangeText={setEventName}
          />
          {errors.eventName && <Text style={styles.errorText}>{errors.eventName}</Text>}
        </View>

        {/* College Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>College Name *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.collegeName ? Colors.danger : colors.border}]}
            placeholder="e.g. IIT Madras"
            placeholderTextColor={colors.textSecondary}
            value={collegeName}
            onChangeText={setCollegeName}
          />
          {errors.collegeName && <Text style={styles.errorText}>{errors.collegeName}</Text>}
        </View>

        {/* Event Type Grid Selection */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Event Type *</Text>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map((type) => {
              const isSelected = eventType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setEventType(type)}
                  style={[
                    styles.typeChip,
                    {backgroundColor: colors.lavender},
                    isSelected && {backgroundColor: colors.primary},
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      {color: colors.primary},
                      isSelected && {color: colors.white},
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Registration Type */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Registration Type *</Text>
          <View style={styles.registrationTypeContainer}>
            <TouchableOpacity
              style={[
                styles.registrationTypeButton,
                {backgroundColor: colors.lavender, borderColor: colors.border},
                registrationType === 'free' && {backgroundColor: colors.primary, borderColor: colors.primary},
              ]}
              onPress={() => {
                setRegistrationType('free');
                setRegistrationFee('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.registrationTypeText,
                  {color: colors.primary},
                  registrationType === 'free' && {color: colors.white},
                ]}
              >
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.registrationTypeButton,
                {backgroundColor: colors.lavender, borderColor: colors.border},
                registrationType === 'paid' && {backgroundColor: colors.primary, borderColor: colors.primary},
              ]}
              onPress={() => setRegistrationType('paid')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.registrationTypeText,
                  {color: colors.primary},
                  registrationType === 'paid' && {color: colors.white},
                ]}
              >
                Paid
              </Text>
            </TouchableOpacity>
          </View>
          {errors.registrationType && <Text style={styles.errorText}>{errors.registrationType}</Text>}
        </View>

        {/* Registration Fee */}
        {registrationType === 'paid' && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, {color: colors.text}]}>Registration Fee (₹) *</Text>
            <TextInput
              style={[
                styles.input,
                {backgroundColor: colors.card, color: colors.text, borderColor: errors.registrationFee ? Colors.danger : colors.border},
              ]}
              placeholder="e.g. 500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={registrationFee}
              onChangeText={setRegistrationFee}
            />
            {errors.registrationFee && <Text style={styles.errorText}>{errors.registrationFee}</Text>}
          </View>
        )}

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Event Description *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {backgroundColor: colors.card, color: colors.text, borderColor: errors.description ? Colors.danger : colors.border},
            ]}
            placeholder="Describe your event highlights, rules, prizes, and key highlights..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Dates row */}
        <View style={styles.row}>
          {/* Event Date */}
          <View style={[styles.formGroup, {flex: 1}]}>
            <Text style={[styles.label, {color: colors.text}]}>Event Date *</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.eventDate ? Colors.danger : colors.border}]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={eventDate}
              onChangeText={setEventDate}
            />
            {errors.eventDate && <Text style={styles.errorText}>{errors.eventDate}</Text>}
          </View>

          {/* Registration Deadline */}
          <View style={[styles.formGroup, {flex: 1}]}>
            <Text style={[styles.label, {color: colors.text}]}>Reg. Deadline</Text>
            <TextInput
              style={[
                styles.input,
                {backgroundColor: colors.card, color: colors.text, borderColor: errors.registrationDeadline ? Colors.danger : colors.border},
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={registrationDeadline}
              onChangeText={setRegistrationDeadline}
            />
            {errors.registrationDeadline && (
              <Text style={styles.errorText}>{errors.registrationDeadline}</Text>
            )}
          </View>
        </View>

        {/* Times Row */}
        <View style={styles.row}>
          {/* Start Time */}
          <View style={[styles.formGroup, {flex: 1}]}>
            <Text style={[styles.label, {color: colors.text}]}>Start Time</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="e.g. 09:30 AM"
              placeholderTextColor={colors.textSecondary}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>

          {/* End Time */}
          <View style={[styles.formGroup, {flex: 1}]}>
            <Text style={[styles.label, {color: colors.text}]}>End Time</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="e.g. 04:30 PM"
              placeholderTextColor={colors.textSecondary}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        {/* Venue */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Venue / Location *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.venue ? Colors.danger : colors.border}]}
            placeholder="e.g. Main Auditorium, Block C"
            placeholderTextColor={colors.textSecondary}
            value={venue}
            onChangeText={setVenue}
          />
          {errors.venue && <Text style={styles.errorText}>{errors.venue}</Text>}
        </View>

        {/* Coordinator Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Coordinator Name *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.coordinator ? Colors.danger : colors.border}]}
            placeholder="e.g. Dr. Jane Doe"
            placeholderTextColor={colors.textSecondary}
            value={coordinator}
            onChangeText={setCoordinator}
          />
          {errors.coordinator && <Text style={styles.errorText}>{errors.coordinator}</Text>}
        </View>

        {/* Rules Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Event Rules (One per line)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {backgroundColor: colors.card, color: colors.text, borderColor: colors.border},
            ]}
            placeholder="e.g. Plagiarism of code is restricted&#10;Bring your college ID card"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={rules}
            onChangeText={setRules}
          />
        </View>

        {/* Organizer Name */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Organizer Name *</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: errors.organizer ? Colors.danger : colors.border}]}
            placeholder="e.g. Computer Science Association"
            placeholderTextColor={colors.textSecondary}
            value={organizer}
            onChangeText={setOrganizer}
          />
          {errors.organizer && <Text style={styles.errorText}>{errors.organizer}</Text>}
        </View>

        {/* Organizer Contact & Max Participants Row */}
        <View style={styles.row}>
          {/* Organizer Contact */}
          <View style={[styles.formGroup, {flex: 1.2}]}>
            <Text style={[styles.label, {color: colors.text}]}>Organizer Contact *</Text>
            <TextInput
              style={[
                styles.input,
                {backgroundColor: colors.card, color: colors.text, borderColor: errors.organizerContact ? Colors.danger : colors.border},
              ]}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={organizerContact}
              onChangeText={setOrganizerContact}
            />
            {errors.organizerContact && <Text style={styles.errorText}>{errors.organizerContact}</Text>}
          </View>

          {/* Max Participants */}
          <View style={[styles.formGroup, {flex: 0.8}]}>
            <Text style={[styles.label, {color: colors.text}]}>Max Participants *</Text>
            <TextInput
              style={[
                styles.input,
                {backgroundColor: colors.card, color: colors.text, borderColor: errors.maxParticipants ? Colors.danger : colors.border},
              ]}
              placeholder="e.g. 150"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
            />
            {errors.maxParticipants && <Text style={styles.errorText}>{errors.maxParticipants}</Text>}
          </View>
        </View>

        {/* Event Image URL */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Event Image URL</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
            placeholder="https://example.com/banner.jpg"
            placeholderTextColor={colors.textSecondary}
            keyboardType="url"
            value={eventImage}
            onChangeText={setEventImage}
          />
          <Text style={[styles.tipText, {color: colors.textSecondary}]}>
            Provide a direct image URL link or leave empty to use a preset template.
          </Text>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: colors.primary}]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={[styles.submitBtnText, {color: colors.white}]}>
              {editingEvent ? 'Save Changes' : 'Publish Event'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  registrationTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  registrationTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  registrationTypeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  tipText: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateEventScreen;
