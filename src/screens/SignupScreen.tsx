import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import {appName} from '../constants/Strings';
import {authService} from '../services/authService';
import {useApp} from '../context/AppContext';

interface SignupScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
}

const SignupScreen: React.FC<SignupScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {updateStudent, addNotification} = useApp();

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedCollege = college.trim();
    const trimmedDept = department.trim();
    const trimmedYear = year.trim();
    const trimmedPass = password.trim();
    const trimmedConfirmPass = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedCollege || !trimmedDept || !trimmedYear || !trimmedPass || !trimmedConfirmPass) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPass.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (trimmedPass !== trimmedConfirmPass) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Register user with backend
      const result = await authService.registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPass,
        department: trimmedDept,
        year: trimmedYear,
        college: trimmedCollege,
      });

      // Preserve phone in local profile state if provided
      const userProfile = {
        ...result.user,
        phone: trimmedPhone || result.user.phone || '',
      };

      updateStudent(userProfile);

      addNotification(
        'Welcome to Festivo! 🎉',
        'Account created successfully. Explore upcoming campus events and symposiums.',
        'success'
      );

      Alert.alert('Success 🎉', 'Registration successful! Welcome to Festivo.', [
        {
          text: 'Get Started',
          onPress: () => navigation.replace('MainApp'),
        },
      ]);
    } catch (err: any) {
      const errorMsg = err?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logoText}>{appName}</Text>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Festivo and discover campus events.</Text>

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
            placeholder="Phone Number (Optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <CustomInput
            icon="🏫"
            placeholder="College/University"
            value={college}
            onChangeText={setCollege}
          />

          <CustomInput
            icon="⚙️"
            placeholder="Department (e.g. CSE, IT)"
            value={department}
            onChangeText={setDepartment}
          />

          <CustomInput
            icon="📅"
            placeholder="Year of Study (e.g. 3rd Year)"
            value={year}
            onChangeText={setYear}
          />
          
          <CustomInput
            icon="🔒"
            placeholder="Create Password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomInput
            icon="🔒"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.buttonSpacing}>
            <CustomButton title="Create Account" onPress={handleSignup} loading={loading} />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.loginLink}> Sign In</Text>
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
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  logoText: {
    fontSize: 38,
    color: Colors.primary,
    fontFamily: 'KaushanScript-Regular',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'normal',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textGray,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonSpacing: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: Colors.textGray,
    fontSize: 15,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SignupScreen;
