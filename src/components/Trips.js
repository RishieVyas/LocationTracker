import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const tripsData = [
    { id: '1', vehicle: 'Car', status: 'COMPLETED' },
    { id: '2', vehicle: 'Truck', status: 'ONGOING' },
    { id: '3', vehicle: 'Cyber Truck', status: 'INDISGRESS' },
    { id: '4', vehicle: 'Car', status: 'COMPLETED' },
    { id: '5', vehicle: 'Truck', status: 'ONGOING' },
    { id: '6', vehicle: 'Cyber Truck', status: 'INDISGRESS' },
    { id: '7', vehicle: 'Car', status: 'COMPLETED' },
    { id: '8', vehicle: 'Truck', status: 'ONGOING' },
    { id: '9', vehicle: 'Cyber Truck', status: 'INDISGRESS' }
    // Add more trips here
];

const Trips = ({navigation}) => {

    const theme = useTheme();

    const statusColors = {
        ONGOING: 'green',
        COMPLETED: theme.colors.primary,
        INDISGRESS: 'red'
    };

    const handleNewTrip = () => {
        navigation.navigate('Tracking');
        console.log('Start New Trip');
    };

    const handleOpenTrip = (id) => {
        navigation.navigate('Tracking');
        console.log('Open Trip:', id);
    };

    const handleDeleteTrip = (id) => {
        console.log('Delete Trip:', id);
    };

    const renderTrip = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={{color: "#000", fontWeight: '500'}}>{item.vehicle}</Title>
                <Paragraph style={{ color: statusColors[item.status], fontWeight: 400 }}>Status: {item.status}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button icon="delete" textColor= {theme.colors.primary} buttonColor='#FFF' style={{borderColor: theme.colors.primary}} onPress={() => handleDeleteTrip(item.id)}>
                    Delete
                </Button>
                <Button icon="map" style={{backgroundColor: theme.colors.primary}} onPress={() => handleOpenTrip(item.id)}>
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
            {tripsData.length === 0 ? <Paragraph style={{ textAlign: 'center', marginTop: 20, color: 'darkgrey' }}>No trips available {`\n`} Lets start a new trip</Paragraph> :
                <FlatList
                    data={tripsData}
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
