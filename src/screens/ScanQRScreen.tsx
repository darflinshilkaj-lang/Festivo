import React, {useState, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {Camera, CameraType} from 'react-native-camera-kit';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {eventService, VerifiedRegistration} from '../services/eventService';

interface ScanQRScreenProps {
  route: {
    params: {
      eventId: string;
      eventName: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

type ScanState =
  | 'scanning'
  | 'loading'
  | 'verified'
  | 'already_checked_in'
  | 'wrong_event'
  | 'not_found'
  | 'payment_pending'
  | 'cancelled'
  | 'error';

interface ScanResult {
  state: ScanState;
  registration?: VerifiedRegistration;
  errorMsg?: string;
  checkedInAt?: string;
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const ScanQRScreen: React.FC<ScanQRScreenProps> = ({route, navigation}) => {
  const {eventId, eventName} = route.params;
  const {colors, isDarkMode} = useTheme();

  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const isProcessing = useRef(false);

  // Request / check camera permission on mount
  React.useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'Festivo needs camera access to scan participant QR codes.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );
        setCameraPermission(
          granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
        );
      } catch {
        setCameraPermission('denied');
      }
    } else {
      // iOS permissions are handled automatically by the camera library
      setCameraPermission('granted');
    }
  };

  const handleQRRead = useCallback(
    async (event: {nativeEvent: {codeStringValue: string}}) => {
      // Prevent duplicate processing
      if (isProcessing.current || scanResult?.state === 'loading') return;
      const rawValue = event.nativeEvent.codeStringValue?.trim();
      if (!rawValue) return;

      // Parse the QR value — Festivo QR codes encode JSON with registrationId + eventId
      let registrationId = rawValue;
      try {
        const parsed = JSON.parse(rawValue);
        if (parsed?.registrationId) {
          registrationId = parsed.registrationId;
        }
      } catch {
        // Not JSON — treat the raw value directly as the registrationId
        registrationId = rawValue;
      }

      isProcessing.current = true;
      setScanResult({state: 'loading'});

      try {
        const reg = await eventService.verifyTicket(eventId, registrationId);
        if (reg.checkedIn) {
          setScanResult({
            state: 'already_checked_in',
            registration: reg,
            checkedInAt: reg.checkedInAt || undefined,
          });
        } else {
          setScanResult({state: 'verified', registration: reg});
        }
      } catch (err: any) {
        const code: string = err?.code || '';
        const msg: string = err?.message || 'An error occurred.';

        if (msg.includes('not for this event') || code === 'WRONG_EVENT') {
          setScanResult({state: 'wrong_event', errorMsg: msg});
        } else if (msg.includes('not found') || code === 'NOT_FOUND') {
          setScanResult({state: 'not_found', errorMsg: msg});
        } else if (msg.includes('cancelled') || code === 'CANCELLED') {
          setScanResult({state: 'cancelled', errorMsg: msg});
        } else {
          setScanResult({state: 'error', errorMsg: msg});
        }
      } finally {
        isProcessing.current = false;
      }
    },
    [eventId, scanResult],
  );

  const handleCheckIn = async () => {
    if (!scanResult?.registration) return;
    setCheckingIn(true);
    try {
      const result = await eventService.checkInParticipant(eventId, scanResult.registration.registrationId);
      setScanResult(prev =>
        prev?.registration
          ? {
              ...prev,
              state: 'already_checked_in',
              checkedInAt: result.checkedInAt || new Date().toISOString(),
              registration: prev.registration
                ? {...prev.registration, checkedIn: true}
                : prev.registration,
            }
          : prev,
      );
    } catch (err: any) {
      const code: string = err?.code || '';
      const msg: string = err?.message || 'Check-in failed.';

      if (code === 'ALREADY_CHECKED_IN' || msg.toLowerCase().includes('already')) {
        setScanResult(prev =>
          prev
            ? {...prev, state: 'already_checked_in', checkedInAt: err?.checkedInAt || new Date().toISOString()}
            : prev,
        );
      } else if (code === 'PAYMENT_PENDING' || msg.toLowerCase().includes('payment')) {
        setScanResult(prev => prev ? {...prev, state: 'payment_pending'} : prev);
      } else {
        Alert.alert('Check-In Failed', msg);
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const resetScan = () => {
    isProcessing.current = false;
    setScanResult(null);
  };

  // ── Permission Denied Screen ────────────────────────────────────────────────
  if (cameraPermission === 'denied') {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.headerBar, {borderBottomColor: colors.border}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={[styles.backBtnText, {color: colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Scan QR</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={[styles.permissionTitle, {color: colors.text}]}>Camera Permission Required</Text>
          <Text style={[styles.permissionSubtext, {color: colors.textSecondary}]}>
            Camera access is required to scan participant QR codes. Please enable it in your device settings.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, {backgroundColor: colors.primary}]}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, {borderColor: colors.primary}]}
            onPress={requestCameraPermission}
            activeOpacity={0.8}>
            <Text style={[styles.secondaryBtnText, {color: colors.primary}]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Waiting for permission ──────────────────────────────────────────────────
  if (cameraPermission === 'unknown') {
    return (
      <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Checking camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: '#000'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Camera fills the screen */}
      {(!scanResult || scanResult.state === 'loading') && (
        <Camera
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Back}
          scanBarcode
          onReadCode={handleQRRead}
          showFrame={false}
          laserColor="transparent"
          frameColor="transparent"
        />
      )}

      {/* Dark overlay + header */}
      <View style={styles.overlayTop}>
        <View style={[styles.headerBar, {borderBottomColor: 'rgba(255,255,255,0.1)'}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={[styles.backBtnText, {color: '#FFF'}]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: '#FFF'}]}>Scan QR</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.eventLabel} numberOfLines={1}>{eventName}</Text>
      </View>

      {/* Loading state */}
      {scanResult?.state === 'loading' && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingOverlayText}>Verifying ticket...</Text>
        </View>
      )}

      {/* QR frame guide (only during active scanning) */}
      {!scanResult && (
        <View style={styles.frameGuideContainer}>
          <View style={styles.frameGuide}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>Point the camera at the participant's QR code</Text>
        </View>
      )}

      {/* Result Card */}
      {scanResult && scanResult.state !== 'loading' && (
        <View style={styles.resultSheet}>
          <ScrollView
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <ResultCard
              scanResult={scanResult}
              colors={colors}
              isDarkMode={isDarkMode}
              checkingIn={checkingIn}
              onCheckIn={handleCheckIn}
              onScanAgain={resetScan}
            />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

// ── Result Card Component ────────────────────────────────────────────────────

interface ResultCardProps {
  scanResult: ScanResult;
  colors: any;
  isDarkMode: boolean;
  checkingIn: boolean;
  onCheckIn: () => void;
  onScanAgain: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  scanResult,
  colors,
  isDarkMode,
  checkingIn,
  onCheckIn,
  onScanAgain,
}) => {
  const {state, registration, errorMsg, checkedInAt} = scanResult;

  if (state === 'verified' && registration) {
    const isPaid = registration.registrationType === 'paid';
    let paymentText = 'Not Required';
    let paymentColor = '#6B7280';

    if (isPaid) {
      const ps = (registration.paymentStatus || '').toLowerCase();
      paymentText = ps === 'completed' ? 'Paid ✓' : 'Pending';
      paymentColor = ps === 'completed' ? Colors.success : '#F59E0B';
    }

    return (
      <View>
        {/* Success Banner */}
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : '#E8F9EE', borderColor: Colors.success}]}>
          <Text style={styles.resultBannerIcon}>✅</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: Colors.success}]}>Registration Verified</Text>
            <Text style={[styles.resultBannerSub, {color: Colors.success}]}>Valid ticket — ready to check in</Text>
          </View>
        </View>

        {/* Student Details */}
        <View style={[styles.detailsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <DetailRow label="Name" value={registration.studentName} colors={colors} />
          <DetailRow label="Department" value={registration.studentDepartment} colors={colors} />
          <DetailRow label="Year" value={registration.studentYear} colors={colors} />
          <DetailRow label="Event" value={registration.eventName} colors={colors} />
          <DetailRow label="Reg ID" value={registration.registrationId} colors={colors} bold />
          <View style={styles.detailItemRow}>
            <Text style={[styles.detailItemLabel, {color: colors.textSecondary}]}>Payment</Text>
            <Text style={[styles.detailItemValue, {color: paymentColor, fontWeight: '700'}]}>{paymentText}</Text>
          </View>
        </View>

        {/* Check In Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, {backgroundColor: Colors.success, marginTop: 8}]}
          onPress={onCheckIn}
          disabled={checkingIn}
          activeOpacity={0.8}>
          {checkingIn ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>✓  Check In Participant</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={onScanAgain} activeOpacity={0.7}>
          <Text style={[styles.scanAgainText, {color: colors.primary}]}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'already_checked_in' && registration) {
    const formattedTime = checkedInAt
      ? new Date(checkedInAt).toLocaleString()
      : 'Earlier today';

    return (
      <View>
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : '#FFF8E8', borderColor: '#F59E0B'}]}>
          <Text style={styles.resultBannerIcon}>⚠️</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: '#F59E0B'}]}>Already Checked In</Text>
            <Text style={[styles.resultBannerSub, {color: '#F59E0B'}]}>This participant already entered.</Text>
          </View>
        </View>
        <View style={[styles.detailsCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <DetailRow label="Name" value={registration.studentName} colors={colors} />
          <DetailRow label="Reg ID" value={registration.registrationId} colors={colors} bold />
          <DetailRow label="Checked In" value={formattedTime} colors={colors} />
        </View>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 8}]} onPress={onScanAgain} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Scan Next Participant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'wrong_event') {
    return (
      <View>
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderColor: Colors.danger}]}>
          <Text style={styles.resultBannerIcon}>❌</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: Colors.danger}]}>Invalid QR</Text>
            <Text style={[styles.resultBannerSub, {color: Colors.danger}]}>This registration is not for this event.</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 12}]} onPress={onScanAgain} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'not_found') {
    return (
      <View>
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderColor: Colors.danger}]}>
          <Text style={styles.resultBannerIcon}>🔍</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: Colors.danger}]}>Invalid Registration</Text>
            <Text style={[styles.resultBannerSub, {color: Colors.danger}]}>Registration not found.</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 12}]} onPress={onScanAgain} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'payment_pending') {
    return (
      <View>
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : '#FFF8E8', borderColor: '#F59E0B'}]}>
          <Text style={styles.resultBannerIcon}>💳</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: '#F59E0B'}]}>Payment Pending</Text>
            <Text style={[styles.resultBannerSub, {color: '#F59E0B'}]}>Payment not completed. Check-in not allowed.</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 12}]} onPress={onScanAgain} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'cancelled') {
    return (
      <View>
        <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderColor: Colors.danger}]}>
          <Text style={styles.resultBannerIcon}>🚫</Text>
          <View style={{flex: 1}}>
            <Text style={[styles.resultBannerTitle, {color: Colors.danger}]}>Registration Cancelled</Text>
            <Text style={[styles.resultBannerSub, {color: Colors.danger}]}>This registration has been cancelled.</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 12}]} onPress={onScanAgain} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Generic error
  return (
    <View>
      <View style={[styles.resultBanner, {backgroundColor: isDarkMode ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderColor: Colors.danger}]}>
        <Text style={styles.resultBannerIcon}>⚠️</Text>
        <View style={{flex: 1}}>
          <Text style={[styles.resultBannerTitle, {color: Colors.danger}]}>Error</Text>
          <Text style={[styles.resultBannerSub, {color: Colors.danger}]}>{errorMsg || 'Something went wrong.'}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: colors.primary, marginTop: 12}]} onPress={onScanAgain} activeOpacity={0.8}>
        <Text style={styles.primaryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Small helper component ───────────────────────────────────────────────────
const DetailRow = ({label, value, colors, bold = false}: {label: string; value: string; colors: any; bold?: boolean}) => (
  <View style={styles.detailItemRow}>
    <Text style={[styles.detailItemLabel, {color: colors.textSecondary}]}>{label}</Text>
    <Text style={[styles.detailItemValue, {color: colors.text, fontWeight: bold ? '700' : '600'}]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

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
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingBottom: 12,
  },
  eventLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  frameGuideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameGuide: {
    width: 230,
    height: 230,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFF',
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  scanHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 30,
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlayText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  resultSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
  resultScrollContent: {
    padding: 24,
    paddingBottom: 36,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  resultBannerIcon: {
    fontSize: 28,
  },
  resultBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  resultBannerSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
    paddingTop: 1,
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  primaryBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scanAgainBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  scanAgainText: {
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  permissionIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 280,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ScanQRScreen;
