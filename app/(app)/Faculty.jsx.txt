import { View, Text, Image, TextInput, TouchableOpacity, Linking, LayoutAnimation, UIManager, ScrollView } from 'react-native';
import React, { useState } from 'react';
import useFaculties from '../../hooks/useFaculties';
import { Ionicons } from '@expo/vector-icons';

// Enable layout animation on Android
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Faculty() {
  const { faculties, loading, error } = useFaculties();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filter faculties based on search query
  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle expansion of a card
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Search Bar */}
      <View className="bg-white flex-row items-center rounded-full p-3 mb-4 shadow-md">
        <Ionicons name="search" size={20} color="#666" className="mr-2" />
        <TextInput
          placeholder="Search faculty..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-gray-800"
        />
      </View>

      {/* Faculty List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredFaculties.map((faculty) => (
          <TouchableOpacity
            key={faculty.id}
            className="bg-white rounded-xl shadow-md mb-3 p-4"
            onPress={() => toggleExpand(faculty.id)}
          >
            <View className="flex-row items-center">
              <Image
                source={{ uri: faculty.image }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {faculty.name}
                </Text>
                <Text className="text-gray-600">{faculty.designation}</Text>
              </View>
            </View>

            {/* Expandable Section */}
            {expandedId === faculty.id && (
              <View className="mt-3 bg-blue-50 p-4 rounded-lg">
                <TouchableOpacity
                  className="flex-row items-center mb-2"
                  onPress={() => Linking.openURL(`tel:${faculty.mobile_Number}`)}
                >
                  <Ionicons name="call" size={18} color="black" className="mr-2" />
                  <Text className="text-gray-800">{faculty.mobile_Number}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center mt-2"
                  onPress={() => Linking.openURL(`mailto:${faculty.email}`)}
                >
                  <Ionicons name="mail" size={18} color="black" className="mr-2" />
                  <Text className="text-gray-800">{faculty.email}</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
