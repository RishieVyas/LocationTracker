// OnboardingForm.js
import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useValidatedInput, formatPhoneNumber, cleanPhoneNumber } from '../utils/CommonFunctions';

const Onboarding = ({ navigation }) => {
  const theme = useTheme(); // This hook uses the theme colors from the PaperProvider

  // State hooks for form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Function to handle the form submission
  const handleSubmit = () => {
    console.log('Form data', { firstName, lastName, mobileNumber, vehicle, emergencyContact });
    if (firstName == "" || lastName == "" || mobileNumber == "" || vehicle == "" || emergencyContact == "") {
      return alert('Please fill in all the fields');
    } else if (cleanPhoneNumber(mobileNumber).length !== 10 || cleanPhoneNumber(emergencyContact).length !== 10) {
      return alert('Contact number should be 10 digits');
    }
    else {
      navigation.navigate('Trips');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }} >
        <Image source={require('../assets/Images/ritis-logo.png')} style={{ marginBottom: 10 }} />
        <Text style={{
          fontSize: 20,
          fontWeight: '400',
          color: '#000',
        }}>
          Welcome to Ritis Tracker
        </Text>
        <Text style={{
          fontSize: 14,
          color: 'grey',
          fontWeight: '400',
          marginBottom: 10
        }}>
          Please fill in your details to get started
        </Text>
      </View>
      <TextInput
        label="First Name"
        value={useValidatedInput(firstName)}
        onChangeText={setFirstName}
        mode="outlined"
        outlineStyle={{ borderRadius: 20, borderColor: theme.colors.primary, borderWidth: 1 }}
        contentStyle={{ color: '#000' }}
        left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={useValidatedInput(lastName)}
        onChangeText={setLastName}
        mode="outlined"
        outlineStyle={{ borderRadius: 20, borderColor: theme.colors.primary, borderWidth: 1 }}
        contentStyle={{ color: '#000' }}
        left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
        style={styles.input}
      />
      <TextInput
        label="Mobile Number"
        value={formatPhoneNumber(mobileNumber)}
        onChangeText={setMobileNumber}
        mode="outlined"
        outlineStyle={{ borderRadius: 20, borderColor: theme.colors.primary, borderWidth: 1 }}
        contentStyle={{ color: '#000' }}
        keyboardType="phone-pad"
        left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
        style={styles.input}
      />
      <TextInput
        label="Vehicle"
        value={vehicle}
        onChangeText={setVehicle}
        mode="outlined"
        outlineStyle={{ borderRadius: 20, borderColor: theme.colors.primary, borderWidth: 1 }}
        contentStyle={{ color: '#000' }}
        left={<TextInput.Icon icon="car" color={theme.colors.primary} />}
        style={styles.input}
      />
      <TextInput
        label="Emergency Contact"
        value={formatPhoneNumber(emergencyContact)}
        onChangeText={setEmergencyContact}
        mode="outlined"
        outlineStyle={{ borderRadius: 20, borderColor: theme.colors.primary, borderWidth: 1 }}
        contentStyle={{ color: '#000' }}
        keyboardType="phone-pad"
        left={<TextInput.Icon icon="phone-in-talk" color={theme.colors.primary} />}
        style={styles.input}
        rippleColor={theme.colors.primary}
      />
      <Button
        mode="contained"
        onPress={handleSubmit}
        icon="send"
        style={[styles.input, { backgroundColor: theme.colors.primary, marginTop: 10, paddingVertical: 5, borderRadius: 20 }]}
      >
        Submit
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 10
  },
});

export default Onboarding;
