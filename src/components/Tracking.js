import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState, NativeEventEmitter, NativeModules, DeviceEventEmitter } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundService from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTraces } from '../utils/useTracesContext';
import { useTrips } from '../utils/useTripsContext';
import { useInterval } from '../utils/timerContext';
import Map from './Map';
import MessageModal from './MessageModal';
import { useComments } from '../utils/useCommentsContext';
import { fetchBatteryLevel, formatTimer, getCurrentDate } from '../utils/CommonFunctions';

const Tracking = ({ navigation, route }) => {

    const { postTraces, sosActive, setsosActive, pathCoordinates, traceid, locationTrackingTask, options, sosActiveRef} = useTraces();
    const { tripDuration, isActive, setIsActive, timer, currentLocation } = useInterval();
    const { patchTrip } = useTrips();
    const {createComments} = useComments();
    const theme = useTheme();
    const { tripId } = route.params;
    const [tracking, setTracking] = useState(false);
    const [mapView, setMapView] = useState(false);
    const [newTrip, setNewTrip] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
    };

    const handleSubmit = async (text) => {
        await createComments({
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