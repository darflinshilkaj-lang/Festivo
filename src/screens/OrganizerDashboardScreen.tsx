import React, {useEffect} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface OrganizerDashboardScreenProps {
  navigation: {
    goBack: () => void;
    replace: (screen: string, params?: any) => void;
    navigate: (screen: string, params?: any) => void;
  };
}

// Custom SVG Icons for Organizer Dashboard
const OrganizerIcon = ({name, color = Colors.primary}: {name: string; color?: string}) => {
  let path = '';
  if (name === 'create') {
    // Plus shape
    path = 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z';
  } else if (name === 'events') {
    // Calendar/Ticket shape
    path = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z';
  } else if (name === 'users') {
    // People shape
    path = 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z';
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d={path} fill={color} />
    </Svg>
  );
};

const OrganizerDashboardScreen: React.FC<OrganizerDashboardScreenProps> = ({navigation}) => {
  const {student} = useApp();
  const {colors, isDarkMode} = useTheme();

  // Route Guard: Access control removed to allow all students to organize events
  useEffect(() => {
    // Accessible by all authenticated students
  }, [student, navigation]);

  const handleFeaturePress = (featureName: string) => {
    Alert.alert(
      'Coming Soon 🚀',
      `${featureName} functionality will be available in Phase 5.`
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, {backgroundColor: colors.card, borderColor: colors.border}]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, {color: colors.primary}]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Organizer Dashboard</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner Card */}
        <View style={[styles.bannerCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <LinearGradient
            colors={isDarkMode ? ['#8A4FFF', '#FF4FA3'] : [Colors.primary, Colors.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.roleBadge}
          >
            <Text style={styles.badgeText}>STUDENT ORGANIZER</Text>
          </LinearGradient>

          <Text style={[styles.title, {color: colors.text}]}>Manage Your Events</Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            Create new symposiums, coordinate cultural events, and keep track of registrations.
          </Text>
        </View>

        {/* Dashboard Actions */}
        <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>TOOLS</Text>

        {/* 1. Create Event */}
        <TouchableOpacity
          style={[styles.menuCard, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => navigation.navigate('CreateEvent')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, {backgroundColor: colors.lavender}]}>
            <OrganizerIcon name="create" color={colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, {color: colors.text}]}>Create Event</Text>
            <Text style={[styles.menuDesc, {color: colors.textSecondary}]}>Create a new festival or symposium event</Text>
          </View>
          <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
        </TouchableOpacity>

        {/* 2. My Organized Events */}
        <TouchableOpacity
          style={[styles.menuCard, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => navigation.navigate('MainApp', {screen: 'MyEvents', params: {tab: 'organized'}})}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, {backgroundColor: colors.lavender}]}>
            <OrganizerIcon name="events" color={colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, {color: colors.text}]}>My Organized Events</Text>
            <Text style={[styles.menuDesc, {color: colors.textSecondary}]}>Manage details for your existing events</Text>
          </View>
          <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
        </TouchableOpacity>

        {/* 3. Manage Registrations */}
        <TouchableOpacity
          style={[styles.menuCard, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => handleFeaturePress('Manage Registrations')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, {backgroundColor: colors.lavender}]}>
            <OrganizerIcon name="users" color={colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, {color: colors.text}]}>Manage Registrations</Text>
            <Text style={[styles.menuDesc, {color: colors.textSecondary}]}>View student lists for your events</Text>
          </View>
          <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, {color: colors.textSecondary}]}>Festivo Organizer Portal • v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
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
    fontSize: 20,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 8,
    marginBottom: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    fontWeight: '500',
  },
});

export default OrganizerDashboardScreen;
