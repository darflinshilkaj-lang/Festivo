import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {eventService, Participant} from '../services/eventService';

interface EventParticipantsScreenProps {
  route: {
    params: {
      eventId: string;
      eventName: string;
      collegeName?: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

type FilterType = 'all' | 'checkedIn' | 'notCheckedIn';

const EventParticipantsScreen: React.FC<EventParticipantsScreenProps> = ({route, navigation}) => {
  const {eventId, eventName, collegeName} = route.params;
  const {colors, isDarkMode} = useTheme();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [checkedInCount, setCheckedInCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchParticipants = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);
    try {
      const data = await eventService.getEventParticipants(eventId);
      setParticipants(data.participants);
      setMaxParticipants(data.maxParticipants);
      setCheckedInCount(data.checkedInCount);
    } catch (err: any) {
      console.warn('Failed to load participants:', err);
      setErrorMsg(err.message || 'Unable to load participants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const filteredParticipants = participants.filter(p => {
    if (activeFilter === 'checkedIn') return p.checkedIn === true;
    if (activeFilter === 'notCheckedIn') return !p.checkedIn;
    return true;
  });

  const renderHeader = () => {
    const isFull = participants.length >= maxParticipants;
    return (
      <View style={styles.headerInfo}>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>EVENT PARTICIPANTS</Text>
        <Text style={[styles.eventName, {color: colors.text}]}>{eventName}</Text>
        {collegeName && <Text style={[styles.collegeName, {color: colors.primary}]}>{collegeName}</Text>}

        {/* Stats Card */}
        <View style={[styles.statsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <View style={styles.statsRow}>
            <View>
              <Text style={[styles.statsLabel, {color: colors.textSecondary}]}>REGISTERED</Text>
              <Text style={[styles.statsCount, {color: colors.text}]}>
                {participants.length}{' '}
                <Text style={[styles.statsMax, {color: colors.textSecondary}]}>/ {maxParticipants}</Text>
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View>
              <Text style={[styles.statsLabel, {color: colors.textSecondary}]}>CHECKED IN</Text>
              <Text style={[styles.statsCount, {color: Colors.success}]}>{checkedInCount}</Text>
            </View>
            {isFull ? (
              <View style={[styles.fullBadge, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderColor: Colors.danger}]}>
                <Text style={[styles.fullBadgeText, {color: Colors.danger}]}>FULL</Text>
              </View>
            ) : (
              <View style={[styles.availableBadge, {backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE', borderColor: Colors.success}]}>
                <Text style={[styles.availableBadgeText, {color: Colors.success}]}>Open</Text>
              </View>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterRow, {backgroundColor: colors.card, borderColor: colors.border}]}>
          {([
            {key: 'all', label: `All (${participants.length})`},
            {key: 'checkedIn', label: `✓ Checked In (${checkedInCount})`},
            {key: 'notCheckedIn', label: `Not In (${participants.length - checkedInCount})`},
          ] as {key: FilterType; label: string}[]).map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                activeFilter === f.key && {backgroundColor: colors.primary},
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterTabText,
                {color: activeFilter === f.key ? '#FFF' : colors.textSecondary},
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderParticipantItem = ({item}: {item: Participant}) => {
    const isPaid = item.registrationType === 'paid';

    let paymentText = 'Not Required';
    let paymentColor = colors.textSecondary;
    let paymentBg = colors.border;

    if (isPaid) {
      const status = String(item.paymentStatus || 'pending').toLowerCase();
      if (status === 'completed') {
        paymentText = 'Paid';
        paymentColor = Colors.success;
        paymentBg = isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE';
      } else {
        paymentText = 'Pending';
        paymentColor = '#F59E0B';
        paymentBg = isDarkMode ? 'rgba(245,158,11,0.15)' : '#FFF8E8';
      }
    }

    const isCheckedIn = item.checkedIn === true;

    return (
      <View style={[styles.participantCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <View style={styles.participantHeader}>
          <View style={styles.nameContainer}>
            <Text style={[styles.participantName, {color: colors.text}]} numberOfLines={1}>
              {item.studentName}
            </Text>
            <Text style={[styles.deptText, {color: colors.textSecondary}]}>
              {item.studentDepartment} • {item.studentYear}
            </Text>
          </View>
          <View style={[styles.statusBadge, {borderColor: Colors.success, backgroundColor: isDarkMode ? 'rgba(34,197,94,0.1)' : '#F6FDF9'}]}>
            <Text style={[styles.statusText, {color: Colors.success}]}>Confirmed</Text>
          </View>
        </View>

        <View style={[styles.divider, {backgroundColor: colors.border}]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Email:</Text>
          <Text style={[styles.detailValue, {color: colors.text}]} selectable={true} numberOfLines={1}>
            {item.studentEmail}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Reg ID:</Text>
          <Text style={[styles.detailValue, {color: colors.text, fontWeight: '700'}]} selectable={true}>
            {item.registrationId || 'Pending'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Payment:</Text>
          <View style={[styles.paymentBadge, {backgroundColor: paymentBg}]}>
            <Text style={[styles.paymentBadgeText, {color: paymentColor}]}>{paymentText}</Text>
          </View>
        </View>

        {/* Check-in Status */}
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Check-in:</Text>
          <View style={[
            styles.checkInBadge,
            {
              backgroundColor: isCheckedIn
                ? (isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE')
                : (isDarkMode ? 'rgba(107,114,128,0.15)' : '#F3F4F6'),
              borderColor: isCheckedIn ? Colors.success : colors.border,
            },
          ]}>
            <Text style={[styles.checkInText, {color: isCheckedIn ? Colors.success : colors.textSecondary}]}>
              {isCheckedIn ? '✓ Checked In' : 'Not Checked In'}
            </Text>
          </View>
        </View>
        {isCheckedIn && item.checkedInAt && (
          <Text style={[styles.checkedInTime, {color: colors.textSecondary}]}>
            at {new Date(item.checkedInAt).toLocaleString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header bar */}
      <View style={[styles.headerBar, {borderBottomColor: colors.border}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={[styles.backBtnText, {color: colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]} numberOfLines={1}>
          Participants
        </Text>
        <View style={styles.placeholder} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Loading participants...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, {color: colors.text}]}>{errorMsg}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, {backgroundColor: colors.primary}]}
            onPress={() => fetchParticipants()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredParticipants}
          keyExtractor={(item) => item.id}
          renderItem={renderParticipantItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchParticipants(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={[styles.emptyTitle, {color: colors.text}]}>
                {activeFilter === 'all' ? 'No participants yet' : activeFilter === 'checkedIn' ? 'No one checked in yet' : 'All participants checked in!'}
              </Text>
              <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                {activeFilter === 'all'
                  ? 'Participants will appear here after students register for this event.'
                  : activeFilter === 'checkedIn'
                  ? 'Use "Scan QR" to check in participants as they arrive.'
                  : 'Great! Every registered participant has been checked in.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    minWidth: 60,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerInfo: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  collegeName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  statsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statsCount: {
    fontSize: 24,
    fontWeight: '800',
  },
  statsMax: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  fullBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 'auto',
  },
  fullBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  availableBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 'auto',
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginTop: 14,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  participantCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nameContainer: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  deptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 60,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  paymentBadge: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  checkInBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  checkInText: {
    fontSize: 11,
    fontWeight: '800',
  },
  checkedInTime: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 68,
    marginTop: -4,
    marginBottom: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
});

export default EventParticipantsScreen;
