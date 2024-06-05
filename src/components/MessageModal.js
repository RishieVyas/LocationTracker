import React, { useState } from 'react';
import { Modal, StyleSheet, View, TextInput } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MessageModal = ({ visible, hideModal, submitText }) => {
  const [textInputValue, setTextInputValue] = useState('');

  const handleTextInputChange = (text) => {
    setTextInputValue(text);
  };

  const handleSubmit = () => {
    submitText(textInputValue);
    setTextInputValue('');
    hideModal();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={hideModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={{fontWeight: 'bold', paddingBottom: 10, color: "#000"}} >Comments</Text>
          <IconButton
            icon={() => <Icon name="close" size={24} color="red" />}
            onPress={hideModal}
            style={styles.closeButton}
          />
          <TextInput
            style={styles.textInput}
            multiline={true}
            numberOfLines={4}
            value={textInputValue}
            onChangeText={handleTextInputChange}
            placeholderTextColor={"gray"}
            placeholder="Enter text..."
          />
          <View style={{flexDirection: 'row'}}>
          <Button mode="contained" onPress={handleSubmit} style={{margin: 10}}>
            Submit
          </Button>
          <Button mode="outlined" onPress={hideModal} style={{margin: 10}}>
            Cancel
          </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    width: "75%",
    height: "50%",
    shadowColor: "#00ffff"
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingLeft: 10,
    width: '100%',
    color: "#000",
    flex: 1,
    // marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 2
  },
});

export default MessageModal;
