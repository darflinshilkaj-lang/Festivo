import React, {useState} from 'react';
import {
  Alert,
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
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {authService} from '../services/authService';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

interface EditProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({navigation}) => {
  const {student, updateStudent, addNotification} = useApp();
  const {colors, isDarkMode} = useTheme();

  const [name, setName] = useState(student.name);
  const [email] = useState(student.email);
  const [phone, setPhone] = useState(student.phone || '');
  const [college, setCollege] = useState(student.college);
  const [department, setDepartment] = useState(student.department);
  const [year, setYear] = useState(student.year);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedCollege = college.trim();
    const trimmedDept = department.trim();
    const trimmedYear = year.trim();

    if (!trimmedName || !trimmedCollege || !trimmedDept || !trimmedYear) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Call PUT /api/auth/profile
      const updatedUser = await authService.updateProfile({
        name: trimmedName,
        college: trimmedCollege,
        department: trimmedDept,
        year: trimmedYear,
      });

      // Preserve phone locally if passed
      const fullProfile = {
        ...updatedUser,
        phone: phone.trim() || updatedUser.phone || '',
      };

      updateStudent(fullProfile);

      addNotification(
        'Profile Updated 👤',
        'Your profile academic details have been successfully updated.',
        'info'
      );

      Alert.alert('Success 🎉', 'Profile updated successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Back navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtnWrapper}>
            <Text style={[styles.backBtn, {color: colors.primary}]}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Text style={[styles.title, {color: colors.text}]}>Edit Profile</Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>Update your campus profile information</Text>

          {/* Styled Avatar initials */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, {backgroundColor: colors.lavender}]}>
              <Text style={[styles.avatarText, {color: colors.primary}]}>
                {name ? name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'FS'}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Full Name"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
            />

            <CustomInput
              label="Email Address (Read-only)"
              placeholder="Email"
              value={email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              label="Phone Number"
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="College Name"
              placeholder="Enter college"
              value={college}
              onChangeText={setCollege}
            />

            <CustomInput
              label="Department"
              placeholder="Enter department"
              value={department}
              onChangeText={setDepartment}
            />

            <CustomInput
              label="Year of Study"
              placeholder="Enter year"
              value={year}
              onChangeText={setYear}
            />

            <View style={styles.buttonSpacing}>
              <CustomButton title="Save Changes" onPress={handleSave} loading={loading} />
            </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
  },
  form: {
    marginTop: 4,
  },
  buttonSpacing: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
