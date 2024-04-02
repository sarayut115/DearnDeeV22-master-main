import React, { useState, useEffect, useRef } from "react";
import { Text, StyleSheet, View, Pressable, TextInput, Alert, TouchableOpacity, Keyboard } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Border, Color } from "../GlobalStyles";
import { Video } from "expo-av"; // เพิ่ม import Video
import { Ionicons } from '@expo/vector-icons';
import BlueDLogoVideo from '../assets/BlueDLogo.mp4';
import { firebase } from '../configotp';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

const OtpSMS = ({ route }) => {
    const { verificationId, phoneNumber } = route.params || {};

    const navigation = useNavigation();
    const auth = firebase.auth();
    const db = firebase.firestore();
    const videoRef = useRef(null); // เพิ่ม useRef สำหรับวิดีโอ
    const phoneNumberInputRef = useRef(null);
    const [code, setCode] = useState('');
    const codeInputRef = useRef(null);
    const recaptchaVerifier = useRef(null);
    const [remainingTime, setRemainingTime] = useState(30);
    const [verificationId2, setVerificationId2] = useState('');

    const countDown = () => {
        if (remainingTime > 0) {
            setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
        }
    };

    useEffect(() => {
        countDown();

    }, [remainingTime]);


    const sendVerification = async () => {
        try {
            const phoneProvider = new firebase.auth.PhoneAuthProvider();
            const verificationId = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current
            );
            alert('รหัสยืนยันถูกส่งไปยังโทรศัพท์ของคุณแล้ว');
            setVerificationId2(verificationId);
            console.log(verificationId)
            console.log(recaptchaVerifier)
            navigation.navigate("OtpSMS")
        } catch (error) {
            console.log(error);
            alert('ไม่สามารถส่งรหัสยืนยันได้ กรุณาลองอีกครั้ง');
        }
    };

    // const confirmCode = async () => {
    //     try {
    //         const credential = firebase.auth.PhoneAuthProvider.credential(
    //             verificationId,
    //             code
    //         );
    //         await firebase.auth().signInWithCredential(credential);
    //         alert('ลงชื่อเข้าใช้ด้วย OTP สำเร็จ');
    //         navigation.navigate("MainContainer")
    //     } catch (error) {
    //         console.log(error);
    //         alert('ลงชื่อเข้าใช้ไม่สำเร็จ โปรดตรวจสอบรหัสยืนยัน');
    //     }
    // };

    const confirmCode = async () => {
        try {
            let idToUse = verificationId2 || verificationId; // ใช้ verificationId2 ถ้าไม่ใช่สตริงว่าง มิฉะนั้นใช้ verificationId

            if (!idToUse) {
                // จัดการกรณีที่ไม่มี verificationId2 หรือ verificationId ให้ใช้
                console.log('ไม่มีรหัสยืนยันที่ใช้ได้');
                return;
            }

            const credential = firebase.auth.PhoneAuthProvider.credential(
                idToUse,
                code
            );
            await firebase.auth().signInWithCredential(credential);

            const user = firebase.auth().currentUser;
            // ตรวจสอบว่าผู้ใช้เคยล็อกอินก่อนหรือไม่
            const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
            if (!userDoc.exists) {
                // บันทึกหมายเลขโทรศัพท์ในฐานข้อมูลสำหรับผู้ใช้ใหม่
                await firebase.firestore().collection("users").doc(user.uid).set({
                    phoneNumber: phoneNumber
                });
                // นำผู้ใช้ไปยังหน้า RegisterPage สำหรับผู้ใช้ใหม่
                navigation.navigate("RegisterPage");
            } else {
                // นำผู้ใช้ไปยัง MainContainer สำหรับผู้ใช้เดิม
                navigation.navigate("MainContainer");
            }

            alert('ลงชื่อเข้าใช้ด้วย OTP สำเร็จ');
        } catch (error) {
            console.log(error);
            alert('ลงชื่อเข้าใช้ไม่สำเร็จ โปรดตรวจสอบรหัสยืนยัน');
        }
    };




    return (
        <Pressable style={styles.loginPage} onPress={() => {
            Keyboard.dismiss(); // เพิ่มนี้เพื่อให้คีย์บอร์ดหายไปเมื่อคลิกที่พื้นที่ว่างของหน้าจอ
            // ต่อไปคุณสามารถเรียกฟังก์ชันที่คุณต้องการทำหลังจากนี้
        }}>
            <View style={styles.titleSection}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        {/* onPress={() => navigation.navigate("ControlScreen", { deviceId: device.id, deviceName: device.name })} */}
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    {/* <Text style={styles.title}>นโยบายความเป็นส่วนตัว</Text> */}
                    <Text style={[styles.textwelcome, styles.textFlexBox]}>ใส่รหัสยืนยันตัวตน</Text>
                </View>

                {/* <Text style={[styles.textwelcome, styles.textFlexBox]}>หน้าOtp</Text> */}
                <Text style={[styles.text1, styles.textTypo12]}>คุณจะได้รับรหัสยืนยันผ่านทาง SMS ไปที่</Text>
                <Text style={[styles.text11, styles.textTypo]}>{phoneNumber}</Text>
                {/* <Text style={[styles.text10, styles.textTypo]}>ป้อนเบอร์โทรศัพท์ของคุณ</Text> */}
            </View>

            <Video
                ref={videoRef}
                source={BlueDLogoVideo}
                style={{ width: 200, height: 200, position: 'absolute', top: 100, alignSelf: 'center', borderRadius: 100 }}
                shouldPlay
                resizeMode="cover"
                isLooping={true}
                onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                        videoRef.current.replayAsync();
                    }
                }}
            />

            <View style={[styles.labelSection, styles.buttonLoginPosition]}>
                {/* ช่องกรอกรหัสยืนยัน */}
                <View style={[styles.label, styles.labelLayout]}>
                    <View style={[styles.labelBg, styles.labelChildPosition]}>
                        <TouchableOpacity
                            style={[styles.labelBgChild, styles.childLayout]}
                            onPress={() => {
                                codeInputRef.current.focus(); // focus ที่ TextInput ของรหัสยืนยัน
                            }}
                        >
                            {/* ... ข้อมูลที่อยู่ใน TouchableOpacity ... */}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.placeholderPosition]}>
                        <Image
                            style={[styles.iconlylightmessage]}
                            contentFit="cover"
                            source={require("../assets/materialsymbolspermphonemsgoutline.png")}
                        />
                        <TextInput
                            ref={codeInputRef}
                            style={styles.Phone}
                            placeholder="รหัสยืนยัน SMS"
                            onChangeText={setCode}
                            keyboardType="numeric"
                            maxLength={6} // กำหนดให้สามารถป้อนได้สูงสุด 6 ตัว
                        />
                    </View>
                </View>
            </View>
            <View style={styles.titleSectionAgian}>
                <Text style={[styles.textAgian, styles.textTypo12]}>กรุณารอ {remainingTime} วินาที ก่อนกดส่งอีกครั้ง</Text>
            </View>


            <TouchableOpacity
                style={[styles.buttonLogin, styles.buttonLoginPosition]}
                onPress={confirmCode}
            >
                <LinearGradient
                    style={[styles.buttonLoginChild, styles.labelChildPosition]}
                    locations={[0, 1]}
                    colors={["#92a3fd", "#9dceff"]}
                />
                <View style={styles.iconlyboldloginParent}>
                    <Image
                        style={styles.iconlyboldlogin}
                        contentFit="cover"
                        source={require("../assets/iconlylightarrow--right-2.png")}
                    />
                    <Text style={[styles.login, styles.textTypo]}>ยืนยัน</Text>
                </View>
            </TouchableOpacity>

            {remainingTime === 0 && (
                <TouchableOpacity
                    style={[styles.buttonLogin1, styles.buttonLoginPosition]}
                    onPress={sendVerification}
                >
                    <View style={styles.iconlyboldloginParent1}>
                        {/* <Image
                            style={styles.iconlyboldlogin}
                            contentFit="cover"
                            source={require("../assets/iconarrow.png")}
                        /> */}
                        <Text style={[styles.login1, styles.textTypo]}>ส่งรหัสอีกครั้ง</Text>
                    </View>
                </TouchableOpacity>
            )}



            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebase.app().options}
            />

        </Pressable>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        position: "absolute",
    },
    backButton: {
        // paddingRight: 50, // หรือค่าใดค่าหนึ่งที่ต้องการ
        right: 105
    },
    giftIcon: {
        width: 50, // ปรับขนาดของ GIF ตามต้องการ
        height: 50, // ปรับขนาดของ GIF ตามต้องการ
        marginLeft: 10, // ปรับระยะห่างของ GIF ตามต้องการ
    },
    textFlexBox: {
        textAlign: "left",
        position: "absolute",
    },
    textTypo: {
        fontFamily: FontFamily.titleH4Bold,
        fontWeight: "700",
    },
    textTypo12: {
        fontFamily: FontFamily.titleH4Bold,

    },
    buttonLoginPosition: {
        width: 315,
        alignSelf: 'center',
        position: "absolute",
    },
    labelChildPosition: {
        left: "0%",
        bottom: "0%",
        right: "0%",
        height: "100%",
        top: "0%",
        width: "100%",
    },

    childLayout: {
        borderRadius: Border.br_sm,
        position: "absolute",
    },
    labelLayout: {
        height: 60,
        width: 315,
        left: 0,
        position: "absolute",
        // backgroundColor: 'yellow'
    },
    placeholderPosition: {
        left: 15,
        top: 15,
        height: 32,
        width: 285,
        position: "absolute",
        // backgroundColor: 'red',
    },
    textwelcome: {
        left: -27,
        color: Color.blackColor,
        fontFamily: FontFamily.textSmallTextRegular,
        lineHeight: 24,
        textAlign: "center",
        fontSize: 20,
        top: 0,
    },
    text1: {
        top: 255,
        fontSize: FontSize.textSmallTextRegular_size,
        lineHeight: 30,
        left: -45,
        textAlign: "left",
        position: "absolute",
        color: Color.blackColor,
        width: 300,
    },
    text11: {
        top: 280,
        fontSize: FontSize.textLargeTextRegular_size,
        lineHeight: 30,
        left: -5,
        textAlign: "left",
        position: "absolute",
        color: Color.blackColor,
        width: 300,
    },
    textAgian: {
        top: 280,
        fontSize: 13,
        lineHeight: 30,
        textAlign: "center",
        position: "absolute",
        color: Color.blackColor,
        width: 300,
        // backgroundColor:'red'
    },

    titleSection: {
        top: 40,
        width: 100,
        height: 63,
        alignSelf: 'center',
        position: "absolute",
    },

    titleSectionAgian: {
        top: 180,
        width: 100,
        height: 63,
        left: 47,
        position: "absolute",
    },
    buttonLoginChild: {
        borderRadius: Border.br_80xl,
        backgroundColor: Color.blueLinear,
        position: "absolute",
    },
    iconlyboldlogin: {
        width: "24%",
        right: "76%",
        maxWidth: "100%",
        maxHeight: "100%",
        left: "-10%",
        bottom: "0%",
        top: "0%",
        height: "100%",
        position: "absolute",
        overflow: "hidden",
    },
    login: {
        left: "30%",
        color: 'white',
        top: "0%",
        textAlign: "left",
        position: "absolute",
        lineHeight: 24,
        fontSize: FontSize.textLargeTextRegular_size,
    },
    login1: {
        left: "30%",
        color: 'blue',
        top: "0%",
        textAlign: "left",
        position: "absolute",
        lineHeight: 24,
        fontSize: FontSize.textLargeTextRegular_size,
    },
    iconlyboldloginParent: {
        height: "40%",
        width: "31.75%",
        top: "30%",
        right: "30.79%",
        bottom: "30%",
        left: "37.46%",
        position: "absolute",
    },
    iconlyboldloginParent1: {
        height: "40%",
        width: "31.75%",
        top: "30%",
        right: "30.79%",
        bottom: "30%",
        left: "28.46%",
        position: "absolute",
    },
    buttonLogin: {
        top: 720,
        shadowColor: "rgba(149, 173, 254, 0.3)",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 22,
        elevation: 22,
        shadowOpacity: 1,
        height: 60,
    },
    buttonLogin1: {
        top: 480,
        shadowColor: "rgba(149, 173, 254, 0.3)",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 22,
        elevation: 22,
        shadowOpacity: 1,
        height: 60,
        // backgroundColor:'red'
    },

    labelBgChild: {
        backgroundColor: Color.borderColor,
        // backgroundColor: 'blue',
        borderStyle: "solid",
        borderColor: Color.borderColor,
        borderWidth: 1,
        left: "0%",
        bottom: "0%",
        right: "0%",
        height: "100%",
        top: "0%",
        width: "100%",
    },
    labelBg: {
        position: "absolute",
    },
    iconlylightmessage: {
        left: 0,
        top: 3,
        width: 25,
        height: 25,
        position: "absolute",
    },
    Phone: {
        left: "15%",
        lineHeight: 18,
        fontSize: FontSize.textLargeTextRegular_size,
        top: 8,
        fontFamily: FontFamily.textLargeTextRegular,
    },

    label: {
        top: 0,
    },

    labelSection: {
        top: 370,
        height: 149,
        // backgroundColor:'red',

    },
    loginPage: {
        borderRadius: Border.br_11xl,
        backgroundColor: Color.whiteColor,
        flex: 1,
        height: 812,
        overflow: "hidden",
        width: "100%",
    },
});

export default OtpSMS;
