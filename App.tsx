import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/context/ThemeContext';
import {AppProvider} from './src/context/AppContext';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
