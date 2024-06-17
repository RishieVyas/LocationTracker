import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image, FlatList } from 'react-native';
import { useTraces } from '../utils/useTracesContext';
import { calculateAverageSpeed, calculateDuration, calculateTotalDistance, formatTime, formatTimestamp } from '../utils/CommonFunctions';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

const PastTrips = ({ route, navigation }) => {

    const { tripId } = route.params;
    const { fetchTraces } = useTraces();
    const [traceTimeStamp, setTraceTimeStamp] = useState([]);
    const [traceCoords, setTraceCoords] = useState([])
    const [tracesSpeed, setTracesSpeed] = useState([])
    const [tracesArr, setTracesArr] = useState([])
    const [attachmentArr, setAttachmentArr] = useState([])
    const [commentsArr, setCommentsArr] = useState([])
    const theme = useTheme();

    useEffect(() => {
        const getTraces = async () => {
            const traceRes = await fetchTraces(tripId);
            const extractedAttachments = []
            const extractedComments = []
            if (traceRes) {
                traceRes.items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                setTraceTimeStamp(traceRes.items.map((item) => item.timestamp))
                setTraceCoords(traceRes.items.map((item) =>
                ({
                    latitude: item.lat,
                    longitude: item.lng
                })
                ))
                setTracesSpeed(traceRes.items.map((item) => item.speed))
                setTracesArr(traceRes.items)
                traceRes.items.forEach(item => {
                    if (item?.attachments?.length > 0) {
                        item.attachments.forEach(attachments => {
                            extractedAttachments.push(attachments.url);
                        });
                    }
                    if (item?.comments?.length > 0) {
                        item.comments.forEach(comments => {
                            extractedComments.push(comments.body);
                        });
                    }
                });
                setAttachmentArr(extractedAttachments);
                setCommentsArr(extractedComments);
            }
            console.log(" extracted attachment array", extractedAttachments);
            console.log(" extracted comment array", extractedComments);
        }
        getTraces();
    }, [])

    const renderAttachments = (item) => {
        console.log("image item", item);
        return (
            <Image source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} style={styles.attachmentCard} />
        )
    }

    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} style={styles.headerContainer}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
                <Text style={styles.headerText}>Trip Details</Text>
            </TouchableOpacity>
            <Text style={styles.tripinfoheader}>Trip Info:</Text>
            <View style={styles.dateTimeView}>
                <Text style={styles.dateText}>
                    Trip Date : {formatTimestamp(traceTimeStamp[0])}{`\n\n`}Avg Speed : {calculateAverageSpeed(tracesSpeed).toFixed(2)} m/sec
                </Text>
                <Text style={styles.timeText}>
                    Start Time : {formatTime(traceTimeStamp[0])}{`\n\n`}End Time : {formatTime(traceTimeStamp[traceTimeStamp.length - 1])}
                </Text>
            </View>
            <View style={styles.flexRow}>
                <Text style={styles.distanceText} >Distance : {calculateTotalDistance(tracesArr).toFixed(2)} m</Text>
                <Text style={styles.durationText} >Duration : {calculateDuration(traceTimeStamp[0], traceTimeStamp[traceTimeStamp.length - 1])}</Text>
            </View>
            {attachmentArr?.length > 0 ?
                <View>
                    <Text style={styles.attachmentHeader}>Attachments:</Text>
                    <FlatList
                        data={attachmentArr}
                        style={{ margin: 5 }}
                        renderItem={(item) => renderAttachments(item.item)}
                        horizontal={true}
                    />
                </View>
                : null
            }
            {commentsArr?.length > 0 ?
                <View style={{ padding: 10 }} >
                    {console.log("comment array length", commentsArr.length)}
                    <Text style={styles.commentsHeader} >Comments:</Text>
                    {commentsArr.map((item) => {
                        console.log("comment array item ----->", item);
                        return (
                            <Text style={styles.commentContent}>
                                {item}
                            </Text>
                        )
                    })}
                </View>
                : null}
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
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    dateTimeView: {
        flexDirection: 'row',
        margin: 10
    },
    dateText: {
        fontSize: 15,
        color: "#000",
        textAlign: 'left'
    },
    timeText: {
        fontSize: 15,
        color: "#000",
        flex: 1,
        textAlign: 'right'
    },
    map: {
        width: "95%",
        flex: 1,
        margin: 10,
        marginRight: 30,
        borderRadius: 20
    },
    distanceText: {
        fontSize: 15,
        textAlign: 'left',
        color: "#000",
        margin: 10,
        flex: 1
    },
    durationText: {
        fontSize: 15,
        textAlign: 'right',
        color: "#000",
        margin: 10
    },
    attachmentCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'lightgrey',
        width: 120,
        height: 130,
        margin: 10
    },
    commentContent: {
        fontSize: 15,
        color: 'black'
    },
    headerContainer: {
        margin: 10,
        flexDirection: 'row'
    },
    headerText: {
        color: "black",
        fontSize: 22,
        marginTop: 2,
        fontWeight: '300',
        marginLeft: 10
    },
    flexRow: {
        flexDirection: 'row'
    },
    attachmentHeader: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black',
        margin: 10
    },
    commentsHeader: {
        fontWeight: 'bold',
        color: "black"
    },
    tripinfoheader: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black',
        marginLeft : 10
    }
});
export default PastTrips;