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

const OtpLogin = () => {
    const navigation = useNavigation();
    const auth = firebase.auth();
    const db = firebase.firestore();
    const [phoneNumber, setPhoneNumber] = useState("");
    const videoRef = useRef(null); // เพิ่ม useRef สำหรับวิดีโอ
    const phoneNumberInputRef = useRef(null);
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
            alert('รหัสยืนยันถูกส่งไปยังโทรศัพท์ของคุณแล้ว');
            console.log(verificationId)
            console.log(recaptchaVerifier)
            // navigation.navigate("ControlScreen", { deviceId: recaptchaVerifier, deviceName: verificationId })
            navigation.navigate("OtpSMS", { verificationId: verificationId, phoneNumber: phoneNumber });
        } catch (error) {
            console.log(error);
            alert('ไม่สามารถส่งรหัสยืนยันได้ กรุณาลองอีกครั้ง');
        }
    };

    const formatPhoneNumber = (input) => {
        // ตรวจสอบว่า input เป็นตัวเลขหรือไม่
        const phoneNumber = input.replace(/\D/g, '');
        // ถ้าเบอร์โทรศัพท์ไม่ถูกต้องหรือว่างเปล่าให้ return ค่าว่าง
        if (!phoneNumber || isNaN(phoneNumber)) {
            return '';
        }
        // ถ้าเบอร์โทรศัพท์มีความยาวมากกว่า 10 หลักให้ return เฉพาะ 10 หลักแรก
        if (phoneNumber.length > 10) {
            return `+${phoneNumber.slice(0, 10)}`;
        }
        // ถ้าเบอร์โทรศัพท์เป็น 0 นำหน้า ให้ return เป็น +66
        if (phoneNumber.startsWith('0')) {
            return `+66${phoneNumber.slice(1)}`;
        }
        // ถ้าไม่ตรงกับเงื่อนไขข้างบนให้ return ค่าที่ป้อนเข้ามาโดยตรง
        return input;
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
                    <Text style={[styles.textwelcome, styles.textFlexBox]}>ยินดีต้อนรับ</Text>
                </View>

                {/* <Text style={[styles.textwelcome, styles.textFlexBox]}>หน้าOtp</Text> */}
                <Text style={[styles.text1, styles.textTypo]}>เข้าสู่ระบบ</Text>
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
                {/* ช่องกรอกเบอร์โทร */}
                <View style={[styles.label, styles.labelLayout]}>
                    <View style={[styles.labelBg, styles.labelChildPosition]}>
                        <TouchableOpacity
                            style={[styles.labelBgChild, styles.childLayout]}
                            onPress={() => {
                                phoneNumberInputRef.current.focus(); // focus ที่ TextInput ของอีเมล
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
                            ref={phoneNumberInputRef}
                            style={styles.Phone}
                            placeholder="เบอร์โทรศัพท์"
                            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* <View style={[styles.forgetPassword, styles.registerTextLayout]}>
                    <TouchableOpacity style={styles.text6Clr} onPress={() => navigation.navigate("LoginPage")}>
                        <Text>เข้าสู่ระบบด้วยอีเมล</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
            {/* ปุ่มเข้าสู่ระบบ */}
            <TouchableOpacity
                style={[styles.buttonLogin, styles.buttonLoginPosition]}
                onPress={sendVerification}
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
                    <Text style={[styles.login, styles.textTypo]}>ถัดไป</Text>
                </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
                style={[styles.registerText, styles.registerTextLayout]}
                onPress={() => navigation.navigate("RegisterPage1")}
            >
                <Text style={[styles.text3, styles.textPosition]}>
                    <Text style={styles.text4}>{`ยังไม่มีบัญชีใช่หรือไม่? `}</Text>
                    <Text style={[styles.text5, styles.textTypo]}>ลงทะเบียน</Text>
                </Text>
            </TouchableOpacity> */}

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
    text2Layout: {
        lineHeight: 18,
        fontSize: FontSize.textSmallTextRegular_size,
    },
    orItemPosition: {
        top: 9,
        maxHeight: "100%",
        position: "absolute",
    },
    registerTextLayout: {
        height: 21,
        position: "absolute",
    },
    textPosition: {
        lineHeight: 21,
        fontSize: FontSize.linkBig_size,
        left: 0,
        top: 0,
    },
    groupChildLayout: {
        height: 50,
        width: 213,
    },
    childLayout: {
        borderRadius: Border.br_sm,
        position: "absolute",
    },
    text6Clr: {
        color: Color.gray2,
        textAlign: "left",
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
    hidePasswordIcon: {
        left: 50,
        top: -10,
    },
    hidePasswordIconLayout: {
        width: 23,
        height: 23,
        position: "absolute",
        // backgroundColor:'red'
    },
    IconLayoutpassword: {
        width: 18,
        height: 18,
        position: "absolute",
    },
    textwelcome: {
        left: 3,
        color: Color.blackColor,
        fontFamily: FontFamily.textSmallTextRegular,
        lineHeight: 24,
        textAlign: "left",
        fontSize: 20,
        top: 0,
    },
    text1: {
        top: 280,
        fontSize: FontSize.titleH4Bold_size,
        lineHeight: 30,
        left: 7,
        textAlign: "left",
        position: "absolute",
        color: Color.blackColor,
    },
    text10: {
        top: 240,
        fontSize: 16,
        lineHeight: 30,
        left: -120,
        textAlign: "left",
        position: "absolute",
        color: Color.blackColor,
        backgroundColor: 'red',
        width: 250,
    },
    text5: {
        top: 33,
        fontSize: FontSize.titleH4Bold_size - 5,
        lineHeight: 30,
        left: 0,
        textAlign: "left",
        position: "absolute",
        color: "#C58BF2",
    },
    titleSection: {
        top: 40,
        width: 100,
        height: 63,
        alignSelf: 'center',
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
        color: Color.whiteColor,
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
    text2: {
        left: 151,
        fontFamily: FontFamily.interRegular,
        textAlign: "left",
        position: "absolute",
        color: Color.blackColor,
        top: 0,
    },
    orChild: {
        width: 141,
        left: 0,
    },
    orItem: {
        left: 175,
        width: 140,
    },
    or: {
        top: 633,
        height: 18,
        width: 315,
        left: 30,
        position: "absolute",
    },
    text4: {
        color: Color.blackColor,
        fontFamily: FontFamily.textSmallTextRegular,
    },
    text3: {
        textAlign: "left",
        position: "absolute",
    },
    registerText: {
        top: 750,
        left: 98,
        width: 200,
    },
    groupChild: {
        backgroundColor: Color.colorGainsboro,
        height: 50,
        width: 213,
        left: 0,
        top: 0,
    },
    googleLogoPngSuiteEverythiIcon: {
        left: 170,
        width: 30,
        height: 30,
        top: 10,
        position: "absolute",
    },
    google: {
        width: "69.95%",
        top: "22%",
        left: "9.39%",
        fontSize: FontSize.size_smi,
        color: Color.blackColor,
        fontFamily: FontFamily.textSmallTextRegular,
        lineHeight: 24,
        textAlign: "left",
    },
    rectangleParent: {
        left: 0,
        top: 0,
        position: "absolute",
    },
    loginSocialMedia: {
        top: 671,
        left: 82,
        position: "absolute",
    },
    text6: {
        textDecoration: "underline",
        fontWeight: "500",
        fontFamily: FontFamily.textSmallTextMedium,
        lineHeight: 21,
        fontSize: FontSize.linkBig_size,
        left: 0,
        top: 0,
    },
    forgetPassword: {
        top: 300,
        left: 105,
        width: 120,
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
    password: {
        left: "15%",
        lineHeight: 18,
        fontSize: FontSize.textSmallTextRegular_size,
        top: "0%",
        fontFamily: FontFamily.textSmallTextRegular,
    },
    placeholder1: {
        width: 220,
    },
    label1: {
        top: 63,
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

export default OtpLogin;
