import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useInterval } from '../utils/timerContext';

const Map = ({ currentLocation, pathCoordinates, tracking }) => {
    // const {currentLocation} = useInterval

    return (
        <View style={{ flex: 1, marginVertical: 5 }}>
            {!currentLocation ? <ActivityIndicator size={'large'} /> :
                <MapView
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: currentLocation?.latitude,
                        longitude: currentLocation?.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}>
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude
                        }}
                        pinColor='red'
                    />
                    <Polyline
                        coordinates={pathCoordinates}
                        strokeColor="red" // border color
                        fillColor="rgba(0, 200, 0, 0.5)"
                        strokeWidth={5}
                    />
                </MapView>
            }
        </View>
    )
}
export default Map;