import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BlurView } from 'expo-blur';

export default function Emergency() {
    const [selectedAdvisors, setSelectedAdvisors] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdvisors = async () => {
            try {
                const savedAdvisors = await AsyncStorage.getItem('selectedAdvisors');
                if (savedAdvisors) {
                    setSelectedAdvisors(JSON.parse(savedAdvisors));
                }
            } catch (error) {
                console.error('Failed to load advisors:', error);
            }
        };

        loadAdvisors();
    }, []);

    useEffect(() => {
        const saveAdvisors = async () => {
            try {
                await AsyncStorage.setItem('selectedAdvisors', JSON.stringify(selectedAdvisors));
            } catch (error) {
                console.error('Failed to save advisors:', error);
            }
        };

        saveAdvisors();
    }, [selectedAdvisors]);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get('https://cse.uap-bd.edu/v1/api/faculties/');
                const activeFaculties = response.data.filter(faculty => faculty.status !== 'leave');
                setFaculties(activeFaculties);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch faculties:', error);
                setLoading(false);
            }
        };

        fetchFaculties();
    }, []);

    const addAdvisor = advisor => {
        if (!selectedAdvisors.some(a => a.id === advisor.id)) {
            setSelectedAdvisors([...selectedAdvisors, advisor]);
        }
        setModalVisible(false);
    };

    const removeAdvisor = advisorIndex => {
        setSelectedAdvisors(selectedAdvisors.filter((_, index) => index !== advisorIndex));
    };

    const otherContact = [
        {
            name: 'Head of CSE',
            designation: 'Department of CSE',
            email: 'headcse@uap-bd.edu',
            icon: 'school'
        },
        {
            name: 'Department Administrative Office',
            designation: 'Department of CSE',
            email: 'dao.cse@uap-bd.edu',
            icon: 'corporate-fare'
        },
        {
            name: 'Hasanul Kabir',
            designation: 'Assistant Administrative Officer',
            phone: '01722398613',
            icon: 'person'
        },
    ];

    const contactAction = (type, value) => {
        if (type === 'email') {
            Linking.openURL(`mailto:${value}`);
        } else if (type === 'phone') {
            Linking.openURL(`tel:${value}`);
        }
    };

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-center mb-4">
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-blue-500 p-2 rounded-full flex-row items-center"
                >
                    <MaterialIcons name="add" size={24} color="white" className="mr-2" />
                    <Text className="text-white font-bold">Add Advisor</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {selectedAdvisors.map((advisor, index) => (
                    <View key={index} className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-md">
                        <Image source={{ uri: advisor.image }} className="w-16 h-16 rounded-full mr-4" />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">{advisor.name}</Text>
                            <Text className="text-gray-500">{advisor.designation}</Text>
                            <View className="flex-row mt-2 space-x-4">
                                <TouchableOpacity onPress={() => contactAction('email', advisor.email)} className="flex-row items-center">
                                    <MaterialIcons name="email" size={20} color="gray" />
                                    <Text className="ml-2 text-gray-600">{advisor.email}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => contactAction('phone', advisor.mobile_Number)} className="flex-row items-center">
                                    <MaterialIcons name="phone" size={20} color="gray" />
                                    <Text className="ml-2 text-gray-600">{advisor.mobile_Number}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => removeAdvisor(index)}>
                            <MaterialIcons name="remove-circle" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}

                {otherContact.map((contact, index) => (
                    <View
                        key={index}
                        className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-md"
                    >
                        <View className="bg-blue-100 p-3 rounded-full mr-4">
                            <MaterialIcons name={contact.icon} size={24} color="blue" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">{contact.name}</Text>
                            <Text className="text-gray-500">{contact.designation}</Text>

                            {contact.email && (
                                <TouchableOpacity
                                    onPress={() => contactAction('email', contact.email)}
                                    className="flex-row items-center mt-2"
                                >
                                    <MaterialIcons name="email" size={20} color="gray" />
                                    <Text className="ml-2 text-gray-600">{contact.email}</Text>
                                </TouchableOpacity>
                            )}

                            {contact.phone && (
                                <TouchableOpacity
                                    onPress={() => contactAction('phone', contact.phone)}
                                    className="flex-row items-center mt-2"
                                >
                                    <MaterialIcons name="phone" size={20} color="gray" />
                                    <Text className="ml-2 text-gray-600">{contact.phone}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* UCAM Link */}
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://ucam.uap-bd.edu/Security/LogIn.aspx')}
                    className="bg-white rounded-xl p-4 flex-row items-center justify-center shadow-md"
                >
                    <MaterialIcons name="open-in-browser" size={24} color="blue" />
                    <Text className="ml-2 text-blue-600 font-bold">Open UCAM Portal</Text>
                </TouchableOpacity>
            </ScrollView>



            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <BlurView intensity={50} className="flex-1 justify-center items-center">
                    <View className="w-11/12 bg-white rounded-xl p-6 max-h-[70%]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-800">Select Advisor</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color="blue" />
                        ) : (
                            <ScrollView>
                                {faculties.map(advisor => (
                                    <TouchableOpacity key={advisor.id} onPress={() => addAdvisor(advisor)} className="flex-row items-center p-3 bg-gray-100 rounded-lg mb-2">
                                        <Image source={{ uri: advisor.image }} className="w-12 h-12 rounded-full mr-4" />
                                        <View>
                                            <Text className="text-base font-bold">{advisor.name}</Text>
                                            <Text className="text-gray-600">{advisor.designation}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}
