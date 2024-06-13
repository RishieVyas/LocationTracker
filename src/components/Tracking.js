import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
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
import { formatTimer, getCurrentDate } from '../utils/CommonFunctions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const Tracking = ({ navigation, route }) => {

    const { createTraces, postTraces, setPostTraces, sosActive, setsosActive} = useTraces();
    const { mobileNumber, batteryCharging } = userDetails();
    const { tripDuration, isActive, setIsActive, timer, currentLocation, setCurrentLocation } = useInterval();
    const { patchTrip } = useTrips();
    const {createComments} = useComments();
    const { tripId } = route.params;

    const [tracking, setTracking] = useState(false);
    const [mapView, setMapView] = useState(false);
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const [traceid, setTraceid] = useState("");
    const [newTrip, setNewTrip] = useState(false)
    const theme = useTheme();

    const [modalVisible, setModalVisible] = useState(false);

    const appState = useRef(AppState.currentState);
    const sosActiveRef = useRef(sosActive);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        sosActiveRef.current = sosActive;
    }, [sosActive]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground!');
            }

            appState.current = nextAppState;
            setAppStateVisible(appState.current);
            console.log('AppState', appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

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

    const locationTrackingTask = async (taskDataArguments) => {
        const { delay } = taskDataArguments;
        try {
            const locationOptions = {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 5000
            };
            console.log("app state", appStateVisible);
    
            const watcher = Geolocation.watchPosition(
                async (position) => {
                    try {
                        // Optionally fetch battery level
                        const batteryLevel = await fetchBatteryLevel();

                        // Create trace

                        console.log("sos state", sosActiveRef.current);

                        const res = await createTraces({
                            alt: position.coords.altitude,
                            heading: position.coords.heading,
                            isInDistress: sosActiveRef.current,
                            isForeground: appState.current == 'active',
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
            // patchTrip(tripId,{ status: 'ONGOING' });
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
            setNewTrip(true)
        }
        setIsActive(!isActive);
    }

    const onCameraPress = () => {
        console.log(" trace id on camera press", traceid);
        navigation.navigate('CameraScreen', {traceid : traceid, postTraces : postTraces});
    }

    const onVideoCameraPress = () => {
        console.log(" trace id on camera press", traceid);
        navigation.navigate('VideoCameraScreen', {traceid : traceid, tripId: tripId, postTraces: postTraces });
    }

    const onSOSPressed = () => {
        setsosActive(prev => {
            const newState = !prev;
            sosActiveRef.current = newState;  // Immediately update the ref as well
            return newState;
        });
    }

    return (
        <View style={styles.container}>
            {newTrip || tracking ? 
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} style={{ margin: 10 }}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
            : null }
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
                        <Text style={{ color: theme.colors.primary, fontSize: 25, fontWeight: 'bold', marginTop: 20 }}>{formatTimer(timer)}</Text>
                        <TouchableOpacity onPress={handleLocationTracking} style={{ marginVertical: 10 }} disabled={newTrip ? true : false} >
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
                                    <TouchableOpacity style={{ marginHorizontal: 20 }} onPress={onSOSPressed}>
                                        <MaterialIcons name="sos" size={50} color={sosActive ? "red" : "green"} />
                                    </TouchableOpacity>
                                </View>

                                {sosActive ? 
                                    <Text style={{fontSize: 15, color: "green", textAlign: 'center', margin: 10, fontWeight: 'bold'}}>
                                        SOS activated. Location flagged and team alerted.{`\n`} Press SOS again to deactivate.
                                    </Text>
                                : null}
                            </>
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={[styles.heading, { color: newTrip ? "#ef476f" : "#000" }]}>{newTrip ? " Go back to start a new trip " : "Tap to start location tracking"}</Text>
                                <Text style={{ color: theme.colors.primary, marginTop: 10, fontSize: 15 }}>{newTrip ? `Your trip duration was ${formatTimer(tripDuration)}` : null}</Text>
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