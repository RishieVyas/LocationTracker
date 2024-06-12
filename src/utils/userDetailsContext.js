import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';

const userDetailsContext = createContext();

export const userDetails = () => useContext(userDetailsContext);

export const UserDetailProvider = ({ children }) => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [batteryCharging, setBatteryCharging] = useState(false);
    const [displayMobileNumber, setDisplayMobileNumber] = useState('');

    const loadUserDetails = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('userDetails');
            console.log('User details:', jsonValue);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
            console.error('Failed to load user details:', e);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            const details = await loadUserDetails();
            if (details) {
                setFirstName(details.firstName);
                setLastName(details.lastName);
                setMobileNumber(details.mobileNumber);
                setVehicle(details.vehicle);
                setDisplayMobileNumber(details.displayMobileNumber);
            }
        };

        const checkBatteryCharging = async () => {
            try {
                const isCharging = await DeviceInfo.isBatteryCharging();
                console.log(`Is the device charging? ${isCharging}`);
                setBatteryCharging(isCharging);
            } catch (error) {
                console.error('Failed to get battery status:', error);
            }
        }

        fetchUserDetails();
        checkBatteryCharging();
    }, []);


    const value = {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        mobileNumber,
        setMobileNumber,
        vehicle,
        setVehicle,
        batteryCharging,
        displayMobileNumber,
        setDisplayMobileNumber
    }

    return (
        <userDetailsContext.Provider value={value}>
            {children}
        </userDetailsContext.Provider>
    )
};