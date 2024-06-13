import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useAttachments } from '../utils/useAttachmentsContext';
import { Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTraces } from '../utils/useTracesContext';
import RNFS from 'react-native-fs';

const CameraScreen = ({ route, navigation }) => {
    const [mediaUri, setMediaUri] = useState(null);
    const [cameraPermission, setCameraPermission] = useState(false);
    const [microphonePermission, setMicrophonePermission] = useState(false);
    const [flashEnable, setFlashEnable] = useState('off');
    const [frontCamera, setFrontCamera] = useState(false);
    const { createAttachment, setMediaType, setPictureCoords, loadingAttachments } = useAttachments();
    const { traceid, postTraces } = route.params

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
    const camera = useRef(null)
    const theme = useTheme();
    console.log("trace id 1 --->", traceid);

    useEffect(() => {
        const requestPermissions = async () => {
            const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
            const microphoneStatus = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
            setCameraPermission(cameraStatus === RESULTS.GRANTED);
            setMicrophonePermission(microphoneStatus === RESULTS.GRANTED);
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        setPictureCoords({
            latitude: postTraces?.lat,
            longitude: postTraces?.lng
        })
    }, [postTraces])

    const handleMediaCapture = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto({ qualityPrioritization: 'quality' });
            setMediaUri(`file://${photo.path}`);
            setMediaType('photo');
        }
    };

    const getFileSize = async (uri) => {
        try {
            const stats = await RNFS.stat(uri);
            return stats.size;
        } catch (error) {
            console.error('Error getting file size:', error);
            return null;
        }
    };


    const handleUpload = async () => {
        if (mediaUri) {
            try {
                console.log("trace id --->", traceid);
                const fileSize = await getFileSize(mediaUri);
                console.log("file size of image is ", fileSize);
                await createAttachment(traceid, mediaUri);
                navigation.goBack();
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
    };

    if (!cameraPermission || !microphonePermission) {
        return (
            <View style={styles.container}>
                <Text>No permission to access camera or microphone</Text>
            </View>
        );
    }

    const onCloseButtonPressed = () => {
        navigation.goBack();
    }

    const onFlashPressed = () => {
        console.log('flash pressed');
        setFlashEnable((prevFlash) => (prevFlash === 'off' ? 'on' : 'off'));
        // setFlashEnable(!flashEnable)
        console.log('flash is ', flashEnable);
    }

    const onReverseCameraPressed = () => {
        setFrontCamera(!frontCamera)
    }

    return (
        <View style={{ flex: 1 }}>
            {!mediaUri ? <>
                <Camera
                    ref={camera}
                    style={{ flex: 1 }}
                    device={!frontCamera ? device : frontdevice}
                    isActive={true}
                    photo={true}
                    enableLocation={true}
                    flash={flashEnable}
                />
                <View style={styles.topButtons}>
                    <TouchableOpacity onPress={onCloseButtonPressed} style={styles.closeButton}>
                        <Icon name="close" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onFlashPressed} style={styles.iconButton}>
                        <Icon name={flashEnable === 'on' ? "flash" : "flash-off"} size={30} color={flashEnable === 'on' ? "orange" : "white"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onReverseCameraPressed} style={styles.iconButton}>
                        <Icon name="camera-reverse" size={30} color="white" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleMediaCapture} style={styles.captureButton} />
            </>
                : null}

            {mediaUri && (
                <View style={{ margin: 5, flex: 1 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 10 }}>
                        <Icon name="arrow-back-sharp" size={30} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Image source={{ uri: mediaUri }} style={styles.preview} />
                </View>
            )}
            {mediaUri && (
                <Button
                    mode="contained"
                    onPress={handleUpload}
                    style={{ marginHorizontal: 70, marginBottom: 10, paddingVertical: 5, borderRadius: 30 }}
                    icon="upload">
                    Upload
                </Button>
            )}
            {loadingAttachments && <ActivityIndicator size={'large'} style={{ position: 'absolute' }} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        margin: 10,
        flex: 1,
        borderRadius: 10
    },
    captureButton: {
        position: 'absolute',
        bottom: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderColor: "white",
        borderWidth: 8
    },
    closeButton: { marginLeft: 10 },
    iconButton: { marginRight: 10, alignItems: 'center' },
    topButtons: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
});

export default CameraScreen;
