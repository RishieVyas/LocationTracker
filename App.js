import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/utils/Navigation';
import { Provider as PaperProvider } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';
import { IntervalProvider } from './src/utils/timerContext';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const App = () => {

  const [currentLocation, setCurrentLocation] = useState(null);

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

  const getCurrentLocation = () => {
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position.coords);
          console.log(position);
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    } catch (error) {
      console.warn(error);
    }
  }

  async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Notification Permission",
          message: "This app needs access to post notifications.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use notifications");
      } else {
        console.log("Notification permission denied");
      }
    }
  }

  const requestLocationPermission = async () => {
    try {
      const grantedForeground = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (grantedForeground === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Foreground location permission granted');
        getCurrentLocation();
        // Now request background location
        const grantedBackground = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "Background Location Permission",
            message: "Please select 'Allow all the time' for app functionality. \nLocation tracking is only active during trips.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (grantedBackground === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Background location permission granted');
        } else {
          console.log('Background location permission denied');
        }
      } else {
        console.log('Foreground location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    async function requestPermissions() {
      await requestNotificationPermission();
      await requestLocationPermission();
    }
    requestPermissions();
  }, []);  

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