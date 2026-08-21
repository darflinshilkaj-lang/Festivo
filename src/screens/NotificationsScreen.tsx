import React, {useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import Colors from '../constants/Colors';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {BackendNotification} from '../services/notificationService';

interface NotificationsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

// ──────────────────────────────────────────────────────────
// Icon components for each notification type
// ──────────────────────────────────────────────────────────
const RegistrationSuccessIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={color}
    />
  </Svg>
);

const NewEventIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h16v6z"
      fill={color}
    />
  </Svg>
);

const BellReminderIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color}
    />
  </Svg>
);

const UpdateIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      fill={color}
    />
  </Svg>
);

const PersonAddIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);

const WarningIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
      fill={color}
    />
  </Svg>
);

const ClockIcon = ({color}: {color: string}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
      fill={color}
    />
  </Svg>
);

// ──────────────────────────────────────────────────────────
// Notification type metadata
// ──────────────────────────────────────────────────────────
type NotifType = BackendNotification['type'];

interface TypeMeta {
  icon: (color: string) => React.ReactElement;
  lightColor: string;
  darkColor: string;
  bgLight: string;
  bgDark: string;
}

const TYPE_META: Record<NotifType, TypeMeta> = {
  registration_success: {
    icon: (c) => <RegistrationSuccessIcon color={c} />,
    lightColor: Colors.success,
    darkColor: Colors.success,
    bgLight: '#E8F9EE',
    bgDark: 'rgba(34,197,94,0.15)',
  },
  new_event: {
    icon: (c) => <NewEventIcon color={c} />,
    lightColor: Colors.primary,
    darkColor: Colors.secondary,
    bgLight: '#F0EBFF',
    bgDark: 'rgba(91,43,255,0.15)',
  },
  event_reminder: {
    icon: (c) => <BellReminderIcon color={c} />,
    lightColor: '#F59E0B',
    darkColor: '#FBBF24',
    bgLight: '#FFF8E8',
    bgDark: 'rgba(245,158,11,0.15)',
  },
  deadline_reminder: {
    icon: (c) => <ClockIcon color={c} />,
    lightColor: '#F59E0B',
    darkColor: '#FBBF24',
    bgLight: '#FFF8E8',
    bgDark: 'rgba(245,158,11,0.15)',
  },
  event_updated: {
    icon: (c) => <UpdateIcon color={c} />,
    lightColor: '#3B82F6',
    darkColor: '#60A5FA',
    bgLight: '#EFF6FF',
    bgDark: 'rgba(59,130,246,0.15)',
  },
  new_registration: {
    icon: (c) => <PersonAddIcon color={c} />,
    lightColor: Colors.accent,
    darkColor: Colors.accent,
    bgLight: '#FFF0F7',
    bgDark: 'rgba(255,79,163,0.15)',
  },
  event_almost_full: {
    icon: (c) => <WarningIcon color={c} />,
    lightColor: '#EF4444',
    darkColor: '#F87171',
    bgLight: '#FEF2F2',
    bgDark: 'rgba(239,68,68,0.15)',
  },
};

// ──────────────────────────────────────────────────────────
// Format date helper
// ──────────────────────────────────────────────────────────
const formatDate = (dateStr: string | Date): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

// ──────────────────────────────────────────────────────────
// NotificationCard component
// ──────────────────────────────────────────────────────────
const NotificationCard = ({
  item,
  isDarkMode,
  colors,
  onPress,
}: {
  item: BackendNotification;
  isDarkMode: boolean;
  colors: any;
  onPress: () => void;
}) => {
  const meta = TYPE_META[item.type] ?? TYPE_META.new_event;
  const iconColor = isDarkMode ? meta.darkColor : meta.lightColor;
  const bgColor = isDarkMode ? meta.bgDark : meta.bgLight;
  const borderLeftColor = iconColor;

  return (
    <TouchableOpacity
      activeOpacity={item.read ? 1 : 0.75}
      onPress={onPress}
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.read
            ? colors.card
            : isDarkMode
            ? 'rgba(91,43,255,0.06)'
            : '#FDFBFF',
          borderColor: item.read ? colors.border : colors.primary,
          borderLeftColor,
        },
      ]}
    >
      {/* Icon circle */}
      <View style={[styles.iconWrapper, {backgroundColor: bgColor}]}>
        {meta.icon(iconColor)}
      </View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontWeight: item.read ? '600' : '800',
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text
          style={[styles.cardMessage, {color: colors.textSecondary}]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text style={[styles.cardDate, {color: colors.textSecondary}]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ──────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────
const NotificationsScreen: React.FC<NotificationsScreenProps> = ({navigation}) => {
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();
  const {colors, isDarkMode} = useTheme();

  const handleRefresh = useCallback(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleCardPress = useCallback(
    async (item: BackendNotification) => {
      if (!item.read) {
        await markNotificationAsRead(item.id);
      }
    },
    [markNotificationAsRead],
  );

  return (
    <SafeAreaView
      style={[styles.safeContainer, {backgroundColor: colors.background}]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtnWrapper}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={[styles.backBtn, {color: colors.primary}]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, {color: colors.text}]}>
          Notifications
          {unreadCount > 0 && (
            <Text style={{color: colors.accent}}> ({unreadCount})</Text>
          )}
        </Text>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={markAllNotificationsAsRead}
            activeOpacity={0.7}
            style={styles.markAllBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          >
            <Text style={[styles.markReadText, {color: colors.primary}]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={notificationsLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Updates about your registrations, events, and reminders.
        </Text>

        {/* Loading State */}
        {notificationsLoading && notifications.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Svg
              width={56}
              height={56}
              viewBox="0 0 24 24"
              style={styles.emptyIcon}
            >
              <Circle cx={12} cy={12} r={10} fill={isDarkMode ? '#2A2050' : '#F0EBFF'} />
              <Path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill={colors.primary}
              />
            </Svg>
            <Text style={[styles.emptyTitle, {color: colors.text}]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
              Register for an event to get started. Notifications about your registrations and events will appear here.
            </Text>
          </View>
        ) : (
          /* Notification List */
          <View style={styles.listContainer}>
            {notifications.map(item => (
              <NotificationCard
                key={item.id}
                item={item}
                isDarkMode={isDarkMode}
                colors={colors}
                onPress={() => handleCardPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: statusBarHeight + 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtnWrapper: {
    minWidth: 60,
  },
  backBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  markAllBtn: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 20,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    flexShrink: 0,
  },
  cardMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
