import { ScrollView, Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { firebase } from '../configotp';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

const Otp = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [code, setCode] = useState('');
    const recaptchaVerifier = useRef(null);

    const sendVerification = async () => {
        try {
            const phoneProvider = new firebase.auth.PhoneAuthProvider();
            const verificationId = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(verificationId);
            alert('Verification code has been sent to your phone.');
        } catch (error) {
            console.log(error);
            alert('Failed to send verification code. Please try again.');
        }
    };

    const confirmCode = async () => {
        try {
            const credential = firebase.auth.PhoneAuthProvider.credential(
                verificationId,
                code
            );
            await firebase.auth().signInWithCredential(credential);
            alert('Successfully signed in with OTP.');
        } catch (error) {
            console.log(error);
            alert('Failed to sign in. Please check the verification code.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Your Phone Number</Text>
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={sendVerification}>
                <Text style={styles.buttonText}>Send Verification Code</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Enter Verification Code</Text>
            <TextInput
                style={styles.input}
                placeholder="Verification Code"
                onChangeText={setCode}
                keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.button} onPress={confirmCode}>
                <Text style={styles.buttonText}>Confirm Code</Text>
            </TouchableOpacity>

            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebase.app().options}
            />

        </View>
    );
};

export default Otp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
