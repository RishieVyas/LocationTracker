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
    const [traceCoords, setTraceCoords] = useState([]);
    const [tracesSpeed, setTracesSpeed] = useState([]);
    const [tracesArr, setTracesArr] = useState([]);
    const [attachmentArr, setAttachmentArr] = useState([]);
    const [commentsArr, setCommentsArr] = useState([]);
    const theme = useTheme();
    const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageUrl = 'http://tracker.ritis.org/uploads/b41150f38a9c4e1107d2642688dcc4a1';
        const authToken = 'g30rd4n15c00l!';

        const response = await fetch(imageUrl, {
        method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const blob = await response.blob();
        const blobId = blob.data.blobId
        setImageData(blobId)
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, []);

    useEffect(() => {
        const getTraces = async () => {
            const traceRes = await fetchTraces(tripId);
            const extractedAttachments = [];
            const extractedComments = [];
            if (traceRes) {
                traceRes.items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setTraceTimeStamp(traceRes.items.map((item) => item.timestamp));
                setTraceCoords(traceRes.items.map((item) => ({
                    latitude: item.lat,
                    longitude: item.lng
                })));
                setTracesSpeed(traceRes.items.map((item) => item.speed));
                setTracesArr(traceRes.items);
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
    }, []);

    const renderAttachments = ({ item }) => {
        console.log("item----->", imageData);
        return (
            <View style={{flex:1}}>
                {imageData && (
                <Image source={{ uri: `data:image/png;base64,${imageData}` }}  style={styles.attachmentCard} />
            )}
            </View>
        )
        
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} style={styles.headerContainer}>
                <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
                <Text style={styles.headerText}>Trip Details</Text>
            </TouchableOpacity>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trip Info:</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="calendar" />  Trip Date: {formatTimestamp(traceTimeStamp[0])}</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="time" />  Start Time: {formatTime(traceTimeStamp[0])}</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="time" />  End Time: {formatTime(traceTimeStamp[traceTimeStamp.length - 1])}</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="speedometer" />  Avg Speed: {calculateAverageSpeed(tracesSpeed).toFixed(2)} m/sec</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="navigate" />  Distance: {calculateTotalDistance(tracesArr).toFixed(2)} m</Text>
                <Text style={styles.infoText}><Icon color={theme.colors.primary} size={15} name="hourglass" />  Duration: {calculateDuration(traceTimeStamp[0], traceTimeStamp[traceTimeStamp.length - 1])}</Text>
            </View>
            {attachmentArr.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attachments:</Text>
                    <FlatList
                        data={attachmentArr}
                        renderItem={renderAttachments}
                        horizontal
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.attachmentsList}
                    />
                </View>
            )}
            {commentsArr.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Comments:</Text>
                    {commentsArr.map((item, index) => (
                        <Text key={index} style={styles.commentContent}>
                            {item}
                        </Text>
                    ))}
                </View>
            )}
            {traceCoords.length > 0 ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: traceCoords[0].latitude,
                        longitude: traceCoords[0].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Polyline coordinates={traceCoords} strokeColor="red" strokeWidth={6} />
                    <Marker coordinate={traceCoords[0]} pinColor="purple" />
                    <Marker coordinate={traceCoords[traceCoords.length - 1]} pinColor="red" />
                </MapView>
            ) : (
                <ActivityIndicator size="large" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '400',
        marginLeft: 10,
        color: "#333333"
    },
    section: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: "#555555"
    },
    infoText: {
        fontSize: 16,
        marginBottom: 4,
        color: "#777777"
    },
    attachmentsList: {
        marginTop: 8,
    },
    attachmentCard: {
        width: 150,
        height: 200,
        marginRight: 8,
        borderRadius: 8,
        borderColor: 'lightgrey',
        borderWidth: 1
    },
    commentContent: {
        fontSize: 16,
        marginBottom: 8,
        color: "#000"
    },
    map: {
        width: '100%',
        flex : 1,
        borderRadius: 8,
    },
});

export default PastTrips;
