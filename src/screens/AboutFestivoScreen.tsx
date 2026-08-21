import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, {Path, Defs, LinearGradient as SvgGradient, Stop, G, Circle, Text as SvgText} from 'react-native-svg';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';
import {appName, tagline} from '../constants/Strings';

interface AboutFestivoScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const AboutFestivoScreen: React.FC<AboutFestivoScreenProps> = ({navigation}) => {
  const {colors} = useTheme();

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Back navigation */}
        <View style={styles.header}>
          <Text style={[styles.backBtn, {color: colors.primary}]} onPress={() => navigation.goBack()}>← Back</Text>
        </View>

        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Defs>
                <SvgGradient id="aboutTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#5B2BFF" />
                  <Stop offset="100%" stopColor="#FF4FA3" />
                </SvgGradient>
              </Defs>
              
              <Circle cx={22} cy={22} r={2} fill="#FF4FA3" opacity={0.8} />
              <Circle cx={95} cy={32} r={2.5} fill="#5B2BFF" opacity={0.7} />
              <Circle cx={28} cy={72} r={1.5} fill="#5B2BFF" opacity={0.6} />
              <Circle cx={88} cy={68} r={2} fill="#FF4FA3" opacity={0.8} />

              <G transform="translate(25, 20) rotate(-25, 35, 22.5)">
                <Path
                  d="M6,0 L64,0 A6,6 0 0,1 70,6 L70,15 A7,7 0 0,0 70,29 L70,39 A6,6 0 0,1 64,45 L6,45 A6,6 0 0,1 0,39 L0,29 A7,7 0 0,0 0,15 L0,6 A6,6 0 0,1 6,0 Z"
                  fill="url(#aboutTicketGrad)"
                />
                <Path
                  d="M35,12.5 L37.9,18.5 L44.5,19.5 L39.7,24.2 L40.8,30.8 L35,27.7 L29.2,30.8 L30.3,24.2 L25.5,19.5 L32.1,18.5 Z"
                  fill="#FFFFFF"
                />
              </G>
            </Svg>

            {/* Gradient Logo Text */}
            <Svg width={250} height={70} viewBox="0 0 250 70">
              <Defs>
                <SvgGradient id="aboutLogoTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#5B2BFF" />
                  <Stop offset="100%" stopColor="#FF4FA3" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#aboutLogoTextGrad)"
                fontSize={46}
                fontFamily="KaushanScript-Regular"
                x={125}
                y={52}
                textAnchor="middle"
              >
                {appName}
              </SvgText>
            </Svg>
            
            <Text style={[styles.tagline, {color: colors.textSecondary}]}>{tagline}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionTitle, {color: colors.text}]}>About Platform</Text>
            <Text style={[styles.descriptionText, {color: colors.textSecondary}]}>
              Festivo is a premium, state-of-the-art college event discovery and registration platform. 
              Designed specifically for college students, Festivo makes it easy to browse, search, and register 
              for amazing student activities around campus.
            </Text>
            <Text style={[styles.bulletTitle, {color: colors.text}]}>Discover Opportunities:</Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>🎉 Cultural & College Festivals</Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>💡 Technical Symposiums & Hackathons</Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>🎭 Arts & Live Music Performances</Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>🏆 Sports Leagues & Tournaments</Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionLabel, {color: colors.textSecondary}]}>App Version</Text>
            <Text style={[styles.versionValue, {color: colors.text}]}>1.0.0</Text>
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
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: -2,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: 18,
  },
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AboutFestivoScreen;
