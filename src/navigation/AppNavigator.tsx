import React from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SuccessScreen from '../screens/SuccessScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import TicketScreen from '../screens/TicketScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutFestivoScreen from '../screens/AboutFestivoScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventParticipantsScreen from '../screens/EventParticipantsScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {Event} from '../types/Event';
import {Registration} from '../services/registrationService';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MainApp: {screen?: string; params?: {tab?: 'registered' | 'organized'}} | undefined;
  OrganizerDashboard: undefined;
  Search: {category?: string} | undefined;
  EventDetails: {event?: Event; eventId?: string};
  Registration: {event: Event};
  Payment: {event: Event; student: any};
  Success: {event: Event; student: any; registration?: Registration};
  Ticket: {registrationId: string; registration?: Registration};
  EditProfile: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  AboutFestivo: undefined;
  CreateEvent: {event?: Event} | undefined;
  EventParticipants: {eventId: string; eventName: string; collegeName?: string};
  ScanQR: {eventId: string; eventName: string};
};

export type MainTabParamList = {
  Home: undefined;
  MyEvents: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom SVG Tab Icons
const TabIcon = ({name, color}: {name: keyof MainTabParamList; color: string}) => {
  let path = '';
  if (name === 'Home') {
    // House shape
    path = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
  } else if (name === 'MyEvents') {
    // Ticket/Calendar shape
    path = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z M7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z';
  } else if (name === 'Profile') {
    // Profile silhouette
    path = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d={path} fill={color} />
    </Svg>
  );
};

function MainTabs() {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: {width: 0, height: -4},
          elevation: 8,
        },
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({color}) => {
          return <TabIcon name={route.name} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsScreen}
        options={{tabBarLabel: 'My Events'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainApp" component={MainTabs as any} />
        <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen as any} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen as any} />
        <Stack.Screen name="Registration" component={RegistrationScreen as any} />
        <Stack.Screen name="Payment" component={PaymentScreen as any} />
        <Stack.Screen name="Success" component={SuccessScreen as any} />
        <Stack.Screen name="Ticket" component={TicketScreen as any} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen as any} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen as any} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen as any} />
        <Stack.Screen name="AboutFestivo" component={AboutFestivoScreen as any} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen as any} />
        <Stack.Screen name="EventParticipants" component={EventParticipantsScreen as any} />
        <Stack.Screen name="ScanQR" component={ScanQRScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
