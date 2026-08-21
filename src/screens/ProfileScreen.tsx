import React, {useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

// Simple Vector Icons for Menu Items
const MenuIcon = ({name, color = Colors.primary}: {name: string; color?: string}) => {
  let path = '';
  if (name === 'edit') {
    path = 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z';
  } else if (name === 'event') {
    path = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z';
  } else if (name === 'bell') {
    path = 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z';
  } else if (name === 'theme') {
    path = 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z';
  } else if (name === 'help') {
    path = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z';
  } else if (name === 'info') {
    path = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d={path} fill={color} />
    </Svg>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {student, fetchProfile, logout} = useApp();
  const {colors, isDarkMode, toggleTheme} = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of Festivo?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) {
      return 'FS';
    }
    return nameStr
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <LinearGradient
            colors={isDarkMode ? ['#8A4FFF', '#FF4FA3'] : [Colors.primary, Colors.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
          </LinearGradient>
          
          <Text style={[styles.nameText, {color: colors.text}]}>{student.name || 'Student Name'}</Text>
          <Text style={[styles.emailText, {color: colors.textSecondary}]}>{student.email || 'student@example.com'}</Text>
          
          {/* Quick Academic Details Badge Row */}
          <View style={[styles.academicBadge, {backgroundColor: colors.lavender, borderColor: colors.border}]}>
            <Text style={[styles.academicBadgeText, {color: colors.primary}]}>
              {student.college || 'College'} • {student.department || 'Dept'} • {student.year || 'Year'}
            </Text>
          </View>
        </View>

        {/* Profile Menu Sections */}
        
        {/* Section: Account */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, {color: colors.textSecondary}]}>ACCOUNT</Text>
          <View style={[styles.sectionCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="edit" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Edit Profile</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyEvents')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="event" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>My Events</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Organizer Management */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, {color: colors.textSecondary}]}>ORGANIZER TOOLS</Text>
          <View style={[styles.sectionCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('OrganizerDashboard')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="theme" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Organizer Dashboard</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, {backgroundColor: colors.border}]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="edit" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Create Event</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, {backgroundColor: colors.border}]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MainApp', {screen: 'MyEvents', params: {tab: 'organized'}})}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="event" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>My Organized Events</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, {backgroundColor: colors.border}]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Coming Soon 🚀', 'Manage Registrations functionality will be available in future releases.');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="info" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Manage Registrations</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, {color: colors.textSecondary}]}>PREFERENCES</Text>
          <View style={[styles.sectionCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="bell" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Notifications</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="theme" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Dark Mode / Theme</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Support */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, {color: colors.textSecondary}]}>SUPPORT</Text>
          <View style={[styles.sectionCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="help" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>Help & Support</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AboutFestivo')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MenuIcon name="info" color={colors.primary} />
                <Text style={[styles.menuItemText, {color: colors.text}]}>About Festivo</Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer Version Info */}
        <Text style={[styles.versionText, {color: colors.textSecondary}]}>Festivo App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: statusBarHeight,
  },
  scroll: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileHeaderCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '500',
    marginBottom: 16,
  },
  academicBadge: {
    backgroundColor: Colors.lavender,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  academicBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textGray,
    letterSpacing: 1.5,
    marginLeft: 8,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textGray,
    fontWeight: '600',
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 18,
  },
  logoutButton: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFC8C8',
    borderRadius: 20,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#EF4444',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    color: Colors.textGray,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
});

export default ProfileScreen;
