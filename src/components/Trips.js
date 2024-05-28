import React, { useEffect, useContext, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import { Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrips } from '../utils/useTripsContext';
import { userDetails } from '../utils/userDetailsContext';
import DeviceInfo from 'react-native-device-info';
import { useIsFocused } from '@react-navigation/native';

const Trips = ({navigation}) => {

    const theme = useTheme();
    const isFocused = useIsFocused();


    const statusColors = {
        ONGOING: 'green',
        COMPLETED: theme.colors.primary,
        INDISGRESS: 'red'
    };

    const { firstName, lastName, mobileNumber, vehicle, batteryCharging } = userDetails();
    const deviceId = DeviceInfo.getDeviceId();

    const {
        fetchTrips, 
        trips,
        loadingTrips,
        deleteTrips,
        deleteTipsRes,
        createTrips,
        newTrip,
        loadingNewTrips
    } = useTrips();

    useEffect(() => {
        if (isFocused) {
            console.log("fetch trips called");
            fetchTrips(deviceId);
        }
    }, [isFocused, deviceId])

    const handleNewTrip = async () => {
        const res = await createTrips({
            firstName: firstName,
            lastName: lastName,
            deviceId: deviceId,
            status: "ONGOING",
            vehicleType: vehicle
        });
        console.log("---------------------Trip Created -----------------", res);
        if(!loadingNewTrips && res?.id) {
            navigation.navigate('Tracking', {tripId: res?.id});
        }
        console.log('Start New Trip');
    };

    const handleOpenTrip = (id) => {
        if (id) {
            navigation.navigate('Tracking', { tripId: id });
            console.log('Open Trip:', id);
        } else {
            ToastAndroid.show("Invalid trip ID", ToastAndroid.SHORT);
        }
    };

    const handleDeleteTrip = (id) => {
        console.log('Delete Trip:', id);
        deleteTrips(id);
        fetchTrips(" "); 
    };

    const renderTrip = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={{color: "#000", fontWeight: '500'}}>{item.vehicleType}</Title>
                <Paragraph style={{ color: statusColors[item.status], fontWeight: 400 }}>Status: {item.status}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button icon="delete" textColor= {theme.colors.primary} buttonColor='#FFF' style={{borderColor: theme.colors.primary}} onPress={() => handleDeleteTrip(item?.id)}>
                    Delete
                </Button>
                <Button icon="map" style={{backgroundColor: theme.colors.primary}} onPress={() => handleOpenTrip(item?.id)}>
                    Open
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Onboarding')} style={{marginBottom: 5}}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
            <Button icon="plus" mode="contained" onPress={handleNewTrip} style={{backgroundColor: theme.colors.primary, marginVertical: 10}}>
                New Trip
            </Button>
            {trips?.items?.length == undefined || trips?.items?.length == 0 ? <Paragraph style={{ textAlign: 'center', marginTop: 40, color: 'darkgrey' }}>No trips available {`\n`} Lets start a new trip</Paragraph> :
                <FlatList
                    data={trips.items}
                    renderItem={renderTrip}
                    keyExtractor={item => item.id}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    card: {
        marginVertical: 12,
        borderColor: 'lightgrey',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    buttonDelete: {
        color: '#003459',
    },
    buttonOpen: {
        color: '#003459',
    }
});

export default Trips;
