import React from 'react';
import {StyleSheet, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({title, onPress, disabled, loading, style, textStyle}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.9}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.button, style, (disabled || loading) && styles.disabled]}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomButton;
