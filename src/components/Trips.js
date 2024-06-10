import React, { useEffect, useContext, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, ToastAndroid, Alert } from 'react-native';
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
        loadingNewTrips,
        setTripId, 
        tripId
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
            setTripId(res?.id)
            navigation.navigate('Tracking', {tripId : res?.id});
        }
        console.log('Start New Trip');
    };

    const handleOpenTrip = (id, status) => {
        if (id) {
            if(status == "ONGOING"){
                navigation.navigate('Tracking', {tripId : id});
            } else {
                navigation.navigate('PastTrips')
            }
            console.log('Open Trip:', id);
        } else {
            ToastAndroid.show("Invalid trip ID", ToastAndroid.SHORT);
        }
    };

    const handleDeleteTrip = (id) => {
        console.log('Delete Trip:', id);
        Alert.alert('Delete Trip', 'You want to delete this trip?', [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => {
                deleteTrips(id)
                fetchTrips(" ")
            }},
          ]);
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
                <Button icon="map" style={{backgroundColor: theme.colors.primary}} onPress={() => handleOpenTrip(item?.id, item?.status)}>
                    Open
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Onboarding')} style={{marginBottom: 5}}>
                <Icon name="person" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
            <Button icon="plus" mode="contained" onPress={handleNewTrip} style={{backgroundColor: theme.colors.primary, marginVertical: 10}}>
                New Trip
            </Button>
            {trips?.items?.length == undefined ? <ActivityIndicator size={'large'}/> : null}
            {trips?.items?.length == 0 ? <Paragraph style={{ textAlign: 'center', marginTop: 40, color: 'darkgrey' }}>No trips available {`\n`} Lets start a new trip</Paragraph> :
                <FlatList
                    data={trips.items}
                    renderItem={renderTrip}
                    keyExtractor={item => item.id}
                />
            }
            {loadingTrips &&
                <View style={{flex:1, alignItems: 'center', justifyContent: 'center', position: 'absolute', height:"100%", width:"100%", marginLeft: 10, marginTop: 10}}>
                    <ActivityIndicator size={'large'} color={theme.colors.primary} />
                </View>
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
