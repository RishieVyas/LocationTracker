import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding from '../components/Onboarding';
import Trips from '../components/Trips';
import Tracking from '../components/Tracking';

const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <Stack.Navigator initialRouteName="Onboarding">
            <Stack.Screen
                name="Onboarding"
                component={Onboarding}
                options={{ title: '' }}
            />
            <Stack.Screen
                name="Trips"
                component={Trips}
                options={{ title: 'Trips Details' }}
            />
            <Stack.Screen
                name="Tracking"
                component={Tracking}
                options={{ title: 'Location Tracker' }}
            />
        </Stack.Navigator>
    );
}

export default Navigation;
