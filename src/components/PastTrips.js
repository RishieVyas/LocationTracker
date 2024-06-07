import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Polyline, Marker } from 'react-native-maps';

// Sample data
const sampleTrips = [
    {
        id: '1',
        date: '2024-05-20',
        duration: '2 hours',
        attachments: [
            {
                id: 'a1',
                uri: 'https://example.com/sample-photo.jpg',
                type: 'photo',
            },
            {
                id: 'a2',
                uri: 'https://example.com/sample-video.mp4',
                type: 'video',
            },
        ],
        notes: 'This is a sample note for trip 1.',
        commentId: 'c1',
        traces: [
            { latitude: 37.78825, longitude: -122.4324 },
            { latitude: 37.78825, longitude: -122.4334 },
            { latitude: 37.78925, longitude: -122.4344 },
        ],
    },
    // {
    //     id: '2',
    //     date: '2024-05-21',
    //     duration: '1 hour',
    //     attachments: [
    //         {
    //             id: 'a3',
    //             uri: 'https://example.com/sample-photo2.jpg',
    //             type: 'photo',
    //         },
    //     ],
    //     notes: 'This is a sample note for trip 2.',
    //     commentId: 'c2',
    //     traces: [
    //         { latitude: 37.78925, longitude: -122.4354 },
    //         { latitude: 37.79025, longitude: -122.4364 },
    //     ],
    // },
];

const PastTrips = () => {
    const navigation = useNavigation();

    const handleDeleteAttachment = (attachmentId) => {
        Alert.alert('Delete Attachment', 'Are you sure you want to delete this attachment?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => {/* Delete attachment logic */} },
        ]);
    };

    const handleDeleteComment = (commentId) => {
        Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => {/* Delete comment logic */} },
        ]);
    };

    const handleDeleteTraces = (tripId) => {
        Alert.alert('Delete Traces', 'Are you sure you want to delete these traces?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => {/* Delete traces logic */} },
        ]);
    };

    const renderAttachments = (attachments) => {
        return (
            <FlatList
                data={attachments}
                horizontal
                renderItem={({ item }) => (
                    <View style={styles.attachmentContainer}>
                        {item.type === 'photo' ? (
                            <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
                        ) : (
                            <Text style={styles.attachmentText}>Video</Text>
                        )}
                        <TouchableOpacity onPress={() => handleDeleteAttachment(item.id)} style={styles.deleteButton}>
                            <Ionicons name="trash" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        );
    };

    const renderTrip = ({ item }) => {
        return (
            <View style={styles.tripContainer}>
                <View style={styles.tripHeader}>
                    <Text style={styles.tripDate}>{item.date}</Text>
                    <Text style={styles.tripDuration}>{item.duration}</Text>
                </View>
                {item.attachments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Attachments</Text>
                        {renderAttachments(item.attachments)}
                    </View>
                )}
                {item.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                        <TouchableOpacity onPress={() => handleDeleteComment(item.commentId)} style={styles.deleteButton}>
                            <Ionicons name="trash" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip Route</Text>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: item.traces[0].latitude,
                            longitude: item.traces[0].longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Polyline
                            coordinates={item.traces}
                            strokeColor="red"
                            strokeWidth={6}
                        />
                        {item.traces.map((trace, index) => (
                            <Marker
                                key={index}
                                coordinate={trace}
                            />
                        ))}
                    </MapView>
                    <TouchableOpacity onPress={() => handleDeleteTraces(item.id)} style={styles.deleteButton}>
                        <Ionicons name="trash" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={sampleTrips}
                style={{flex:1}}
                renderItem={renderTrip}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

export default PastTrips;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tripContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        flex:1
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tripDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tripDuration: {
        fontSize: 14,
        color: 'gray',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    attachmentContainer: {
        position: 'relative',
        marginRight: 10,
    },
    attachmentImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    attachmentText: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: 'gray',
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 5,
    },
    notesText: {
        fontSize: 14,
        color: 'gray',
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
});