import React, { useEffect, useRef, useState } from 'react';
import { View, Button, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useAttachments } from '../utils/useAttachmentsContext';

const CameraScreen = ({traceid, navigation}) => {
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const { createAttachment } = useAttachments();
  const device = useCameraDevices().back;
  const camera = useRef<Camera>(null)

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
      const microphoneStatus = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      setCameraPermission(cameraStatus === RESULTS.GRANTED);
      setMicrophonePermission(microphoneStatus === RESULTS.GRANTED);
    };
    requestPermissions();
  }, []);

  const handleMediaCapture = async () => {
    if (device) {
      const photo = await device.takePhoto();
      setMediaUri(photo.path);
      setMediaType('photo');
    }
  };

 
  const handleUpload = async () => {
    if (mediaUri) {
      try {
        const file = {
          uri: mediaUri,
          type: mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
          name: mediaType === 'photo' ? 'photo.jpg' : 'video.mp4',
        };
        await createAttachment({ deviceTraceId: traceid }, file);
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

  return (
    // <View style={styles.container}>
    <>
      {device && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
      )}
      <TouchableOpacity onPress={handleMediaCapture} style={styles.captureButton}>
        <Text style={styles.captureButtonText}>Capture</Text>
      </TouchableOpacity>
      {mediaUri && mediaType === 'photo' && (
        <Image source={{ uri: mediaUri }} style={styles.preview} />
      )}
      {mediaUri && mediaType === 'video' && <Text>Video recorded</Text>}
      {mediaUri && (
        <Button title="Upload Media" onPress={handleUpload} />
      )}
      </>
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default CameraScreen;
