import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpSupportScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const faqs: FAQItem[] = [
  {
    question: 'How to register for an event?',
    answer: 'Browse events on the Home Screen, tap on an event card to view the details, and click "Register Now". Fill in your details in the registration form to complete the process.',
  },
  {
    question: 'How to make payment?',
    answer: 'For paid events, after completing the registration form, you will be directed to the Payment Screen. You can pay using mock payments like UPI, Cards, or Wallet. Simply tap "Pay Now" to complete.',
  },
  {
    question: 'How to view registered events?',
    answer: 'Go to the "My Events" tab from the bottom navigation bar to view all events you have successfully registered for.',
  },
];

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({navigation}) => {
  const {colors} = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Back navigation */}
        <View style={styles.header}>
          <Text style={[styles.backBtn, {color: colors.primary}]} onPress={() => navigation.goBack()}>← Back</Text>
        </View>

        <Text style={[styles.title, {color: colors.text}]}>Help & Support</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Find answers to frequently asked questions or contact our support team.
        </Text>

        {/* Expandable FAQs Section */}
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Frequently Asked Questions</Text>
        
        <View style={styles.faqList}>
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.faqCard,
                  {backgroundColor: colors.card, borderColor: colors.border},
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleExpand(index)}
                  style={styles.faqQuestionRow}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, {color: colors.text}]}>{faq.question}</Text>
                  <Text style={[styles.expandIcon, {color: colors.primary}]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.faqAnswerContainer, {borderTopColor: colors.border}]}>
                    <Text style={[styles.faqAnswer, {color: colors.textSecondary}]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Support Section */}
        <View style={[styles.contactCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Text style={[styles.contactTitle, {color: colors.text}]}>Still need help?</Text>
          <Text style={[styles.contactText, {color: colors.textSecondary}]}>
            Our support team is available to assist you with any issues or feedback.
          </Text>
          
          <View style={styles.supportChannel}>
            <Text style={styles.supportLabel}>📧 Email Support</Text>
            <Text style={[styles.supportValue, {color: colors.primary}]}>support@festivo.com</Text>
          </View>
          
          <View style={styles.supportChannel}>
            <Text style={styles.supportLabel}>📞 Helpline</Text>
            <Text style={[styles.supportValue, {color: colors.primary}]}>+91 98765 43210</Text>
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
    paddingBottom: 40,
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  faqList: {
    gap: 12,
    marginBottom: 24,
  },
  faqCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
  },
  faqAnswerContainer: {
    borderTopWidth: 1,
    padding: 18,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  contactCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  supportChannel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  supportLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  supportValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HelpSupportScreen;
