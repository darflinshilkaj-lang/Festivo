import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Colors from '../constants/Colors';
import {useTheme} from '../context/ThemeContext';

interface CustomInputProps {
  label?: string;
  icon?: string;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, {color: colors.text}]}>{label}</Text> : null}
      <View style={[styles.inputContainer, {backgroundColor: colors.lavender, borderColor: colors.border, opacity: editable ? 1 : 0.7}]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, {color: colors.text}]}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
});

export default CustomInput;
