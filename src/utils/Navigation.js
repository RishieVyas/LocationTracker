import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding from '../components/Onboarding';
import Trips from '../components/Trips';
import Tracking from '../components/Tracking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import CameraScreen from '../components/CameraScreen';
import PastTrips from '../components/PastTrips';
import VideoCameraScreen from '../components/VideoCameraScreen';

const Stack = createStackNavigator();

const Navigation = () => {

    const [initialRoute, setInitialRoute] = useState("Onboarding"); // Default to Onboarding
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const determineInitialRoute = async () => {
            const onboarded = await AsyncStorage.getItem('onboarded');
            const tracking = await AsyncStorage.getItem('tracking');
            
            if (tracking === 'true' || onboarded === 'true') {
                console.log('initial route as tracking', tracking);
                setInitialRoute("Trips");
            } 
            // else if (onboarded === 'true') {
            //     console.log('initial route as Trips', onboarded);
            //     setInitialRoute("Trips");
            // } 
            else {
                setInitialRoute("Onboarding");
            }
            setIsLoading(false);
        };

        determineInitialRoute();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack.Navigator initialRouteName={initialRoute}>
            {console.log("initial route", initialRoute)}
            <Stack.Screen
                name="Onboarding"
                component={Onboarding}
                options={{ title: '', headerShown: false}}
            />
            <Stack.Screen
                name="Trips"
                component={Trips}
                options={{ title: 'Trips Details', headerShown: false}}
            />
            <Stack.Screen
                name="Tracking"
                component={Tracking}
                options={{ title: 'Location Tracker', headerShown: false}}
            />
            <Stack.Screen
                name="CameraScreen"
                component={CameraScreen}
                options={{ title: '', headerShown: false}}
            />
            <Stack.Screen
                name="VideoCameraScreen"
                component={VideoCameraScreen}
                options={{ title: '', headerShown: false}}
            />
            <Stack.Screen
                name="PastTrips"
                component={PastTrips}
                options={{ title: '', headerShown: false}}
            />
        </Stack.Navigator>
    );
}

export default Navigation;
