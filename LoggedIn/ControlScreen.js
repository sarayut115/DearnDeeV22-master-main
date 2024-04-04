
import * as React from "react";
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Modal, Animated } from "react-native";
import Slider from '@react-native-community/slider';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Border, Color, FontFamily, FontSize, Padding } from "../GlobalStyles";
import { firebase } from '../config';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from "react-native-elements";
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const ControlScreen = ({ route }) => {

    const { deviceId, deviceName, devicesAll } = route.params;

    const navigation = useNavigation();
    const auth = firebase.auth();
    const db = firebase.firestore();
    const realtimeDB = firebase.database();

    const [isOn, setIsOn] = useState(false);

    const [isVectorActive, setIsVectorActive] = useState(false);
    const [isMaterialSymbolshdrAutoActive, setIsMaterialSymbolshdrAutoActive] = useState(false);
    const [isRimentalHealthFillActive, setIsRimentalHealthFillActive] = useState(false);

    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState(null); // เพิ่ม state เพื่อเก็บข้อมูลอายุ
    const [gender, setGender] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");

    const [value, setValue] = useState(0);

    const [valueRamp, setValueRamp] = useState(0);

    const [isDeviceOn, setIsDeviceOn] = useState(true); // เพิ่มตัวแปรเพื่อตรวจสอบว่าอุปกรณ์เปิดหรือปิด

    const [sliderValue, setSliderValue] = useState(0); // ค่าเริ่มต้นของสไลด์

    const [sliderValuePulse, setSliderValuePulse] = useState(200); // ค่าเริ่มต้นของสไลด์

    const [stimbattery, setStimbattery] = useState(null);

    const [sensorbattery, setSensorbattery] = useState(null);

    const [deviceStatus, setDeviceStatus] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [trigger, setTrigger] = useState(0);
    const [stimtrigger, setStimtrigger] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            const unsubscribe = db.collection('users')
                .doc(auth.currentUser.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        setUserData(userData);
                        console.log(userData)
                        setGender(userData.gender);
                        setHeight(userData.height);
                        setWeight(userData.weight)
                        if (userData.dateOfBirth) {
                            calculateAge(userData.dateOfBirth);
                        }
                    } else {
                        console.log('No such document!');
                    }
                });

            // Cleanup function
            return () => {
                unsubscribe();
            };
        }, [])
    );

    const calculateAge = (dateOfBirth) => {
        const birthDate = new Date(dateOfBirth.seconds * 1000);
        const currentDate = new Date();
        // คำนวณอายุโดยลบวันเกิดจากวันปัจจุบัน
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        // ตรวจสอบว่าวันเกิดผ่านไปแล้วหรือยัง
        const currentMonth = currentDate.getMonth() + 1;
        const birthMonth = birthDate.getMonth() + 1;
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        // เซ็ตค่าอายุใน state
        setAge(age);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const goBack = () => {
        navigation.goBack();
    };

    useEffect(() => {
        const checkDeviceStatus = () => {
            try {
                const deviceStatusRef = realtimeDB.ref('/test/trigger');
                deviceStatusRef.on('value', (snapshot) => {
                    const value = snapshot.val();
                    if (value === 1) {
                        setTrigger(1);
                        setStimtrigger(true)

                    } else if (value === 0) {
                        setTrigger(0);
                        setStimtrigger(false)
                    }

                });
            } catch (error) {
                console.error('Error fetching device status:', error);
            }
            console.log(trigger, 'trigger')
        };

        checkDeviceStatus();

        // อย่าลืมใช้ return function เพื่อยกเลิกการสมัครฟังเหตุการณ์เมื่อ Component ถูก unmount
        return () => {
            realtimeDB.ref('/test/trigger').off(); // ยกเลิกการสมัครฟังเหตุการณ์เมื่อ Component ถูก unmount
        };
    }, []);


    useEffect(() => {
        const checkDeviceStatus = () => {
            try {
                const deviceStatusRef = realtimeDB.ref('/test/isOn');
                deviceStatusRef.on('value', (snapshot) => {
                    const value = snapshot.val();
                    if (value === 1) {
                        setDeviceStatus(true);
                        setShowModal(false)

                    } else if (value === 0) {
                        setDeviceStatus(false);
                        setShowModal(true)
                    }

                });
            } catch (error) {
                console.error('Error fetching device status:', error);
            }
        };

        checkDeviceStatus();

        // อย่าลืมใช้ return function เพื่อยกเลิกการสมัครฟังเหตุการณ์เมื่อ Component ถูก unmount
        return () => {
            realtimeDB.ref('/test/isOn').off(); // ยกเลิกการสมัครฟังเหตุการณ์เมื่อ Component ถูก unmount
        };
    }, []);

    useEffect(() => {
        // Function to fetch data from Firebase Realtime Database
        const fetchData = () => {
            realtimeDB.ref('test/stim').on('value', snapshot => {
                const data = snapshot.val();
                // Update state with the fetched data
                setStimbattery(data);
            });
        };

        // Call the fetchData function when the component mounts
        fetchData();

        // Return a cleanup function to unsubscribe from Firebase Realtime Database when the component unmounts
        return () => {
            realtimeDB.ref('test/stim').off('value');
        };
    }, []);

    useEffect(() => {
        // Function to fetch data from Firebase Realtime Database
        const fetchData = () => {
            realtimeDB.ref('test/sensor').on('value', snapshot => {
                const data = snapshot.val();
                // Update state with the fetched data
                setSensorbattery(data);
            });
        };

        // Call the fetchData function when the component mounts
        fetchData();

        // Return a cleanup function to unsubscribe from Firebase Realtime Database when the component unmounts
        return () => {
            realtimeDB.ref('test/sensor').off('value');
        };
    }, []);

    useEffect(() => {
        // เมื่อค่า isOn เปลี่ยนแปลง ตรวจสอบว่าอุปกรณ์เปิดหรือปิด
        setIsDeviceOn(isOn);
        setValue(0);
        setValueRamp(0);
        console.log('=====')
        console.log(isDeviceOn, 'asdasd')
        setIsVectorActive(false)
        setIsMaterialSymbolshdrAutoActive(false)
        setIsRimentalHealthFillActive(false)
        // console.log(isRimentalHealthFillActive)
        // console.log(deviceId)
        // console.log(deviceName)
        console.log('=====')
    }, [isOn]);


    useEffect(() => {
        if (isOn) {
            const fetchModeFromFirebase = async () => {
                try {
                    const modeSnapshot = await realtimeDB.ref('test/Mode').once('value');
                    const mode = modeSnapshot.val();

                    // ตั้งค่าตาม mode ที่ได้รับมา
                    if (mode === 1) {
                        setIsVectorActive(true);
                        setIsMaterialSymbolshdrAutoActive(false);
                        setIsRimentalHealthFillActive(false);
                    } else if (mode === 2) {
                        setIsVectorActive(false);
                        setIsMaterialSymbolshdrAutoActive(true);
                        setIsRimentalHealthFillActive(false);
                    } else if (mode === 3) {
                        setIsVectorActive(false);
                        setIsMaterialSymbolshdrAutoActive(false);
                        setIsRimentalHealthFillActive(true);
                    }
                } catch (error) {
                    console.error('Error fetching mode from Firebase:', error);
                }
            };

            fetchModeFromFirebase();
        }
    }, [isOn]);


    // โหลดค่าเริ่มต้นของ isOn จาก AsyncStorage
    useEffect(() => {
        const loadIsOn = async () => {
            try {
                const storedIsOn = await AsyncStorage.getItem('isOn');
                if (storedIsOn !== null) {
                    setIsOn(storedIsOn === 'true'); // แปลงค่าเป็น boolean
                }
            } catch (error) {
                console.error('Error loading isOn from AsyncStorage:', error);
            }
        };

        loadIsOn();
    }, []);


    // บันทึกค่า isOn ลงใน AsyncStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const saveIsOn = async () => {
            try {
                await AsyncStorage.setItem('isOn', isOn.toString()); // แปลงค่าเป็น string ก่อนบันทึกลง AsyncStorage
            } catch (error) {
                console.error('Error saving isOn to AsyncStorage:', error);
            }
        };

        saveIsOn();
    }, [isOn]);


    const handleVectorPress = async () => {
        setIsVectorActive(true);
        setIsRimentalHealthFillActive(false);
        setIsMaterialSymbolshdrAutoActive(false);
        try {
            await AsyncStorage.setItem('isVectorActive', 'true');
            await AsyncStorage.setItem('isRimentalHealthFillActive', 'false');
            await AsyncStorage.setItem('isMaterialSymbolshdrAutoActive', 'false');
        } catch (error) {
            console.error('Error saving button state to AsyncStorage:', error);
        }
        setValue(1); // เปลี่ยนค่า value เป็น 1
        setSliderValue(20); // เปลี่ยนค่า sliderValue เป็น 20
        setSliderValuePulse(500);
        setValueRamp(3);

        // Update Firebase Realtime Database
        realtimeDB.ref('test/intensity').set(1); // อัปเดต 'test/intensity' เป็น 1
        realtimeDB.ref('test/frequency').set(20); // อัปเดต 'test/frequency' เป็น 20
        realtimeDB.ref('test/pluseup').set(500);
        realtimeDB.ref('test/rampup').set(5);
        realtimeDB.ref('test/Mode').set(1);
    };


    const handleRimentalHealthFillPress = async () => {
        setIsVectorActive(false);
        setIsRimentalHealthFillActive(true);
        setIsMaterialSymbolshdrAutoActive(false);
        try {
            await AsyncStorage.setItem('isVectorActive', 'false');
            await AsyncStorage.setItem('isRimentalHealthFillActive', 'true');
            await AsyncStorage.setItem('isMaterialSymbolshdrAutoActive', 'false');
        } catch (error) {
            console.error('Error saving button state to AsyncStorage:', error);
        }
        realtimeDB.ref('test/Mode').set(3);
    };

    // const handleMaterialSymbolshdrAutoPress = async () => {
    //     setIsVectorActive(false);
    //     setIsRimentalHealthFillActive(false);
    //     setIsMaterialSymbolshdrAutoActive(true);
    //     try {
    //         await AsyncStorage.setItem('isVectorActive', 'false');
    //         await AsyncStorage.setItem('isRimentalHealthFillActive', 'false');
    //         await AsyncStorage.setItem('isMaterialSymbolshdrAutoActive', 'true');
    //     } catch (error) {
    //         console.error('Error saving button state to AsyncStorage:', error);
    //     }
    //     setValue(3);
    //     setSliderValue(50);
    //     setSliderValuePulse(500);
    //     setValueRamp(5);

    //     // Update Firebase Realtime Database
    //     realtimeDB.ref('test/intensity').set(3); // อัปเดต 'test/intensity' เป็น 1
    //     realtimeDB.ref('test/frequency').set(50); // อัปเดต 'test/frequency' เป็น 20
    //     realtimeDB.ref('test/pluseup').set(500);
    //     realtimeDB.ref('test/rampup').set(5);
    //     realtimeDB.ref('test/Mode').set(2);
    // };

    const handleMaterialSymbolshdrAutoPress = async () => {
        setIsVectorActive(false);
        setIsRimentalHealthFillActive(false);
        setIsMaterialSymbolshdrAutoActive(true);
        try {
            await AsyncStorage.setItem('isVectorActive', 'false');
            await AsyncStorage.setItem('isRimentalHealthFillActive', 'false');
            await AsyncStorage.setItem('isMaterialSymbolshdrAutoActive', 'true');
        } catch (error) {
            console.error('Error saving button state to AsyncStorage:', error);
        }

        let intensityLevel = 3;
        let frequency = 20;
        let pulseup = 500;
        let rampup = 5;

        // ตรวจสอบเพศและอายุของผู้ใช้
        if (gender === 'ชาย' && age >= 18 && age <= 50) {
            intensityLevel = 4;
        } else if (gender === 'หญิง' && age >= 18 && age <= 50) {
            intensityLevel = 3;
        }


        const bmi = weight / ((height / 100) * (height / 100));


        if (age <= 12) {
            // ไม่ได้นำอายุมาคำนวณ BMI ในกรณีนี้ เพราะความแตกต่างของโครงสร้างร่างกายของเด็ก
            // จะมีการปรับค่าพารามิเตอร์ตามอายุและพัฒนาการแต่ละช่วงโดยไม่ใช้ BMI
        } else if (age >= 13) {
            if (bmi < 18.5) {
                // น้ำหนักน้อยกว่าเกณฑ์มาตรฐาน (ผอม)

                intensityLevel = 2;
                frequency = 30;
                pulseup = 300;
                rampup = 3;
            } else if (bmi >= 18.5 && bmi < 25) {
                // น้ำหนักอยู่ในเกณฑ์มาตรฐาน (ปกติ)
                // ปรับค่าพารามิเตอร์ตามความต้องการของผู้ใช้


                intensityLevel = 3;
                frequency = 30;
                pulseup = 400;
                rampup = 4;
            } else if (bmi >= 25 && bmi < 30) {
                // น้ำหนักเกินเกณฑ์มาตรฐาน (ท้วม)
                // ปรับค่าพารามิเตอร์ตามความต้องการของผู้ใช้

                // เช่น ปรับความแรง, ความถี่, Pulseup, Rampup ตามเงื่อนไขที่ต้องการ
                intensityLevel = 4;
                frequency = 25;
                pulseup = 300;
                rampup = 5;
            } else if (bmi >= 30) {
                // น้ำหนักอยู่ในเกณฑ์อ้วน
                // ปรับค่าพารามิเตอร์ตามความต้องการของผู้ใช้


                intensityLevel = 5;
                frequency = 20;
                pulseup = 200;
                rampup = 5;
            }
        }


        setValue(intensityLevel);
        setSliderValue(frequency);
        setSliderValuePulse(pulseup);
        setValueRamp(rampup);
        // Update Firebase Realtime Database
        realtimeDB.ref('test/intensity').set(intensityLevel);
        realtimeDB.ref('test/frequency').set(frequency);
        realtimeDB.ref('test/pluseup').set(pulseup);
        realtimeDB.ref('test/rampup').set(rampup);
        realtimeDB.ref('test/Mode').set(2);
    };


    // Load button state from AsyncStorage when component mounts
    useEffect(() => {
        const loadButtonState = async () => {
            try {
                const vectorActive = await AsyncStorage.getItem('isVectorActive');
                const rimentalHealthFillActive = await AsyncStorage.getItem('isRimentalHealthFillActive');
                const materialSymbolshdrAutoActive = await AsyncStorage.getItem('isMaterialSymbolshdrAutoActive');
                setIsVectorActive(vectorActive === 'true');
                setIsRimentalHealthFillActive(rimentalHealthFillActive === 'true');
                setIsMaterialSymbolshdrAutoActive(materialSymbolshdrAutoActive === 'true');
            } catch (error) {
                console.error('Error loading button state from AsyncStorage:', error);
            }
        };

        loadButtonState();
    }, []);


    // บันทึกค่า sliderValue ลงใน AsyncStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const loadSliderValue = async () => {
            try {
                const storedSliderValue = await AsyncStorage.getItem('sliderValue');
                if (storedSliderValue !== null) {
                    setSliderValue(parseInt(storedSliderValue)); // Parse string to integer
                }
            } catch (error) {
                console.error('Error loading sliderValue from AsyncStorage:', error);
            }
        };

        loadSliderValue();
    }, []);


    // โหลดค่า sliderValue จาก AsyncStorage เมื่อคอมโพเนนต์ถูกโหลดขึ้นมา
    useEffect(() => {
        const saveSliderValue = async () => {
            try {
                await AsyncStorage.setItem('sliderValue', sliderValue.toString()); // Convert integer to string
            } catch (error) {
                console.error('Error saving sliderValue to AsyncStorage:', error);
            }
        };

        saveSliderValue();
    }, [sliderValue]);


    // บันทึกค่า sliderValuePulse ลงใน AsyncStorage เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const loadSliderValuePulse = async () => {
            try {
                const storedSliderValuePulse = await AsyncStorage.getItem('sliderValuePulse');
                if (storedSliderValuePulse !== null) {
                    setSliderValuePulse(parseInt(storedSliderValuePulse)); // Parse string to integer
                }
            } catch (error) {
                console.error('Error loading sliderValue from AsyncStorage:', error);
            }
        };

        loadSliderValuePulse();
    }, []);


    // โหลดค่า sliderValuePulse จาก AsyncStorage เมื่อคอมโพเนนต์ถูกโหลดขึ้นมา
    useEffect(() => {
        const saveSliderValuePulse = async () => {
            try {
                await AsyncStorage.setItem('sliderValuePulse', sliderValuePulse.toString()); // Convert integer to string
            } catch (error) {
                console.error('Error saving sliderValuePulse to AsyncStorage:', error);
            }
        };

        saveSliderValuePulse();
    }, [sliderValuePulse]);



    useEffect(() => {
        // เมื่อค่า isOn เปลี่ยนและมีค่าเป็น true
        if (isOn) {
            // Subscribe to changes in the Firebase database
            const dbRef = realtimeDB.ref('test/intensity');
            const onDataChange = (snapshot) => {
                const intensityValue = snapshot.val();
                if (intensityValue !== null) {
                    setValue(intensityValue);
                }
            };

            dbRef.on('value', onDataChange);
            //set ปุ่มออโต้เมื่อเปิดเครื่อง
            // setIsMaterialSymbolshdrAutoActive(true)
            // Unsubscribe when the component unmounts
            return () => {
                dbRef.off('value', onDataChange);
            };
        }
    }, [isOn, realtimeDB]);  // เพิ่ม isOn เข้าไปใน dependency array ของ useEffect เพื่อให้ useEffect ทำงานเมื่อมีการเปลี่ยนแปลงค่า isOn

    // useEffect(() => {
    //     if (isOn) {
    //         const dbRef = realtimeDB.ref('test/intensity');
    //         const onDataChange = (snapshot) => {
    //             const intensityValue = snapshot.val();
    //             if (intensityValue !== null) {
    //                 setValue(intensityValue);
    //             }
    //         };
    
    //         dbRef.on('value', onDataChange);
    
    //         return () => {
    //             dbRef.off('value', onDataChange);
    //         };
    //     } else {
    //         // หาก isOn เป็น false และค่าใน Firebase เป็น 0
    //         const dbRef = realtimeDB.ref('test/intensity');
    //         dbRef.once('value', (snapshot) => {
    //             const intensityValue = snapshot.val();
    //             if (intensityValue === 0) {
    //                 setIsOn(false)
    //                 // ดำเนินการดึงค่ามาทำอะไรต่อได้ตรงนี้
    //                 // ตัวอย่าง: console.log('ค่าใน Firebase เป็น 0');
    //             }
    //         });
    //     }
    // }, [isOn, realtimeDB]);
    

    useEffect(() => {
        // เมื่อค่า isOn เปลี่ยนและมีค่าเป็น true
        if (isOn) {
            // Subscribe to changes in the Firebase database
            const dbRef = realtimeDB.ref('test/rampup');
            const onDataChange = (snapshot) => {
                const intensityValue = snapshot.val();
                if (intensityValue !== null) {
                    setValueRamp(intensityValue);
                }
            };

            dbRef.on('value', onDataChange);
            //set ปุ่มออโต้เมื่อเปิดเครื่อง
            // setIsMaterialSymbolshdrAutoActive(true)
            // Unsubscribe when the component unmounts
            return () => {
                dbRef.off('value', onDataChange);
            };
        }
    }, [isOn, realtimeDB]);  // เพิ่ม isOn เข้าไปใน dependency array ของ useEffect เพื่อให้ useEffect ทำงานเมื่อมีการเปลี่ยนแปลงค่า isOn


    const handlePress = (newValue) => {
        // Update the local state
        setValue(newValue);

        // Update the Firebase database
        realtimeDB.ref('test/intensity').set(newValue);
        // console.log("ส่งละ")
        // Send MQTT message
        // sendMQTTMessage('s7connection', newValue.toString());
    };

    const handlePressRamp = (newValue) => {
        // Update the local state
        setValueRamp(newValue);
        // Update the Firebase database
        realtimeDB.ref('test/rampup').set(newValue);
    };


    const handlePressIsOnOff = async () => {
        const newIsOn = !isOn;
        setIsOn(newIsOn);

        // เลือก mode ตามค่าที่เปลี่ยนแปลง
        let mode = 0;
        if (isVectorActive) {
            mode = 1;
        } else if (isMaterialSymbolshdrAutoActive) {
            mode = 2;
        } else if (isRimentalHealthFillActive) {
            mode = 3;
        }

        try {
            const userDocRef = db.collection('users').doc(auth.currentUser.uid);
            const userDoc = await userDocRef.get();
            const userData = userDoc.data();
            if (userData && userData.devicesAll) {
                const updatedDevicesAll = userData.devicesAll.map((d) => {
                    if (d.id === deviceId) {
                        // เพิ่มประวัติการใช้งานลงใน History
                        const updatedHistory = d.History ? [...d.History, { isOn: newIsOn, timestamp: new Date() }] : [{ isOn: newIsOn, timestamp: new Date() }];
                        return { ...d, History: updatedHistory };
                    }
                    return d;
                });

                // อัปเดตค่า mode ลงใน Firebase Realtime Database
                await userDocRef.update({ devicesAll: updatedDevicesAll });
                realtimeDB.ref('test/Mode').set(mode);
                realtimeDB.ref('test/intensity').set(0);

                console.log("History updated successfully!");
            }
        } catch (error) {
            console.error('Error updating history:', error);
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            disabled={!isDeviceOn || !isRimentalHealthFillActive} // ปิดใช้งานปุ่มเมื่ออุปกรณ์ปิดหรือ isRimentalHealthFillActive เป็น false
            style={[
                styles.button,
                styles.flatListItem,
                { backgroundColor: item === value ? '#3498db' : '#A0A0A0' },
            ]}
            onPress={() => handlePress(item)}>
            <Text style={{ color: 'white', fontSize: 18 }}>{item}</Text>
        </TouchableOpacity>
    );


    const renderItemRamp = ({ item }) => (
        <TouchableOpacity
            disabled={!isDeviceOn || !isRimentalHealthFillActive} // ปิดใช้งานปุ่มเมื่ออุปกรณ์ปิดหรือ isRimentalHealthFillActive เป็น false
            style={[
                styles.button,
                styles.flatListItem,
                { backgroundColor: item === valueRamp ? '#3498db' : '#A0A0A0' },
            ]}
            onPress={() => handlePressRamp(item)}>
            <Text style={{ color: 'white', fontSize: 18 }}>{item}</Text>
        </TouchableOpacity>
    );


    return (
        <ScrollView>
            <View style={styles.homesceen1}>
                <View style={styles.header1}>
                    <TouchableOpacity style={styles.backNavs} onPress={() => navigation.navigate("MainContainer")}>
                        <View style={styles.backNavsChild} />
                        <Image
                            style={styles.backNavsItem}
                            contentFit="cover"
                            source={require("../assets/group-9845.png")}
                        />
                    </TouchableOpacity>

                    <View style={styles.title}>
                        <Text style={[styles.text]}>
                            {deviceId}.{deviceName}
                        </Text>
                        {/* <Text style={[styles.statusText, deviceStatus ? styles.onlineText : styles.offlineText]}>
                            {deviceStatus ? 'ออนไลน์' : 'ออฟไลน์'}
                        </Text> */}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.iconlyboldplayParent, styles.parentLayout]}
                    onPress={handlePressIsOnOff}
                >
                    <Image
                        style={styles.iconlyboldplay}
                        contentFit="cover"
                        source={isOn ? require("../assets/iconlyboldnoplay1.png") : require("../assets/iconlyboldplay1.png")}
                    />
                    <Text style={[styles.text1, styles.text1Typo]}>{isOn ? "ปิดใช้งาน" : "เปิดใช้งาน"}</Text>
                </TouchableOpacity>
                <View style={[styles.materialSymbolshdrAutoParent, styles.parentLayout]}>

                    <TouchableOpacity
                        disabled={!isDeviceOn}
                        onPress={handleVectorPress} >
                        <Image
                            style={styles.vectorIcon}
                            contentFit="cover"
                            source={isVectorActive ? require("../assets/vector1.png") : require("../assets/vector.png")}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!isDeviceOn}
                        onPress={handleRimentalHealthFillPress}>
                        <Image
                            style={styles.rimentalHealthFillIcon}
                            contentFit="cover"
                            source={isRimentalHealthFillActive ? require("../assets/rimentalhealthfill1.png") : require("../assets/rimentalhealthfill.png")}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!isDeviceOn}
                        onPress={handleMaterialSymbolshdrAutoPress}>
                        <Image
                            style={styles.materialSymbolshdrAutoIcon}
                            contentFit="cover"
                            source={isMaterialSymbolshdrAutoActive ? require("../assets/materialsymbolshdrauto1.png") : require("../assets/materialsymbolshdrauto.png")}
                        />
                    </TouchableOpacity>

                    <Text style={[styles.text2, styles.textTypo, { color: isMaterialSymbolshdrAutoActive ? 'black' : '#A0A0A0' }]}>อัตโนมัติ {!isOn && <FontAwesome name="lock" size={18} />} </Text>
                    <Text style={[styles.text3, styles.textTypo, { color: isVectorActive ? 'black' : '#A0A0A0' }]}>ผ่อนคลาย {!isOn && <FontAwesome name="lock" size={18} />}</Text>
                    <Text style={[styles.text4, { color: isRimentalHealthFillActive ? 'black' : '#A0A0A0' }]}>กำหนดเอง {!isOn && <FontAwesome name="lock" size={18} />}</Text>


                </View>

                <View style={[styles.homesceen1Child, styles.parentLayout, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[styles.text, { alignSelf: 'flex-start', fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 4 }]}>ปรับความแรง {' '}
                        {isVectorActive && <FontAwesome name="lock" size={22} />}
                        {isMaterialSymbolshdrAutoActive && <FontAwesome name="lock" size={22} />}

                    </Text>
                    <FlatList
                        data={[1, 2, 3, 4, 5]}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.toString()}
                        horizontal
                        contentContainerStyle={[{ marginTop: 20 }, styles.flatListContainer]}
                    />
                </View>

                <View style={[styles.homesceen1Item, styles.homesceen1Layout]} >
                    <Text style={[styles.text, { alignSelf: 'flex-start', fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 4 }]}>ปรับความถี่ {' '}
                        {isVectorActive && <FontAwesome name="lock" size={22} />}
                        {isMaterialSymbolshdrAutoActive && <FontAwesome name="lock" size={22} />}

                    </Text>
                    <Text style={styles.sliderValue}>{sliderValue}</Text>

                    <Slider
                        style={styles.slider}
                        disabled={!isDeviceOn || !isRimentalHealthFillActive} // ปิดใช้งานเมื่ออุปกรณ์ปิดหรือ isRimentalHealthFillActive เป็นเท็จ
                        minimumValue={20}
                        maximumValue={70}
                        step={10}
                        value={sliderValue}
                        onValueChange={(value) => {
                            setSliderValue(value); // อัปเดตค่าสไลด์เดอร์ในสถานะท้องถิ่น
                            if (isRimentalHealthFillActive) {
                                realtimeDB.ref('test/frequency').set(value); // อัปเดต Firebase Realtime Database เมื่อ isRimentalHealthFillActive เป็นจริง
                            }
                        }}
                        thumbTintColor="#E88CF2"
                        minimumTrackTintColor="#E88CF2"
                        maximumTrackTintColor="#A0A0A0"
                    />

                    {/* <Text style={styles.sliderValue}>{sliderValue}</Text> */}
                </View>
                <View style={[styles.homesceen1Inner, styles.homesceen1Layout, { justifyContent: 'center', alignItems: 'center' }]} >

                    <Text style={[styles.text, { alignSelf: 'flex-start', fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 4 }]}>ปรับความ Smooth {' '}
                        {isVectorActive && <FontAwesome name="lock" size={22} />}
                        {isMaterialSymbolshdrAutoActive && <FontAwesome name="lock" size={22} />}

                    </Text>
                    <FlatList
                        data={[1, 2, 3, 4, 5]}
                        renderItem={renderItemRamp}
                        keyExtractor={(item) => item.toString()}
                        horizontal
                        contentContainerStyle={[{ marginTop: 20 }, styles.flatListContainer]}
                    />
                </View>


                <View style={[styles.homesceen2Inner, styles.homesceen1Layout, { justifyContent: 'center', alignItems: 'center' }]} >
                    <Text style={[styles.text, { alignSelf: 'flex-start', fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 4 }]}>ปรับ Pulse {' '}
                        {isVectorActive && <FontAwesome name="lock" size={22} />}
                        {isMaterialSymbolshdrAutoActive && <FontAwesome name="lock" size={22} />}
                    </Text>
                    <Text style={styles.sliderValuePulse}>{sliderValuePulse}</Text>

                    <Slider
                        style={styles.slider}
                        disabled={!isDeviceOn || !isRimentalHealthFillActive} // ปิดใช้งานเมื่ออุปกรณ์ปิดหรือ isRimentalHealthFillActive เป็นเท็จ
                        minimumValue={200}
                        maximumValue={500}
                        step={100}
                        value={sliderValuePulse}
                        onValueChange={(value) => {
                            setSliderValuePulse(value); // อัปเดตค่าสไลด์เดอร์ในสถานะท้องถิ่น
                            if (isRimentalHealthFillActive) {
                                realtimeDB.ref('test/pluseup').set(value); // อัปเดต Firebase Realtime Database เมื่อ isRimentalHealthFillActive เป็นจริง
                            }
                        }}
                        thumbTintColor="#E88CF2"
                        minimumTrackTintColor="#E88CF2"
                        maximumTrackTintColor="#A0A0A0"
                    />
                </View>

                <LinearGradient
                    style={[styles.bannerPie1ParentAA, styles.scheduleBgChildBgAA]}
                    locations={[0, 1]}
                    colors={["#92a3fd", "#9dceff"]}
                >
                    {/* <View style={styles.bannerPie1AA}>
                        <View style={styles.bannerPieTextAA}>
                            <Text style={[styles.textAA, styles.textPositionAA]}>80 %</Text>
                        </View>
                    </View> */}
                    <View style={styles.bannerPie1AA}>
                        <View style={styles.bannerPieTextAA}>
                            <Text style={[styles.textAA, styles.textPositionAA]}>
                                {/* Display the fetched data or a placeholder if data is not available */}
                                {sensorbattery !== null ? sensorbattery + '%' : 'Loading...'}
                            </Text>
                        </View>
                    </View>
                    {/* <View style={styles.bannerPie1AAA}>
                        <View style={styles.bannerPieTextAAA}>
                            <Text style={[styles.textAA, styles.textPositionAA]}>80 %</Text>
                        </View>
                    </View> */}
                    <View style={styles.bannerPie1AAA}>
                        <View style={styles.bannerPieTextAAA}>
                            <Text style={[styles.textAA, styles.textPositionAA]}>
                                {/* Display the fetched data or a placeholder if data is not available */}
                                {stimbattery !== null ? stimbattery + '%' : 'Loading...'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.action}>
                        <View style={[styles.scheduleBgAA, styles.scheduleChildPositionAA]}>
                            <LinearGradient
                                style={[styles.scheduleBgChildAA, styles.scheduleChildPositionAA]}
                                locations={[0, 1]}
                                colors={["#92a3fd", "#9dceff"]}
                            />
                        </View>

                        {!isVectorActive && (
                            <View style={styles.workoutScheduleTextAA}>
                                {/* <Text style={[styles.todayTargetAA, styles.textPositionAA]}>
                                สั่งกระตุ้นแล้ว
                            </Text> */}
                                {/* <Text style={[styles.todayTargetAA, styles.textPositionStim, trigger === 0 ? styles.orangeText : styles.greenText]}>
                                    {trigger === 0 ? "ยังไม่กระตุ้น" : "สั่งกระตุ้นแล้ว"}
                                </Text> */}
                                <Text style={[styles.todayTargetAA, styles.textPositionStim, trigger === 0 ? styles.orangeText : styles.greenText]}>
                                    {trigger === 0 ? "ยังไม่กระตุ้น" : "สั่งกระตุ้นแล้ว"}
                                </Text>

                            </View>
                        )}

                        {isVectorActive && (
                            <View style={styles.workoutScheduleTextAA}>
                                <Text style={[styles.todayTargetAA, styles.textPositionStim,styles.greenText]}>
                                    กำลังทำงาน
                                </Text>
                            </View>
                        )}

                        {/* <View style={styles.buttonCheckAA}>
                            <View style={[styles.scheduleBgAA, styles.scheduleChildPositionAA]}>
                                <LinearGradient
                                    style={[styles.buttonBgChildAA, styles.buttonLayoutAA]}
                                    locations={[0, 1]}
                                    colors={["#92a3fd", "#9dceff"]}
                                />
                            </View>
                            <View style={styles.buttonTextAA}>
                                <Text style={[styles.checkAA, styles.checkClrAA]}>1 ชม.</Text>
                            </View>

                        </View> */}
                    </View>
                    <View style={styles.actionSensor}>
                        <View style={[styles.scheduleBgAA, styles.scheduleChildPositionAA]}>
                            <LinearGradient
                                style={[styles.scheduleBgChildAA, styles.scheduleChildPositionAA]}
                                locations={[0, 1]}
                                colors={["#92a3fd", "#9dceff"]}
                            />
                        </View>
                        {!isVectorActive && (
                            <View style={styles.workoutScheduleTextAA}>
                                <Text style={[styles.todayTargetAA, styles.textPositionble]}>
                                    ส่งค่า BLE
                                </Text>
                            </View>
                        )}
                        {!isVectorActive && (
                            <View style={styles.buttonCheckAA}>
                                <View style={[styles.scheduleBgAA, styles.scheduleChildPositionAA]}>
                                    <LinearGradient
                                        style={[styles.buttonBgChildAA, styles.buttonLayoutAA]}
                                        locations={[0, 1]}
                                        colors={["#92a3fd", "#9dceff"]}
                                    />
                                </View>
                                <View style={styles.buttonTextAA}>
                                    <Text style={[styles.checkAA, styles.checkClrAA]}>{trigger}</Text>
                                </View>
                            </View>
                        )}
                        {isVectorActive && (
                            <View style={styles.workoutScheduleTextAA}>
                                <Text style={[styles.todayTargetvector, styles.textPositionvector]}>
                                    กำลังใช้โหมดผ่อนคลาย
                                </Text>
                            </View>
                        )}

                    </View>
                    {/* <LinearGradient
                        style={[styles.button1AA, styles.buttonLayoutAA]}
                        locations={[0, 1]}
                        colors={["#c58bf2", "#eea4ce"]}
                    >
                        <Text style={[styles.buttonAA, styles.checkClrAA]}>แบตเตอรี่</Text>
                    </LinearGradient> */}
                    <LinearGradient
                        style={[styles.button1AAStim]}
                        locations={[0, 1]}
                        colors={["#c58bf2", "#eea4ce"]}
                    >
                        <Text style={[styles.buttonAA, styles.checkClrAA]}>ตัวกระตุ้น</Text>
                    </LinearGradient>
                    <LinearGradient
                        style={[styles.button1AASensor]}
                        locations={[0, 1]}
                        colors={["#c58bf2", "#eea4ce"]}
                    >
                        <Text style={[styles.buttonAA, styles.checkClrAA]}>ตัวรับแรงกด</Text>
                    </LinearGradient>

                </LinearGradient>

            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    console.log("Modal has been closed.");
                    toggleModal();
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <View style={styles.offlineContainer}>
                            <Text style={styles.offlineText1}>อุปกรณ์ของคุณ</Text>
                            <Text style={styles.offlineText}>ออฟไลน์อยู่</Text>
                        </View>
                        <LinearGradient
                            style={styles.buttonBackground}
                            colors={['#92a3fd', '#9dceff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                                <Text style={styles.backButtonText}>กลับ</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>

            </Modal>
        </ScrollView>

    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: 230
    },
    offlineContainer: {
        backgroundColor: '#F7F8F8', // เพิ่มสีเทาสำหรับพื้นหลังของข้อความ
        borderRadius: 20,
        padding: 10,
        marginBottom: 30,
        width: 170
    },
    offlineText: {
        color: 'red',
        fontSize: 18,
        alignSelf: 'center',
    },
    offlineText1: {
        color: 'black',
        fontSize: 18,
        alignSelf: 'center',
        marginBottom: 10,
    },
    // สไตล์ปุ่มกลับ
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonBackground: {
        borderRadius: 5,
        overflow: 'hidden', // เพื่อให้แน่ใจว่าเนื้อหาของ LinearGradient จะไม่ขยายออกนอกขอบของปุ่ม
    },
    onlineText: {
        color: 'green',
    },
    flatListContainer: {
        flexGrow: 0,
        flexShrink: 1,
        width: '100%',
        alignItems: 'center',
    },
    flatListItem: {
        marginHorizontal: 7, // ปรับระยะห่างรอบขอบ
        paddingVertical: 15, // ปรับระยะห่างด้านบนและด้านล่าง
        paddingHorizontal: 22, // ปรับระยะห่างด้านซ้ายและด้านขวา
        borderRadius: 15, // ปรับขนาดของมุม
        marginTop: -12,
    },
    parentLayout: {
        // width: 334,
        width: 346,
        borderRadius: 10,
        left: 20,
        backgroundColor: Color.borderColor,
        position: "absolute",
        overflow: "hidden",
        // backgroundColor: 'red'
    },
    text1Typo: {
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        lineHeight: 21,
        fontSize: FontSize.textMediumTextRegular_size,
    },
    textTypo: {
        color: Color.colorDarkgray_100,
        top: "72.82%",
        height: "19.42%",
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        lineHeight: 21,
        fontSize: FontSize.textMediumTextRegular_size,
        textAlign: "left",
        position: "absolute",
    },
    homesceen1Layout: {
        height: 110,
        width: 346,
        borderRadius: 10,
        left: 20,
        backgroundColor: Color.borderColor,
        position: "absolute",
        overflow: "hidden",
        // backgroundColor: 'yellow'
    },
    text5Clr: {
        color: Color.whiteColor,
        textAlign: "left",
    },
    frameChildLayout: {
        height: 219,
        width: 334,
    },
    childBg: {
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
    },
    actionPosition: {
        left: 17,
        position: "absolute",
    },
    scheduleChildPosition: {
        left: "0%",
        top: "0%",
    },
    buttonLayout: {
        borderRadius: Border.br_31xl,
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
    },
    backNavsChild: {
        borderRadius: Border.br_5xs,
        backgroundColor: Color.borderColor,
        width: 32,
        left: 0,
        top: 0,
        height: 32,
        position: "absolute",
    },
    backNavsItem: {
        top: 8,
        left: 8,
        width: 16,
        height: 16,
        position: "absolute",
    },
    backNavs1: {
        backgroundColor: 'red',
        width: "12%",
        alignSelf: 'flex-end',
        top: 0,
        height: 32,
        left: 290,
        position: "absolute",
    },
    detailnavs: {
        width: 32,
        left: 0,
        top: 0,
        height: 32,
        position: "absolute",
    },
    detailNavsIcon: {
        width: "100.16%",
        left: "0%",
        bottom: "0%",
        right: "0%",
        height: "100%",
        top: "0%",
        maxWidth: "100%",
    },
    text: {
        fontSize: FontSize.textLargeTextRegular_size,
        lineHeight: 24,
        fontWeight: "700",
        fontSize: 17,
        fontFamily: FontFamily.titleH2Bold,
        color: Color.blackColor,
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        left: 0,
        top: 0,
    },
    title: {
        top: 6,
        left: 50,
        width: 230,
        height: 24,
        position: "absolute",
        // backgroundColor: 'red'
    },
    header1: {
        top: 39,
        left: 30,
        width: 315,
        height: 32,
        position: "absolute",
    },
    iconlyboldplay: {
        height: "84.16%",
        top: "10.14%",
        right: "55.69%",
        bottom: "8.7%",
        left: "27.54%",
        width: "16.77%",
        maxHeight: "100%",
        maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
    },
    text1: {
        height: "28.99%",
        top: "36.23%",
        left: "47.31%",
        width: "19.46%",
        textAlign: "left",
        position: "absolute",
    },
    iconlyboldplayParent: {
        top: 322,
        height: 69,
    },
    vectorIcon: {
        height: 52,
        right: "74.25%",
        bottom: "27.18%",
        left: "8.98%",
        top: "20.45%",
        width: 52,
        // maxHeight: "100%",
        // maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
        // backgroundColor:'red'
        marginTop: 17,
    },
    rimentalHealthFillIcon: {
        height: 60,
        right: "74.25%",
        bottom: "12.18%",
        left: "73%",
        top: "20.45%",
        width: 60,
        // maxHeight: "100%",
        // maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
        marginTop: 15,
    },
    materialSymbolshdrAutoIcon: {
        // height: "52%",
        // width: "17.77%",
        // top: "19.3%",
        // right: "41.62%",
        // bottom: "32.04%",
        // left: "41.61%",
        height: 60,
        right: "74.25%",
        bottom: "27.18%",
        left: "42%",
        top: "20.45%",
        width: 60,
        // maxHeight: "100%",
        // maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
        // backgroundColor:'red'
        marginTop: 15,
    },
    text2: {
        width: "29.34%",
        left: "43.13%",
    },
    text3: {
        left: "8.5%",
        width: "22.46%",
    },
    text4: {
        top: "72.82%",
        height: "19.42%",
        left: "73.65%",
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        lineHeight: 21,
        fontSize: FontSize.textMediumTextRegular_size,
        width: "22.46%",
        textAlign: "left",
        position: "absolute",
    },
    materialSymbolshdrAutoParent: {
        top: 407,
        height: 103,
    },
    homesceen1Child: {
        top: 526,
        height: 110,
    },
    homesceen1Item: {
        top: 653,
    },
    homesceen1Inner: {
        top: 786,
    },
    homesceen2Inner: {
        top: 916,
    },
    text5: {
        height: "2.09%",
        width: "37.6%",
        top: "37.44%",
        left: "13.6%",
        fontFamily: FontFamily.textMediumTextRegular,
        color: Color.whiteColor,
        fontSize: FontSize.textSmallTextMedium_size,
        position: "absolute",
        lineHeight: 18,
    },
    frameChild: {
        borderRadius: Border.br_3xl,
        height: 219,
        width: 334,
        left: 0,
        top: 0,
        backgroundColor: Color.waterIntakeLinear,
    },
    frameItem: {
        top: 7,
        width: 307,
        height: 145,
        overflow: "hidden",
    },
    bannerPieEllipseIcon: {
        maxHeight: "100%",
        maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
        bottom: "0%",
        right: "0%",
        height: "100%",
        left: "0%",
        width: "100%",
    },
    text6: {
        lineHeight: 18,
        fontSize: FontSize.textSmallTextMedium_size,
        left: "0%",
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        textAlign: "left",
        color: Color.blackColor,
        height: "100%",
        position: "absolute",
        width: "100%",
    },
    bannerPieText: {
        height: "20.48%",
        width: "33.3%",
        top: "39.76%",
        right: "29.16%",
        bottom: "39.76%",
        left: "37.53%",
        position: "absolute",
    },
    bannerPie1: {
        height: "45.25%",
        width: "32.54%",
        top: "21%",
        right: "32.72%",
        bottom: "33.74%",
        left: "34.73%",
        position: "absolute",
    },
    scheduleBgChild: {
        borderRadius: Border.br_base,
        opacity: 0.2,
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
        bottom: "0%",
        right: "0%",
        height: "100%",
        left: "0%",
        width: "100%",
    },
    scheduleBg: {
        bottom: "0%",
        right: "0%",
        height: "100%",
        left: "0%",
        width: "100%",
        position: "absolute",
    },
    todayTarget: {
        fontWeight: "500",
        fontFamily: FontFamily.textSmallTextMedium,
        fontSize: FontSize.textMediumTextRegular_size,
        left: "0%",
        textAlign: "left",
        color: Color.blackColor,
        position: "absolute",
    },
    workoutScheduleText: {
        height: "36.84%",
        width: "55.85%",
        top: "31.58%",
        right: "37.79%",
        bottom: "31.58%",
        left: "6.35%",
        position: "absolute",
    },
    buttonBgChild: {
        left: "0%",
        top: "0%",
        bottom: "0%",
        right: "0%",
        height: "100%",
        width: "100%",
    },
    check: {
        color: Color.whiteColor,
        textAlign: "left",
        fontFamily: FontFamily.textMediumTextRegular,
        fontSize: FontSize.textSmallTextMedium_size,
        position: "absolute",
    },
    buttonText: {
        height: "64.29%",
        width: "37.21%",
        top: "17.86%",
        right: "40.78%",
        bottom: "17.86%",
        left: "22.02%",
        position: "absolute",
    },
    buttonCheck: {
        height: "49.12%",
        width: "21.57%",
        top: "26.32%",
        right: "6.35%",
        bottom: "24.56%",
        left: "72.07%",
        position: "absolute",

    },
    action: {
        top: 152,
        width: 150,
        height: 57,
        borderRadius: 22,
        backgroundColor: Color.whiteColor,
        left: 17,
    },
    actionSensor: {
        top: 95,
        width: 150,
        height: 57,
        borderRadius: 22,
        backgroundColor: Color.whiteColor,
        left: 185,
    },
    rectangleParent: {
        top: 85,
        left: 20,
        height: 219,
        position: "absolute",
        overflow: "hidden",
        borderRadius: 15,
    },
    button: {
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        lineHeight: 21,
        fontSize: FontSize.textMediumTextRegular_size,
    },
    button1: {
        marginTop: -314,
        width: "34.13%",
        top: "50%",
        right: "31.73%",
        left: "34.13%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Padding.p_11xl,
        paddingVertical: Padding.p_3xs,
        height: 32,
    },
    homesceen1: {
        borderRadius: Border.br_21xl,
        flex: 1,
        // height: 812,
        height: 1200,
        overflow: "hidden",
        width: "100%",
        backgroundColor: Color.whiteColor,
    },


    //สี่เหลี่ยมบนหน้าจออันแรก
    scheduleBgChildBgAA: {
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
    },
    scheduleChildPositionAA: {
        left: "0%",
        top: "0%",
        // backgroundColor:'yellow'
    },
    textPositionAA: {
        textAlign: "left",
        color: Color.blackColor,
        left: "0%",
        top: "0%",
        position: "absolute",
    },
    textPositionvector: {
        textAlign: "left",
        color: Color.blackColor,
        left: "0%",
        top: "10%",
        position: "absolute",
    },
    textPositionStim: {
        textAlign: "center",
        color: Color.blackColor,
        left: "17%",
        top: "0%",
        position: "absolute",
    },
    textPositionble: {
        textAlign: "left",
        color: Color.blackColor,
        left: "7%",
        top: "0%",
        position: "absolute",
    },
    buttonLayoutAA: {
        borderRadius: 15,
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
        justifyContent: "center"
    },
    checkClrAA: {
        color: Color.whiteColor,
        // textAlign: "center", // ทำให้ข้อความอยู่ตรงกลางแนวนอน
    },

    bannerPieEllipseIconAA: {
        maxWidth: "100%",
        maxHeight: "100%",
        bottom: "0%",
        right: "0%",
        left: "0%",
        top: "0%",
        height: "300%",
        width: "300%",
        position: "absolute",
        overflow: "hidden",
    },
    textAA: {
        lineHeight: 18,
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
        fontSize: 16,
        height: "100%",
        textAlign: "left",
        color: Color.blackColor,
        width: 45,
        // paddingRight:10,
        // backgroundColor:'red'
    },
    bannerPieTextAA: {
        height: "20.48%",
        width: "40%",
        top: "39.76%",
        right: "29.16%",
        bottom: "39.76%",
        left: "35%", // ปรับค่า left ลงเพื่อขยับไปทางซ้ายจอ
        position: "absolute",
    },

    bannerPieTextAAA: {
        height: "20.48%",
        width: "40%",
        top: "39.76%",
        right: "29.16%",
        bottom: "39.76%",
        left: "32%", // ปรับค่า left ลงเพื่อขยับไปทางซ้ายจอ
        position: "absolute",
    },

    bannerPie1AA: {
        height: 100,
        width: 100,
        top: "21%",
        right: "32.72%",
        bottom: "33.74%",
        left: "60.73%",
        position: "absolute",
        borderRadius: 50, // ค่าความสูงและความกว้างหาร 2
        backgroundColor: 'white',
    },

    bannerPie1AAA: {
        height: 100,
        width: 100,
        top: "21%",
        right: "32.72%",
        bottom: "33.74%",
        left: "10.73%",
        position: "absolute",
        borderRadius: 50, // ค่าความสูงและความกว้างหาร 2
        backgroundColor: 'white',
    },

    scheduleBgChildAA: {
        borderRadius: Border.br_base,
        opacity: 0.2,
        bottom: "0%",
        right: "0%",
        left: "0%",
        top: "0%",
        height: "100%",
        width: "100%",
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
    },
    scheduleBgAA: {
        bottom: "0%",
        right: "0%",
        left: "0%",
        top: "0%",
        height: "100%",
        width: "100%",
        position: "absolute",

    },
    todayTargetAA: {
        fontWeight: "500",
        fontFamily: FontFamily.textSmallTextMedium,
        fontSize: FontSize.textMediumTextRegular_size,

    },
    todayTargetvector: {
        fontWeight: "500",
        fontFamily: FontFamily.textSmallTextMedium,
        fontSize: FontSize.textSmallTextRegular_size,

    },
    workoutScheduleTextAA: {
        height: "36.84%",
        width: "85%",
        top: "31.58%",
        right: "37.79%",
        bottom: "31.58%",
        left: "9.35%",
        position: "absolute",
        // backgroundColor:'red'
    },
    buttonBgChildAA: {
        left: "0%",
        top: "0%",
        bottom: "0%",
        right: "0%",
        height: "100%",
        width: "100%",
    },
    checkAA: {
        fontFamily: FontFamily.textMediumTextRegular,
        fontSize: FontSize.textSmallTextMedium_size,
        left: "0%",
        top: "0%",
        color: Color.whiteColor,
        position: "absolute",
    },
    buttonTextAA: {
        height: "64.29%",
        width: "20%",
        top: "17.86%",
        right: "40.78%",
        bottom: "17.86%",
        left: "40.02%",
        position: "absolute",
        // backgroundColor:'red',
    },
    buttonCheckAA: {
        height: "49.12%",
        width: "36.57%",
        top: "26.32%",
        right: "6.35%",
        bottom: "24.56%",
        left: "60.07%",
        position: "absolute",
        // backgroundColor:'green'
    },

    actionAA: {
        top: 152,
        left: 17,
        borderRadius: Border.br_3xl,
        width: 299,
        height: 57,
        position: "absolute",
        backgroundColor: Color.whiteColor,
    },
    buttonAA: {
        lineHeight: 21,
        fontSize: FontSize.textMediumTextRegular_size,
        fontFamily: FontFamily.textLargeTextSemiBold,
        fontWeight: "600",
    },
    button1AA: {
        marginTop: -102.5,
        width: "25.32%",
        top: "65%",
        right: "29.34%",
        left: "37.34%",
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Padding.p_11xl,
        paddingVertical: Padding.p_3xs,
    },
    button1AAStim: {
        marginTop: -102.5,
        width: "25.32%",
        top: "50%",
        right: "29.34%",
        left: "12.34%",
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Padding.p_11xl,
        paddingVertical: Padding.p_3xs,
        borderRadius: 15,
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
        justifyContent: "center"
    },
    button1AASensor: {
        marginTop: -102.5,
        width: "25.32%",
        top: "50%",
        right: "29.34%",
        left: "62.34%",
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Padding.p_11xl,
        paddingVertical: Padding.p_3xs,
        borderRadius: 15,
        backgroundColor: Color.waterIntakeLinear,
        position: "absolute",
        justifyContent: "center"
    },
    bannerPie1ParentAA: {
        top: 85,
        left: 20,
        borderRadius: 12,
        width: 346,
        height: 219,
        overflow: "hidden",
    },
    homesceen1AA: {
        borderRadius: Border.br_21xl,
        flex: 1,
        height: 812,
        overflow: "hidden",
        width: "100%",
        backgroundColor: Color.whiteColor,
    },

    slider: {
        width: 300,
        height: 40,
        alignSelf: 'center',
        marginTop: 1,
    },
    sliderValue: {
        marginTop: 1,
        fontSize: 20,
        alignSelf: 'center',
    },
    sliderValuePulse: {
        marginTop: 1,
        fontSize: 20,
        alignSelf: 'center',
    },
    statusText: {
        fontSize: 16,
        top: 5, // เพิ่มระยะห่างระหว่างชื่ออุปกรณ์กับสถานะ
    },
    orangeText: {
        color: 'black',
    },
    greenText: {
        color: 'green',
    },
});

export default ControlScreen;