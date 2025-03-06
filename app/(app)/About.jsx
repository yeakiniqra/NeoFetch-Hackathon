import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function About() {
  const teamMembers = [
    { 
      name: 'Yeakin Iqra', 
      role: 'Team Lead & Android Developer',
    },
    { 
      name: 'Soma Das', 
      role: 'Frontend Developer',
      
    },
    { 
      name: 'Sheikh Muhammad Ashik', 
      role: 'UI/UX Designer',
    },
    { 
      name: 'Nishat Tasnim', 
      role: 'AI Researcher',
    }
  ];

  const appVersions = [
    { version: '1.0.0', date: 'March 2025', description: 'Initial Release' },
  ];

  return (
    <ScrollView className="flex-1">
      {/* App Logo and Name */}
      <View className="items-center p-2">
        <Image 
          source={require('../../assets/images/UAPEDIA.png')} 
          className="w-32 h-32 rounded-full"
          resizeMode="contain"
        />
      </View>

      {/* Team Information */}
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Our Team</Text>
        <Text className="text-gray-600 mb-4 font-semibold text-lg">
          Team Name: UAP_NightOwlz
        </Text>
        
        <View className="space-y-4">
          {teamMembers.map((member, index) => (
            <View 
              key={index} 
              className="bg-white rounded-xl p-4 flex-row items-center shadow-md mb-2"
            >
              <View>
                <Text className="text-lg font-semibold text-gray-800">
                  {member.name}
                </Text>
                <Text className="text-gray-500">
                  {member.role}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* App Versions */}
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          App Versions
        </Text>
        {appVersions.map((version, index) => (
          <View 
            key={index} 
            className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-md"
          >
            <View className="bg-blue-100 p-3 rounded-full mr-4">
              <MaterialIcons name="apps" size={24} color="#2563EB" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                Version {version.version}
              </Text>
              <Text className="text-gray-500">
                Released: {version.date}
              </Text>
              <Text className="text-gray-600 mt-1">
                {version.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Contact and Social */}
      <View className="p-6 items-center">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Connect With Us
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity className="bg-blue-600 p-3 rounded-full">
            <MaterialIcons name="facebook" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-pink-600 p-3 rounded-full">
            <MaterialIcons name="camera-alt" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue-400 p-3 rounded-full">
            <MaterialIcons name="email" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}