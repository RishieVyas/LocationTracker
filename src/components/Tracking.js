import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTraces } from '../utils/useTracesContext';
import { useTrips } from '../utils/useTripsContext';
import DeviceInfo from 'react-native-device-info';
import { userDetails } from '../utils/userDetailsContext';
import { useInterval } from '../utils/timerContext';
import Map from './Map';
import MessageModal from './MessageModal';
import { useComments } from '../utils/useCommentsContext';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const Tracking = ({ navigation, route }) => {

    const { createTraces, postTraces, setPostTraces } = useTraces();
    const { tripId } = route.params;
    const { mobileNumber, batteryCharging } = userDetails();
    const { tripDuration, isActive, setIsActive, timer, currentLocation, setCurrentLocation } = useInterval();
    const { patchTrip } = useTrips();
    const {createComments} = useComments();

    const [tracking, setTracking] = useState(false);
    const [mapView, setMapView] = useState(false);
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const [traceid, setTraceid] = useState("");
    const theme = useTheme();

    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
    };

    const handleSubmit = async (text) => {
        // Call your API here with the text input value
        const commentRes = await createComments({
            body : text,
            deviceTraceId : traceid
        })
    };

    const getCurrentDate = () => {
        const date = new Date(); // gets the current date
        const month = date.getMonth() + 1; // getMonth() returns month from 0-11 (Jan is 0)
        const day = date.getDate(); // returns day of the month
        const year = date.getFullYear(); // returns the year

        // Format the date into MM/DD/YYYY
        return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    };

    useEffect(() => {
        if (!tripId) {
            Alert.alert("Error", "Trip ID is not defined. Returning to Trips screen.");
            navigation.navigate('Trips');
        }
    }, [tripId, navigation]);

    const fetchBatteryLevel = async () => {
        try {
            const level = await DeviceInfo.getBatteryLevel()
            const batterypercentage = (level * 100).toFixed(0);
            console.log('Battery % :', batterypercentage);
            return parseInt(batterypercentage);
            // Returns a number between 0 and 1
        } catch (error) {
            console.error("Error fetching battery level: ", error);
        }
    };

    const formatTime = (timer) => {
        const getSeconds = `0${(timer % 60)}`.slice(-2);
        const minutes = `${Math.floor(timer / 60)}`;
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

        return `${getHours} : ${getMinutes} : ${getSeconds}`;
    };

    const locationTrackingTask = async (taskDataArguments) => {
        const { delay } = taskDataArguments;
        try {
            const locationOptions = {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 5000
            };
    
            const watcher = Geolocation.watchPosition(
                async (position) => {
                    try {
                        // Optionally fetch battery level
                        const batteryLevel = await fetchBatteryLevel();

                        // Create trace

                        const res = await createTraces({
                            alt: position.coords.altitude,
                            heading: position.coords.heading,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            speed: position.coords.speed,
                            phoneNumber: mobileNumber,
                            batteryIsCharging: batteryCharging,
                            batteryLevel: batteryLevel,
                            timestamp: position.timestamp,
                            tripId: tripId
                        });

                        console.log(" trace response ", res);
                        setPathCoordinates((prevCoords) => [
                            ...prevCoords,
                            {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            },
                        ]);

                        setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                        
                        setTraceid(res.id)
                        setPostTraces(res);

                    } catch (traceError) {
                        console.error("Error creating trace:", traceError);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                },
                locationOptions
            );

            // Continuously check if the background service is running
            while (BackgroundService.isRunning()) {
                await sleep(delay);
            }
            Geolocation.clearWatch(watcher);
        } catch (tripError) {
            console.error("Error creating trip:", tripError);
        }
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
            patchTrip(tripId,{ status: 'COMPLETED' });
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
        fetchBatteryLevel();
    }, []);


    const handleLocationTracking = () => {
        setTracking(!tracking);
        if (!tracking) {
            console.log('Location Tracking Started');
            startBackGroundTracking();

        } else {
            console.log('Location Tracking Stopped');
            stopBackGroundTracking();
        }
        setIsActive(!isActive);
    }

    const onCameraPress = () => {
        console.log(" trace id on camera press", traceid);
        navigation.navigate('CameraScreen', {traceid : traceid, postTraces : postTraces});
    }

    const onVideoCameraPress = () => {
        console.log(" trace id on camera press", traceid);
        navigation.navigate('VideoCameraScreen', {traceid : traceid, tripId: tripId });
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
                {!mapView ?
                    <>
                        <Text style={{ color: theme.colors.primary, fontSize: 25, fontWeight: 'bold', marginTop: 20 }}>{formatTime(timer)}</Text>
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
                                    <TouchableOpacity onPress={() => onCameraPress()} style={{ marginHorizontal: 20 }}>
                                        <Icon name="camera" size={50} color="#219ebc" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => onVideoCameraPress()} style={{ marginHorizontal: 20 }}>
                                        <Icon name="videocam" size={50} color="#0077b6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={showModal} style={{ marginHorizontal: 20, marginTop: 5 }}>
                                        <MaterialIcons name="message" size={40} color="#db3a34" />
                                    </TouchableOpacity>
                                    <MessageModal visible={modalVisible} hideModal={hideModal} submitText={handleSubmit} />
                                    <TouchableOpacity style={{ marginHorizontal: 20 }}>
                                        <MaterialIcons name="sos" size={50} color="#FFA500" />
                                    </TouchableOpacity>
                                </View>
                            </>
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={[styles.heading, { color: "#000" }]}>Tap to start location tracking</Text>
                                <Text style={{ color: theme.colors.primary, marginTop: 10, fontSize: 15 }}>Your trip duration was {formatTime(tripDuration)}</Text>
                            </View>
                        }
                    </> : null}
            </View>
            {mapView && currentLocation ? <Map currentLocation={currentLocation} pathCoordinates={pathCoordinates} tracking={tracking}/> : null}
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