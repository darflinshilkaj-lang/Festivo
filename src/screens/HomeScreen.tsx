import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Colors from '../constants/Colors';
import EventCard from '../components/EventCard';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {useApp} from '../context/AppContext';
import {eventService} from '../services/eventService';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const categories = ['Festivals', 'Symposiums', 'Cultural', 'Sports'];

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const COMPACT_HEADER_HEIGHT = 56 + statusBarHeight;

// Modern SVG Bell Icon
const BellIcon = ({color}: {color: string}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color}
    />
  </Svg>
);

// Modern SVG Search Icon
const SearchIcon = ({color}: {color: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={color}
    />
  </Svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {student, unreadCount: unreadNotifCount} = useApp();
  const {colors, isDarkMode} = useTheme();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    try {
      const fetchedEvents = await eventService.getEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.warn('Failed to load events:', err);
      setErrorMsg(err.message || 'Unable to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Filter events: display up to 4 upcoming events
  const upcomingEvents = events.slice(0, 4);

  // Animated value to track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showCompact, setShowCompact] = useState(false);

  useEffect(() => {
    const listener = scrollY.addListener(({value}) => {
      if (value > 80) {
        setShowCompact(true);
      } else {
        setShowCompact(false);
      }
    });
    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  // Compact header opacity interpolation
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 50, 80],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  // Compact header translateY interpolation
  const compactHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 50, 80],
    outputRange: [-COMPACT_HEADER_HEIGHT, -COMPACT_HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Compact Sticky Header */}
      <Animated.View
        pointerEvents={showCompact ? 'auto' : 'none'}
        style={[
          styles.compactHeader,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            opacity: compactHeaderOpacity,
            transform: [{translateY: compactHeaderTranslateY}],
          },
        ]}
      >
        <Text style={[styles.compactLogo, {color: colors.primary}]}>Festivo</Text>
        <TouchableOpacity
          style={[styles.compactBell, {backgroundColor: colors.lavender, borderColor: colors.border}]}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <BellIcon color={colors.primary} />
          {unreadNotifCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </Animated.View>

      {/* Main scrollable container */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true}
        )}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, {color: colors.text}]}>
              Hi, {student.name ? student.name.split(' ')[0] : 'Student'} 👋
            </Text>
            <Text style={[styles.subtext, {color: colors.textSecondary}]}>Discover events around campus</Text>
          </View>
          <TouchableOpacity
            style={[styles.bell, {backgroundColor: colors.lavender, borderColor: colors.border}]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <BellIcon color={colors.primary} />
            {unreadNotifCount > 0 && <View style={styles.largeBadgeDot} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBox, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <SearchIcon color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, {color: colors.textSecondary}]}>Search events, colleges, venues...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionSubtitle, {color: colors.text}]}>Categories</Text>
          <View style={styles.categoriesRow}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, {backgroundColor: colors.lavender}]}
                onPress={() => navigation.navigate('Search', {category})}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, {color: colors.primary}]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.verticalSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>📅 Upcoming Events</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeAll, {color: colors.primary}]}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading events...</Text>
            </View>
          ) : errorMsg ? (
            <View style={[styles.errorBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={[styles.errorText, {color: colors.text}]}>{errorMsg}</Text>
              <TouchableOpacity
                style={[styles.retryBtn, {backgroundColor: colors.primary}]}
                onPress={() => loadEvents()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : upcomingEvents.length === 0 ? (
            <View style={[styles.emptyBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={styles.emptyIcon}>🎪</Text>
              <Text style={[styles.emptyText, {color: colors.text}]}>No events available</Text>
              <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                Check back soon for upcoming campus festivals and symposiums.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {upcomingEvents.map(item => (
                <EventCard
                  key={item._id || item.id}
                  event={item}
                  onPress={() => navigation.navigate('EventDetails', {eventId: item._id})}
                />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button for Creating Events */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primary}]}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COMPACT_HEADER_HEIGHT,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    zIndex: 100,
  },
  compactLogo: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: 'KaushanScript-Regular',
  },
  compactBell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  largeBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.accent,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtext: {
    color: Colors.textGray,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  bell: {
    backgroundColor: Colors.lavender,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
    gap: 8,
  },
  searchPlaceholder: {
    color: Colors.textGray,
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.lavender,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  verticalSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 0,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 80 : 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    elevation: 6,
    zIndex: 999,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
  },
});

export default HomeScreen;
