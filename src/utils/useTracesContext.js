// TracesContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { fetchApi } from './ApiUtils'
import { AppState } from 'react-native';
import { fetchBatteryLevel } from './CommonFunctions';
import Geolocation from 'react-native-geolocation-service';
import { userDetails } from './userDetailsContext';
import { useInterval } from './timerContext';
import BackgroundService from 'react-native-background-actions';
import { useTrips } from './useTripsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const TracesContext = createContext();

export const TracesProvider = ({ children }) => {
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postTraces, setPostTraces] = useState({})
    const [sosActive, setsosActive] = useState(false)
    const appState = useRef(AppState.currentState);
    const sosActiveRef = useRef(sosActive);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const { mobileNumber, batteryCharging } = userDetails();
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const { currentLocation, setCurrentLocation } = useInterval();
    const [traceid, setTraceid] = useState("");
    const {tripId, patchTrip} = useTrips();

    const createTraces = async (payload) => {
        // console.log("Traces Payload", payload);
        try {
            const data = await fetchApi('/traces', 'POST', payload);
            // console.log(" Traces Posted of the trip", data);
            setPostTraces(data)
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            setPostTraces([]);
        }
    };

    const fetchTraces = async (tripId) => {
        setLoading(true);
        try {
            const data = await fetchApi(`/traces?tripId=${tripId}`, 'GET');
            setTraces(data.items);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            setTraces([]);
        } finally {
            setLoading(false);
        }
    }

    const deleteTraces = async (traceId) => {
        setLoading(true);
        try {
            const data = await fetchApi(`/traces?tripId=${traceId}`, 'DELETE');
            console.log(" Traces Deleted ", data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

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

                        console.log("sos state", sosActiveRef.current);
                        console.log("---app state-----", appState.current);
                        console.log("taskDataArguments",taskDataArguments,"----trip id----", tripId);

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

                        // console.log(" trace response ", res);
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

    const startBackGroundTracking = async (id) => {
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

    const value = {
        traces,
        postTraces,
        loading,
        error,
        createTraces,
        fetchTraces,
        deleteTraces,
        setPostTraces,
        setTraces,
        sosActive, 
        setsosActive,
        options,
        traceid,
        currentLocation,
        pathCoordinates,
        locationTrackingTask,
        sosActiveRef,
        startBackGroundTracking,
        stopBackGroundTracking
    };

    return <TracesContext.Provider value={value}>{children}</TracesContext.Provider>;
};

export const useTraces = () => useContext(TracesContext);
