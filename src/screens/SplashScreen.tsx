import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Animated, StatusBar, SafeAreaView, Dimensions} from 'react-native';
import Svg, {Path, Defs, LinearGradient as SvgGradient, Stop, G, Circle} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Colors';
import {tagline} from '../constants/Strings';
import {StorageService} from '../services/StorageService';
import {authService} from '../services/authService';
import {useApp} from '../context/AppContext';

const {width} = Dimensions.get('window');

interface SplashScreenProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

const SplashScreen: React.FC<SplashScreenProps> = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const {updateStudent, registerForEvent} = useApp();

  useEffect(() => {
    // Start fade & scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Check login state and load data from backend
    const checkLogin = async () => {
      try {
        const token = await StorageService.getToken();
        const savedEvents = await StorageService.getRegisteredEvents();

        // Display splash animation for 2 seconds
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

        if (token) {
          try {
            const profile = await authService.getProfile();
            if (profile) {
              updateStudent(profile);
              if (savedEvents && savedEvents.length > 0) {
                savedEvents.forEach(id => registerForEvent(id));
              }
              navigation.replace('MainApp');
              return;
            }
          } catch (e) {
            console.warn('Token validation failed on splash startup', e);
            await StorageService.clearSession();
          }
        }
        navigation.replace('Login');
      } catch (err) {
        console.error('Error checking splash session', err);
        navigation.replace('Login');
      }
    };

    checkLogin();
  }, [fadeAnim, scaleAnim, navigation, updateStudent, registerForEvent]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1F0642', '#3D0D80', '#631BB4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <Animated.View style={[styles.content, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
          {/* Custom Svg Ticket & Confetti Logo */}
          <View style={styles.logoContainer}>
            <Svg width={160} height={120} viewBox="0 0 120 90">
              <Defs>
                <SvgGradient id="splashTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFFFF" />
                  <Stop offset="100%" stopColor="#FFF0F8" />
                </SvgGradient>
              </Defs>
              
              {/* Confetti Sparks */}
              <Circle cx={22} cy={22} r={3} fill="#FF4FA3" opacity={0.9} />
              <Circle cx={95} cy={32} r={3.5} fill="#8A4FFF" opacity={0.8} />
              <Circle cx={28} cy={72} r={2.5} fill="#8A4FFF" opacity={0.7} />
              <Circle cx={88} cy={68} r={3} fill="#FF4FA3" opacity={0.9} />
              
              {/* Rotated Ticket */}
              <G transform="translate(25, 20) rotate(-25, 35, 22.5)">
                <Path
                  d="M6,0 L64,0 A6,6 0 0,1 70,6 L70,15 A7,7 0 0,0 70,29 L70,39 A6,6 0 0,1 64,45 L6,45 A6,6 0 0,1 0,39 L0,29 A7,7 0 0,0 0,15 L0,6 A6,6 0 0,1 6,0 Z"
                  fill="url(#splashTicketGrad)"
                />
                {/* Star inside logo */}
                <Path
                  d="M35,12.5 L37.9,18.5 L44.5,19.5 L39.7,24.2 L40.8,30.8 L35,27.7 L29.2,30.8 L30.3,24.2 L25.5,19.5 L32.1,18.5 Z"
                  fill="#5B2BFF"
                />
              </G>
            </Svg>
          </View>

          <Text style={styles.titleText}>𝓕𝓮𝓼𝓽𝓲𝓿𝓸</Text>
          <View style={styles.taglineBorder}>
            <Text style={styles.taglineText}>{tagline}</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1F0642',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  titleText: {
    fontSize: 54,
    color: '#FFFFFF',
    fontFamily: 'Satisfy-Regular',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 6,
    textAlign: 'center',
    marginVertical: 4,
  },
  taglineBorder: {
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4.5,
    textAlign: 'center',
  },
});

export default SplashScreen;
