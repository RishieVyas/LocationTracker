import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, ToastAndroid } from 'react-native';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Video from 'react-native-video';
import { Button, useTheme } from 'react-native-paper';
import { useAttachments } from '../utils/useAttachmentsContext';

const VideoCameraScreen = ({ route, navigation }) => {
    const camera = useRef(null);
    const theme = useTheme();
    const device = useCameraDevice('back', {
        physicalDevices: [
            'ultra-wide-angle-camera',
            'wide-angle-camera',
            'telephoto-camera'
        ],
        hasFlash: true,
        hasTorch: true,
    })
    const frontdevice = useCameraDevice('front', {
        physicalDevices: [
            'ultra-wide-angle-camera',
            'wide-angle-camera',
            'telephoto-camera'
        ]
    })
    const {traceid, tripId} = route.params;
    const [mediaUri, setMediaUri] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);
    const [microphonePermission, setMicrophonePermission] = useState(false);
    const [flashEnable, setFlashEnable] = useState('off');
    const [frontCamera, setFrontCamera] = useState(false);
    const { createAttachment, setMediaType } = useAttachments();
    const [convertedUri, setConvertedUri] = useState(null);
    const [storagePermission, setStoragePermission] = useState(false);

    useEffect(() => {
        const requestPermissions = async () => {
            const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
            const microphoneStatus = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
            setCameraPermission(cameraStatus === RESULTS.GRANTED);
            setMicrophonePermission(microphoneStatus === RESULTS.GRANTED);
        };
        requestPermissions();
    }, []);

    if (!cameraPermission || !microphonePermission) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>No permission to access camera or microphone</Text>
            </View>
        );
    }

    

    const handleVideoCapture = async () => {

        if (camera.current) {
            if (isRecording) {
                const video = await camera.current.stopRecording();
                setMediaUri(video?.path);
                setIsRecording(false);
                setMediaType('video');
            } else {
                await camera.current.startRecording({
                    onRecordingFinished: (video) => {
                        setMediaUri(video.path)
                    //     CameraRoll.save(`file://${mediaUri}`, {
                    //     type: 'video',
                    // })
                    },
                    onRecordingError: (error) => console.error(error),
                    flash: flashEnable,
                    videoBitRate: 'low'
                });
                setIsRecording(true);
            }
        }
    };

    const handleUpload = async () => {
            try {
                // console.log("trace id --->", traceid);
                await createAttachment(traceid, mediaUri);
                navigation.navigate('Tracking', { tripId: tripId });
            } catch (error) {
                console.error('Upload failed:', error);
            }
            setMediaUri(null);
    };

    const onCloseButtonPressed = () => {
        navigation.goBack();
    }

    const onFlashPressed = () => {
        console.log('flash pressed');
        setFlashEnable((prevFlash) => (prevFlash === 'off' ? 'on' : 'off'));
        // setFlashEnable(!flashEnable)
        console.log('flash is ', flashEnable);
    }

    const onRecordAgainPressed = async () => {
        if (camera.current) {
            await camera.current.cancelRecording()
            setMediaUri(null)
            navigation.goBack();
        }
    }

    const onReverseCameraPressed = () => {
        setFrontCamera(!frontCamera)
    }

    if (!device) return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;

    return (
        <View style={styles.container}>
            {!mediaUri ? (
                <>
                    <Camera
                        ref={camera}
                        style={{ flex: 1 }}
                        device={!frontCamera ? device : frontdevice}
                        isActive={true}
                        video={true}
                        audio={true}
                        flash={flashEnable}
                        enableZoomGesture
                    />
                    <View style={styles.topButtons}>
                        <TouchableOpacity onPress={onCloseButtonPressed} style={styles.closeButton}>
                            <Icon name="close" size={30} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onFlashPressed} style={styles.iconButton}>
                            <Icon name={flashEnable === 'on' ? "flash" : "flash-off"} size={30} color= {flashEnable === 'on' ? "orange" : "white"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onReverseCameraPressed} style={styles.iconButton}>
                            <Icon name="camera-reverse" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleVideoCapture} style={isRecording ? styles.stopButton : styles.recordButton}>
                        <View style={styles.innerCircle(isRecording)} />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 10 }}>
                        <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.previewContainer}>
                        <Video
                            source={{ uri: mediaUri }}
                            style={styles.videoPreview}
                            controls={true}
                        />
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <Button
                                mode="contained"
                                onPress={handleUpload}
                                style={{ marginBottom: 10, paddingVertical: 5, borderRadius: 30, marginHorizontal: 10 }}
                                icon="upload">
                                Upload
                            </Button>
                            <Button
                                mode="contained"
                                onPress={onRecordAgainPressed}
                                style={{ marginBottom: 10, paddingVertical: 5, borderRadius: 30, marginHorizontal: 10 }}
                                icon="record">
                                Record Again
                            </Button>

                        </View>
                    </View>
                </>)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    camera: { flex: 1 },
    topButtons: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
    closeButton: { marginLeft: 10 },
    iconButton: { marginRight: 10, alignItems: 'center' },
    recordButton: { position: 'absolute', bottom: 30, left: '50%', marginLeft: -35, width: 70, height: 70, borderRadius: 35, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' },
    stopButton: { position: 'absolute', bottom: 30, left: '50%', marginLeft: -35, width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
    innerCircle: (isRecording) => ({ width: isRecording ? 30 : 60, height: isRecording ? 30 : 60, borderRadius: isRecording ? 5 : 30, backgroundColor: 'red' }),
    previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    videoPreview: { width: '100%', height: '80%' },
});

export default VideoCameraScreen;