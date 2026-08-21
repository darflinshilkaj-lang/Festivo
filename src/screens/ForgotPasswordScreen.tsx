import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import Svg, {Path, Defs, LinearGradient as SvgGradient, Stop} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

const {width} = Dimensions.get('window');

interface ForgotPasswordScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (email.trim() === '') {
      setSuccessMessage('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setSuccessMessage('Please enter a valid email');
      return;
    }

    if (newPassword.length < 6) {
      setSuccessMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSuccessMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      // Simulate network request
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      // Success
      setSuccessMessage('Password reset successfully.');
      
      // Navigate back to Login after 2 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (e) {
      setSuccessMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Upper Hero Section */}
        <ImageBackground
          source={require('../assets/images/login_hero_bg.jpg')}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(26, 10, 71, 0.95)', 'rgba(91, 43, 255, 0.85)']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientOverlay}
          >
            <View style={styles.heroContent}>
              <Text style={styles.welcomeText}>Forgot Password</Text>
              <Text style={styles.subtitle}>Reset your password to continue</Text>
              <Text style={styles.subtitle}>using Festivo.</Text>
            </View>
          </LinearGradient>

          {/* Bottom Wave Curve */}
          <Svg
            width={width}
            height={60}
            viewBox={`0 0 ${width} 60`}
            style={styles.curveSvg}
          >
            <Path
              d={`M 0 20 
                  C ${width * 0.35} 70, ${width * 0.65} 0, ${width} 40 
                  L ${width} 60 
                  L 0 60 
                  Z`}
              fill={Colors.background}
            />
          </Svg>
        </ImageBackground>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Form */}
          <View style={styles.formContainer}>
            <CustomInput
              icon="✉"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordWrap}>
              <CustomInput
                icon="🔒"
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordWrap}>
              <CustomInput
                icon="🔒"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Success/Error Message */}
            {successMessage ? (
              <Text style={[
                styles.messageText, 
                {color: successMessage === 'Password reset successfully.' ? Colors.success : '#FF4FA3'}
              ]}>
                {successMessage}
              </Text>
            ) : null}

            <CustomButton title="Reset Password" onPress={handleResetPassword} loading={loading} />

            <View style={styles.backContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.backLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroBackground: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  gradientOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 28,
    justifyContent: 'flex-start',
  },
  heroContent: {
    marginTop: 10,
  },
  welcomeText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    lineHeight: 22,
  },
  curveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: -10,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 20,
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 15,
    zIndex: 10,
    height: 40,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  backLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;
