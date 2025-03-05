import { View, Text, Platform, Image, Pressable, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import useEvents from '../../../store/useEvents'
import useAuthStore from '../../../store/useAuthStore'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

export default function Events() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    events, 
    myEvents, 
    loading, 
    refreshing, 
    error, 
    fetchEvents, 
    fetchMyEvents, 
    refreshEvents,
    hasUserRsvpd,
    setCurrentEvent
  } = useEvents();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {
    fetchEvents();
    if (user?.uid) {
      fetchMyEvents(user.uid);
    }
  }, [user]);
  
  const handleRefresh = () => {
    refreshEvents();
    if (user?.uid) {
      fetchMyEvents(user.uid);
    }
  };
  
  const navigateToEventDetails = (event) => {
    setCurrentEvent(event);
    router.push({ 
      pathname: '/EventDetails', 
      params: { eventId: event.id }
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const renderEventCard = (event) => {
    const isRsvpd = hasUserRsvpd(event.id, user?.uid);
    
    return (
      <Pressable
        key={event.id}
        onPress={() => navigateToEventDetails(event)} 
        className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
        style={({pressed}) => [
          pressed && {opacity: 0.9}
        ]}
      >
        {event.image_url ? (
          <View className="w-full h-40">
            <Image
              source={{ uri: event.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {isRsvpd && (
              <View className="absolute top-2 right-2 bg-indigo-600 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">RSVP'd</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="w-full h-40 bg-gray-200 items-center justify-center">
            <MaterialIcons name="event" size={48} color="#9ca3af" />
            {isRsvpd && (
              <View className="absolute top-2 right-2 bg-indigo-600 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">RSVP'd</Text>
              </View>
            )}
          </View>
        )}
        
        <View className="p-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-lg font-medium text-slate-800">{event.title}</Text>
              <Text className="text-indigo-600 font-medium mt-1">{formatDate(event.date)}</Text>
              {event.time && (
                <Text className="text-slate-500 text-sm mt-1">{event.time}</Text>
              )}
            </View>
            <View className="bg-indigo-100 rounded-full px-3 py-1">
              <Text className="text-indigo-800 text-xs font-medium">{event.category}</Text>
            </View>
          </View>
          
          {event.description && (
            <Text 
              className="text-slate-600 mt-2" 
              numberOfLines={2}
            >
              {event.description}
            </Text>
          )}
          
          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={16} color="#6b7280" />
              <Text className="text-slate-500 text-sm ml-1">{event.venue || 'TBA'}</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="person" size={16} color="#6b7280" />
              <Text className="text-slate-500 text-sm ml-1">
                {event.rsvp_count || 0} attending
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };
  
  const renderEmptyState = (message) => (
    <View className="items-center justify-center py-20">
      <MaterialIcons name="event-busy" size={64} color="#d1d5db" />
      <Text className="text-slate-400 text-lg mt-4">{message}</Text>
      <TouchableOpacity 
        onPress={handleRefresh}
        className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg"
      >
        <Text className="text-white">Refresh</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      <View className="px-4 pt-4">
        <SegmentedControl
          values={['All Events', 'My Events']}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          appearance={Platform.OS === 'ios' ? 'light' : undefined}
          tintColor="#4f46e5"
          backgroundColor="#e5e7eb"
          fontStyle={{ color: '#1f2937' }}
          activeFontStyle={{ color: 'white' }}
          style={{ height: 40, marginBottom: 12 }}
        />
      </View>
      
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-slate-500 mt-2">Loading events...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-10">
            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
            <Text className="text-red-500 mt-2">{error}</Text>
            <TouchableOpacity 
              onPress={handleRefresh}
              className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg"
            >
              <Text className="text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : selectedIndex === 0 ? (
          // All Events
          events.length === 0 ? (
            renderEmptyState('No events available')
          ) : (
            <View className="pb-4">
              {events.map(renderEventCard)}
            </View>
          )
        ) : (
          // My Events
          myEvents.length === 0 ? (
            renderEmptyState('You haven\'t RSVP\'d to any events yet')
          ) : (
            <View className="pb-4">
              {myEvents.map(renderEventCard)}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}