import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  Switch,
} from 'react-native';
import Colors from '../constants/Colors';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';

interface NotificationSettingsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({navigation}) => {
  const {notificationSettings, updateNotificationSettings} = useApp();
  const {colors, isDarkMode} = useTheme();

  const toggleSwitch = (key: 'reminders' | 'updates' | 'alerts') => {
    updateNotificationSettings({[key]: !notificationSettings[key]});
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Back navigation */}
        <View style={styles.header}>
          <Text style={[styles.backBtn, {color: colors.primary}]} onPress={() => navigation.goBack()}>← Back</Text>
        </View>

        <Text style={[styles.title, {color: colors.text}]}>Notification Settings</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Choose the updates and reminders you want to receive.
        </Text>

        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          
          {/* Row 1: Event Reminders */}
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, {color: colors.text}]}>Event Reminders</Text>
              <Text style={[styles.rowDescription, {color: colors.textSecondary}]}>
                Get notified before registered events start.
              </Text>
            </View>
            <Switch
              trackColor={{false: '#D1C9E6', true: '#C3B3FC'}}
              thumbColor={notificationSettings.reminders ? colors.primary : '#EFE8FF'}
              ios_backgroundColor="#D1C9E6"
              onValueChange={() => toggleSwitch('reminders')}
              value={notificationSettings.reminders}
            />
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Row 2: Registration Updates */}
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, {color: colors.text}]}>Registration Updates</Text>
              <Text style={[styles.rowDescription, {color: colors.textSecondary}]}>
                Get updates about payment status and receipts.
              </Text>
            </View>
            <Switch
              trackColor={{false: '#D1C9E6', true: '#C3B3FC'}}
              thumbColor={notificationSettings.updates ? colors.primary : '#EFE8FF'}
              ios_backgroundColor="#D1C9E6"
              onValueChange={() => toggleSwitch('updates')}
              value={notificationSettings.updates}
            />
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Row 3: New Event Alerts */}
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, {color: colors.text}]}>New Event Alerts</Text>
              <Text style={[styles.rowDescription, {color: colors.textSecondary}]}>
                Be the first to hear when new events are added.
              </Text>
            </View>
            <Switch
              trackColor={{false: '#D1C9E6', true: '#C3B3FC'}}
              thumbColor={notificationSettings.alerts ? colors.primary : '#EFE8FF'}
              ios_backgroundColor="#D1C9E6"
              onValueChange={() => toggleSwitch('alerts')}
              value={notificationSettings.alerts}
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: statusBarHeight,
    marginBottom: 16,
  },
  backBtn: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    padding: 4,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
});

export default NotificationSettingsScreen;
