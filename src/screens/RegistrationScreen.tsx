import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View, StatusBar, SafeAreaView, Platform, KeyboardAvoidingView} from 'react-native';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';
import {registrationService} from '../services/registrationService';

interface RegistrationScreenProps {
  route: {
    params: {
      event: Event;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({route, navigation}) => {
  const {event} = route.params;
  const {student, registerForEvent} = useApp();
  const {colors, isDarkMode} = useTheme();

  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [college, setCollege] = useState(student.college);
  const [department, setDepartment] = useState(student.department);
  const [year, setYear] = useState(student.year);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedCollege = college.trim();
    const trimmedDept = department.trim();
    const trimmedYear = year.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedCollege || !trimmedDept || !trimmedYear) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      // Call the actual registration API
      const registration = await registrationService.createRegistration(event.id);
      
      // Update local state
      registerForEvent(event.id);
      
      if (event.registrationType === 'free') {
        navigation.navigate('Success', { event, student, registration });
      } else {
        // For paid events, navigate to payment screen
        navigation.navigate('Payment', { event, student, registration });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={[styles.container, {backgroundColor: colors.background}]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Back navigation */}
          <View style={styles.header}>
            <Text style={[styles.backBtn, {color: colors.primary}]} onPress={() => navigation.goBack()}>← Back</Text>
          </View>

        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Text style={[styles.title, {color: colors.text}]}>Student Registration</Text>
          <Text style={styles.subtitle}>Registering for {event.name}</Text>

          <View style={styles.form}>
            <CustomInput
              icon="👤"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            
            <CustomInput
              icon="✉"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <CustomInput
              icon="📞"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="numeric"
            />
            
            <CustomInput
              icon="🏛️"
              placeholder="College Name"
              value={college}
              onChangeText={setCollege}
            />
            
            <CustomInput
              icon="🔬"
              placeholder="Department / Branch"
              value={department}
              onChangeText={setDepartment}
            />
            
            <CustomInput
              icon="🎓"
              placeholder="Year of Study (e.g. 3rd Year)"
              value={year}
              onChangeText={setYear}
            />

            <View style={styles.buttonSpacing}>
              <CustomButton
                title={event.registrationType === 'free' ? 'Complete Free Registration' : 'Continue to Payment'}
                onPress={handleNext}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: statusBarHeight,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  backBtn: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    padding: 4,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
  },
  form: {
    marginTop: 4,
  },
  buttonSpacing: {
    marginTop: 8,
  },
});

export default RegistrationScreen;
