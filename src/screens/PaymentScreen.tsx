import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View, StatusBar, SafeAreaView, TouchableOpacity} from 'react-native';
import Colors from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import {Event} from '../types/Event';
import {useTheme} from '../context/ThemeContext';
import {Registration} from '../services/registrationService';

interface PaymentScreenProps {
  route: {
    params: {
      event: Event;
      student: any;
      registration?: Registration;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const paymentOptions = [
  {id: 'upi', name: 'Unified Payments Interface (UPI)', icon: '📱'},
  {id: 'debit', name: 'Debit Card', icon: '💳'},
  {id: 'credit', name: 'Credit Card', icon: '💳'},
  {id: 'netbank', name: 'Net Banking', icon: '🏦'},
];

const PaymentScreen: React.FC<PaymentScreenProps> = ({route, navigation}) => {
  const {event, student, registration} = route.params;
  const {colors, isDarkMode} = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate bank transaction delay
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1800));
      Alert.alert('Payment Status', 'Transaction completed successfully! 🎉');
      navigation.navigate('Success', {event, student, registration});
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Back navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtnWrapper}>
            <Text style={[styles.backBtn, {color: colors.primary}]}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Text style={[styles.title, {color: colors.text}]}>Payment Summary</Text>
          <Text style={styles.subtitle}>{event.name}</Text>

          {/* Invoice-like details card */}
          <View style={[styles.invoiceBox, {backgroundColor: colors.lavender, borderColor: colors.border}]}>
            <View style={styles.row}>
              <Text style={[styles.label, {color: colors.textSecondary}]}>Student</Text>
              <Text style={[styles.value, {color: colors.text}]}>{student.name}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <View style={styles.row}>
              <Text style={[styles.label, {color: colors.textSecondary}]}>College</Text>
              <Text style={[styles.value, {color: colors.text}]}>{student.college}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <View style={styles.row}>
              <Text style={[styles.totalLabel, {color: colors.text}]}>Grand Total</Text>
              <Text style={styles.amount}>₹{event.registrationFee}</Text>
            </View>
          </View>

          {/* Selectable Payment Methods */}
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Select Payment Mode</Text>
          <View style={styles.optionsList}>
            {paymentOptions.map(opt => {
              const isSelected = selectedMethod === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedMethod(opt.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optRow}>
                    <Text style={styles.optIcon}>{opt.icon}</Text>
                    <Text style={[styles.optText, {color: colors.text}]}>{opt.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      {borderColor: isSelected ? colors.primary : colors.textSecondary},
                      isSelected && {backgroundColor: colors.primary},
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.disclaimer, {color: colors.textSecondary}]}>
            By clicking "Pay Now", you agree to the event registration guidelines. Demopay will simulate a successful transaction.
          </Text>

          <CustomButton
            title="Pay Now"
            onPress={handlePayment}
            loading={loading}
          />
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
    marginBottom: 16,
  },
  backBtnWrapper: {
    alignSelf: 'flex-start',
  },
  backBtn: {
    fontSize: 16,
    fontWeight: '700',
    padding: 4,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
  },
  invoiceBox: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  optionsList: {
    gap: 10,
    marginBottom: 24,
  },
  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2.5,
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optIcon: {
    fontSize: 20,
  },
  optText: {
    fontSize: 14,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
});

export default PaymentScreen;
