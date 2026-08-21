import React, {useState} from 'react';
import {
  Alert,
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
import Svg, {Path, Defs, LinearGradient as SvgGradient, Stop, G, Circle, Text as SvgText} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Colors';
import {appName, tagline} from '../constants/Strings';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import {useApp} from '../context/AppContext';
import {authService} from '../services/authService';

const {width} = Dimensions.get('window');

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {updateStudent} = useApp();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === '') {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPassword === '') {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Login via backend auth API
      const result = await authService.loginUser({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      updateStudent(result.user);
      navigation.replace('MainApp');
    } catch (err: any) {
      const errorMessage = err?.message || 'Invalid email or password. Please try again.';
      Alert.alert('Login Failed', errorMessage);
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
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to continue to {appName}</Text>
              <Text style={styles.subtitle}>and explore amazing events.</Text>
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
          {/* Logo Section */}
          <View style={styles.logoSection}>
            {/* Custom Svg Ticket & Confetti Logo */}
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Defs>
                <SvgGradient id="ticketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#5B2BFF" />
                  <Stop offset="100%" stopColor="#FF4FA3" />
                </SvgGradient>
              </Defs>
              
              {/* Confetti Sparks */}
              <Circle cx={22} cy={22} r={2} fill="#FF4FA3" opacity={0.8} />
              <Circle cx={95} cy={32} r={2.5} fill="#5B2BFF" opacity={0.7} />
              <Circle cx={28} cy={72} r={1.5} fill="#5B2BFF" opacity={0.6} />
              <Circle cx={88} cy={68} r={2} fill="#FF4FA3" opacity={0.8} />
              
              {/* Sparkle diamonds */}
              <Path d="M42,16 L44,20 L48,20 L45,22 L46,26 L42,24 L38,26 L39,22 L36,20 L40,20 Z" fill="#8A4FFF" transform="scale(0.6) translate(15, -5)" opacity={0.7} />
              <Path d="M90,52 L92,56 L96,56 L93,58 L94,62 L90,60 L86,62 L87,58 L84,56 L88,56 Z" fill="#FF4FA3" transform="scale(0.5) translate(45, 20)" opacity={0.7} />

              {/* Rotated Ticket */}
              <G transform="translate(25, 20) rotate(-25, 35, 22.5)">
                <Path
                  d="M6,0 L64,0 A6,6 0 0,1 70,6 L70,15 A7,7 0 0,0 70,29 L70,39 A6,6 0 0,1 64,45 L6,45 A6,6 0 0,1 0,39 L0,29 A7,7 0 0,0 0,15 L0,6 A6,6 0 0,1 6,0 Z"
                  fill="url(#ticketGrad)"
                />
                {/* White Star */}
                <Path
                  d="M35,12.5 L37.9,18.5 L44.5,19.5 L39.7,24.2 L40.8,30.8 L35,27.7 L29.2,30.8 L30.3,24.2 L25.5,19.5 L32.1,18.5 Z"
                  fill="#FFFFFF"
                />
              </G>
            </Svg>

            {/* Logo Text */}
            <Svg width={250} height={70} viewBox="0 0 250 70">
              <Defs>
                <SvgGradient id="logoTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#5B2BFF" />
                  <Stop offset="100%" stopColor="#FF4FA3" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#logoTextGrad)"
                fontSize={46}
                fontFamily="KaushanScript-Regular"
                x={125}
                y={52}
                textAnchor="middle"
              >
                {appName}
              </SvgText>
            </Svg>
            <Text style={styles.tagline}>{tagline}</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>

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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
                activeOpacity={0.7}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton title="Sign In" onPress={handleLogin} loading={loading} />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}> Sign Up</Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textGray,
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
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
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: Colors.textGray,
    fontSize: 15,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginScreen;