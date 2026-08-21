import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Colors from '../constants/Colors';
import EventCard from '../components/EventCard';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {eventService} from '../services/eventService';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface SearchScreenProps {
  route?: {
    params?: {
      category?: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: {event?: Event; eventId?: string}) => void;
  };
}

const categories = ['All', 'Festivals', 'Symposiums', 'Cultural', 'Sports'];

const categoryMapping: Record<string, string[]> = {
  Festivals: ['college festival', 'festival', 'festivals'],
  Symposiums: ['technical symposium', 'symposium', 'symposiums', 'technical', 'workshop', 'hackathon'],
  Cultural: ['cultural event', 'cultural'],
  Sports: ['sports event', 'sports'],
};

// SVG Search Icon
const SearchIcon = ({color}: {color: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={color}
    />
  </Svg>
);

const SearchScreen: React.FC<SearchScreenProps> = ({route, navigation}) => {
  const {colors, isDarkMode} = useTheme();
  const initialCategory = route?.params?.category || 'All';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAllEvents = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err: any) {
      console.warn('Error fetching events in SearchScreen:', err);
      setErrorMsg(err.message || 'Unable to connect to Festivo server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Filter by search text
      const term = search.toLowerCase().trim();
      const nameMatch = (event.name || event.title || '').toLowerCase().includes(term);
      const collegeMatch = (event.college || '').toLowerCase().includes(term);
      const venueMatch = (event.location || event.venue || '').toLowerCase().includes(term);
      const descMatch = (event.description || '').toLowerCase().includes(term);
      const typeMatchStr = (event.type || event.eventType || '').toLowerCase().includes(term);

      const matchesSearch = term === '' || nameMatch || collegeMatch || venueMatch || descMatch || typeMatchStr;

      // 2. Filter by category
      if (selectedCategory === 'All') {
        return matchesSearch;
      }

      const matchPatterns = categoryMapping[selectedCategory] || [selectedCategory.toLowerCase()];
      const currentEventType = (event.type || event.eventType || '').toLowerCase();
      const matchesCategory = matchPatterns.some(p => currentEventType.includes(p));

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, events]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, {backgroundColor: colors.card, borderColor: colors.border}]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, {color: colors.primary}]}>←</Text>
        </TouchableOpacity>
        
        <View style={[styles.searchBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <SearchIcon color={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search events, colleges, venues..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, {color: colors.text}]}
            autoFocus={true}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Text style={[styles.clearIcon, {color: colors.textSecondary}]}>✖</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Horizontal list */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({item}) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  {backgroundColor: colors.lavender},
                  isActive && {backgroundColor: colors.primary},
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {color: colors.primary},
                    isActive && {color: colors.white},
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results Header */}
      {!loading && (
        <Text style={[styles.resultsTitle, {color: colors.textSecondary}]}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
        </Text>
      )}

      {/* Events List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading events...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={[styles.emptyText, {color: colors.text}]}>{errorMsg}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, {backgroundColor: colors.primary}]}
            onPress={fetchAllEvents}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item._id || item.id}
          renderItem={({item}) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', {eventId: item._id})}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyText, {color: colors.text}]}>No events found</Text>
              <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                Try searching for something else or changing the category filter.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
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
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    padding: 4,
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SearchScreen;
