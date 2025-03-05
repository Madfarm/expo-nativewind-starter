import * as MediaLibrary from 'expo-media-library';
import { Alert, PermissionsAndroid } from 'react-native';

export const requestAllPermissions = async () => {
  try {
    const [storageStatus, recordStatus] = await Promise.all([
      MediaLibrary.requestPermissionsAsync(),
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ) 
    ]);

    if (storageStatus.status !== 'granted') {
      alert('Storage permission is required!');
    }

    if (recordStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      alert('Record audio permission is required!');
    }


    return storageStatus.status == 'granted' && recordStatus == PermissionsAndroid.RESULTS.GRANTED;

  } catch (error) {
    console.error("Error requesting permissions:", error);
  }

  
};


export const checkAllPermissions = async () => {
  Alert.alert("Permissions have been checked")

  try {
    const [storageStatus, recordStatus] = await Promise.all([
      MediaLibrary.getPermissionsAsync(),
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO),
    ]);

    const isStorageGranted = storageStatus.status === 'granted';
    const isRecordGranted = recordStatus === true; 

    return isStorageGranted && isRecordGranted;

  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
};