import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import { useTraces } from '../utils/useTracesContext';
import { calculateAverageSpeed, calculateTotalDistance, formatTime, formatTimestamp } from '../utils/CommonFunctions';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

const PastTrips = ({route, navigation}) => {

    const {tripId} = route.params;
    const {fetchTraces} = useTraces();
    const [traceTimeStamp, setTraceTimeStamp] = useState([]);
    const [traceCoords, setTraceCoords] = useState([])
    const [tracesSpeed, setTracesSpeed] = useState([])
    const [tracesArr, setTracesArr] = useState([])
    const theme = useTheme();

    useEffect(() => {
        const getTraces = async () => {
            const traceRes = await fetchTraces(tripId);
            if (traceRes) {
                traceRes.items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                setTraceTimeStamp(traceRes.items.map((item) => item.timestamp))
                setTraceCoords(traceRes.items.map((item) =>
                    ({
                        latitude : item.lat,
                        longitude : item.lng
                    })
                ))
                setTracesSpeed(traceRes.items.map((item) => item.speed))
                setTracesArr(traceRes.items)
            }
        }
        getTraces();
    }, [])

    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} style={{ margin: 10 }}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.dateTimeView}>
                <Text style={styles.dateText}>
                    Trip Date : {formatTimestamp(traceTimeStamp[0])}{`\n\n`}Avg Speed : {calculateAverageSpeed(tracesSpeed).toFixed(2)} m/sec
                </Text>
                <Text style={styles.timeText}>
                    Start Time : {formatTime(traceTimeStamp[0])}{`\n\n`}End Time : {formatTime(traceTimeStamp[traceTimeStamp.length-1])}
                </Text>
            </View>
            <Text style={styles.distanceText} >Distance Travelled : {calculateTotalDistance(tracesArr)} meteres</Text>
            {traceCoords.length > 0 ? 
            <>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: traceCoords[0].latitude,
                        longitude: traceCoords[0].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Polyline
                        coordinates={traceCoords}
                        strokeColor="red"
                        strokeWidth={6}
                    />
                        <Marker
                            coordinate={
                                {
                                    latitude: traceCoords[0].latitude,
                                    longitude: traceCoords[0].longitude
                                }
                            }
                            pinColor='purple'
                        />
                        <Marker
                            coordinate={
                                {
                                    latitude: traceCoords[traceCoords.length - 1].latitude,
                                    longitude: traceCoords[traceCoords.length - 1].longitude
                                }
                            }
                            pinColor='red'
                        />
                </MapView>
            </> : <ActivityIndicator size={'large'} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container : {
        flex:1,
        backgroundColor: "#FFF"
    },
    dateTimeView : {
        flexDirection: 'row',
        margin: 10
    },
    dateText : {
        fontSize : 15,
        color: "#000",
        textAlign: 'left'
    },
    timeText : {
        fontSize : 15,
        color: "#000",
        flex:1,
        textAlign: 'right'
    },
    map : {
        width: "95%",
        height : "90%",
        margin: 10,
        marginRight: 30,
        borderRadius: 20
    },
    distanceText : {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: "#000",
        marginTop: 5
    }
});
export default PastTrips;