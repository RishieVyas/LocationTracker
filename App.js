import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/utils/Navigation';
import { Provider as PaperProvider } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';
import { IntervalProvider } from './src/utils/timerContext';

const App = () => {

  const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#0000FF',  // Use your custom color
      accent: '#FFB703', // Use your custom color
      border: '#023047',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <IntervalProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </IntervalProvider>
    </PaperProvider>
  );
}

export default App;