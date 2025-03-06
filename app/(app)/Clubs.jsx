import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useClubInfo from '../../hooks/useGetClubInfo';

export default function Clubs() {
  const { 
    sortedClubs,
    loading,
    error,
    searchClubs
  } = useClubInfo();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClubId, setExpandedClubId] = useState(null);
  const displayClubs = searchClubs(searchTerm);

  const toggleClubExpansion = (clubId) => {
    setExpandedClubId(expandedClubId === clubId ? null : clubId);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 py-2 mt-4 mb-2">
        <View className="flex-row items-center bg-neutral-100 rounded-xl p-2">
          <MaterialIcons name="search" size={24} color="gray" />
          <TextInput 
            placeholder="Search clubs"
            placeholderTextColor="gray"
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 ml-2 text-lg text-neutral-900"
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <MaterialIcons name="close" size={24} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6750A4" />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View className="flex-1 justify-center items-center p-4">
          <MaterialIcons name="error-outline" size={48} color="red" />
          <Text className="text-lg text-red-600 text-center mt-2">{error}</Text>
        </View>
      )}

      {/* Clubs List */}
      <ScrollView 
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        {displayClubs.length === 0 && !loading ? (
          <View className="justify-center items-center mt-8">
            <Text className="text-neutral-500 text-lg">No clubs found</Text>
          </View>
        ) : (
          displayClubs.map((club) => (
            <View 
              key={club.id} 
              className="bg-neutral-100 rounded-xl mb-3 overflow-hidden"
            >
              <TouchableOpacity 
                onPress={() => toggleClubExpansion(club.id)}
                className="flex-row items-center p-4"
              >
                {club.club_Logo ? (
                  <Image 
                    source={{ uri: club.club_Logo }} 
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full mr-4 bg-primary-200 justify-center items-center">
                    <MaterialIcons name="groups" size={32} color="#6750A4" />
                  </View>
                )}
                
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900">
                    {club.club_Name}
                  </Text>
                </View>
                
                <MaterialIcons 
                  name={expandedClubId === club.id ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#79747E" 
                />
              </TouchableOpacity>

              {/* Expandable Club Details */}
              {expandedClubId === club.id && (
                <View className="p-4 bg-white">
                  {/* Club Goals */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-neutral-900 mb-2">Club Goals</Text>
                    <Text className="text-neutral-700">
                      {club.club_Goals || "No goals description available"}
                    </Text>
                  </View>

                  {/* Event Image */}
                  {club.event_Image ? (
                    <View>
                      <Image 
                        source={{ uri: club.event_Image }}
                        className="w-full h-48 rounded-xl"
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View className="bg-neutral-100 rounded-xl p-4 items-center">
                      <MaterialIcons name="image-not-supported" size={32} color="gray" />
                      <Text className="text-neutral-500 mt-2">No event image available</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}