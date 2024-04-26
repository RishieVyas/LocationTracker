import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTraces } from '../utils/useTracesContext';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const Tracking = ({ navigation }) => {

    const { traces, loading, error, createTraces, fetchTraces, deleteTraces } = useTraces();

    const [tracking, setTracking] = useState(false);
    const [mapView, setMapView] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const theme = useTheme();

    const getCurrentDate = () => {
        const date = new Date(); // gets the current date
        const month = date.getMonth() + 1; // getMonth() returns month from 0-11 (Jan is 0)
        const day = date.getDate(); // returns day of the month
        const year = date.getFullYear(); // returns the year

        // Format the date into MM/DD/YYYY
        return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    };

    const formatTime = () => {
        const getSeconds = `0${(timer % 60)}`.slice(-2);
        const minutes = `${Math.floor(timer / 60)}`;
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

        return `${getHours} : ${getMinutes} : ${getSeconds}`;
    };

    const locationTrackingTask = async (taskDataArguments) => {
        const { delay } = taskDataArguments;
        await new Promise((resolve) => {
            const locationOptions = {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 5000,
                fastestInterval: 2000,
            };

            const watcher = Geolocation.watchPosition(
                (position) => {
                    console.log("Tracking in Progress", position);
                    
                    // Handle location update
                    // E.g., store to local storage or send to your server
                },
                (error) => {
                    console.error(error);
                },
                locationOptions
            );

            // Continuously running task
            const checkBackgroundService = async () => {
                while (BackgroundService.isRunning()) {
                    await sleep(delay);
                }
                Geolocation.clearWatch(watcher);  // Use clearWatch with the watcher ID
                resolve();
            };

            checkBackgroundService();
        });
    };

    const options = {
        taskName: 'Location Tracking',
        taskTitle: 'Ritis App Location Tracking Ongoing',
        taskDesc: 'Location Tracking is in progress',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
        parameters: {
            delay: 5000,
        },
    };

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setTimer((timer) => timer + 1);
            }, 1000);
        } else if (!isActive && timer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    const startBackGroundTracking = async () => {
        try {
            await BackgroundService.start(locationTrackingTask, options);
            if (BackgroundService.isRunning()) {
                await BackgroundService.updateNotification({ taskDesc: 'Tracking in Progress' });
            }
            await AsyncStorage.setItem('tracking', 'true'); // Save tracking state
            console.log('Background service started successfully');
        } catch (error) {
            console.error('Error starting the background service:', error);
        }
    };

    const stopBackGroundTracking = async () => {
        try {
            await BackgroundService.stop();
            await AsyncStorage.setItem('tracking', 'false'); // Save tracking state
            console.log('Background service stopped successfully');
        } catch (error) {
            console.error('Error stopping the background service:', error);
        }
    };

    useEffect(() => {
        const loadTrackingStatus = async () => {
            const tracking = await AsyncStorage.getItem('tracking');
            if (tracking === 'true') {
                setTracking(true);
                setIsActive(true);
                startBackGroundTracking();
            }
        };
        loadTrackingStatus();
    }, []);


    const handleLocationTracking = () => {
        console.log('Location Tracking Started');
        setTracking(!tracking);
        if (!tracking) {
            console.log('Location Tracking Started');
            startBackGroundTracking();

        } else {
            console.log('Location Tracking Stopped');
            stopBackGroundTracking();
        }
        setIsActive(!isActive);
        console.log('Timer:', timer);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} style={{ margin: 10 }}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
                <Text style={{ marginVertical: 20, fontSize: 20, color: "#000", fontWeight: 'bold' }}>{getCurrentDate()}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => setMapView(false)}
                        style={
                            {
                                borderBottomLeftRadius: 30,
                                borderTopLeftRadius: 30,
                                alignItems: 'center',
                                borderWidth: 2,
                                flex: 1,
                                marginLeft: 80,
                                backgroundColor: !mapView ? "#0000FF" : '#fff',
                                borderColor: !mapView ? "#0000FF" : 'lightgrey'
                            }
                        }>
                        <Text style={{ padding: 10, color: !mapView ? "#FFF" : "#000", fontWeight: 'bold' }}>Tracking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMapView(true)}
                        style={
                            {
                                borderBottomRightRadius: 30,
                                borderTopRightRadius: 30,
                                alignItems: 'center',
                                borderWidth: 2,
                                flex: 1,
                                marginRight: 80,
                                backgroundColor: mapView ? "#0000FF" : '#fff',
                                borderColor: mapView ? "#0000FF" : 'lightgrey'
                            }
                        }>
                        <Text style={{ padding: 10, color: mapView ? "#FFF" : "#000", fontWeight: 'bold' }}>Map</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: theme.colors.primary, fontSize: 25, fontWeight: 'bold', marginTop: 20 }}>{formatTime()}</Text>
                <TouchableOpacity onPress={handleLocationTracking} style={{ marginVertical: 10 }} >
                    <Icon
                        name={tracking ? "stop-circle" : "power-sharp"}
                        size={250}
                        color={tracking ? "#ef476f" : "#0000FF"}
                        style={{
                            textShadowColor: tracking ? "#FF10F0" : "#00ffff",
                            textShadowRadius: 10,
                        }}
                    />
                </TouchableOpacity>
                {tracking ?
                    <>
                        <Text style={{ color: '#ef476f', fontSize: 20, fontWeight: 'bold' }}>Location Tracking in Progress</Text>

                        <View style={{ flexDirection: 'row', marginTop: 30, borderWidth: 1, borderColor: 'lightgrey', borderRadius: 30 }}>
                            <TouchableOpacity style={{ marginHorizontal: 20 }}>
                                <Icon name="camera" size={50} color="#219ebc" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginHorizontal: 20 }}>
                                <Icon name="videocam" size={50} color="#0077b6" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginHorizontal: 20, marginTop: 5 }}>
                                <MaterialIcons name="message" size={40} color="#db3a34" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginHorizontal: 20 }}>
                                <MaterialIcons name="sos" size={50} color="#FFA500" />
                            </TouchableOpacity>
                        </View>
                    </>
                    : <Text style={[styles.heading, { color: "#000" }]}>Tap to start location tracking</Text>
                }
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 15,
    },
});

export default Tracking;