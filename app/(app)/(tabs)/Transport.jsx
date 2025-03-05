import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  StatusBar,
  Pressable
} from 'react-native';
import BusMap from '../../../components/Map';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import useBusSchedulerStore from '../../../store/useBusScheduler';


export default function Transport() {
  
  const {
    loading,
    error,
    buses,
    stops,
    selectedRoute,
    selectedRouteId,
    dropdownItems,
    announcements,
    mapboxToken,
    fetchRouteData,
    handleRouteSelect,
    retryFetch
  } = useBusSchedulerStore();

 
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

 
  useEffect(() => {
    fetchRouteData();
  }, []);

  const getNextBusTimes = useCallback(() => {
    if (!selectedRoute || !selectedRoute.buses || selectedRoute.buses.length === 0) {
      return { toTemple: 'N/A', toCampus: 'N/A' };
    }
    
    return {
      toCampus: selectedRoute.buses[0]?.campus_departure_time || '03:00PM',
    };
  }, [selectedRoute]);

  const busTimings = getNextBusTimes();

  
  const renderStopItem = useCallback(({ item: stop, index }) => (
    <View 
      className={`flex-row justify-between items-center p-4 ${
        index !== (selectedRoute?.stops?.length || 0) - 1 ? 'border-b border-gray-200' : ''
      }`}
    >
      <View className="flex-row items-center">
        <MaterialIcons name="place" size={18} color="#6750A4" />
        <Text className="ml-2 text-gray-800 font-medium">{stop.name}</Text>
      </View>
      
      {selectedRoute?.buses && 
       selectedRoute.buses[0]?.schedule && 
       selectedRoute.buses[0].schedule.find(s => s.stop === stop.name) && (
        <View className="bg-purple-100 rounded-full px-3 py-1">
          <Text className="text-purple-700 font-medium">
            {selectedRoute.buses[0].schedule.find(s => s.stop === stop.name).time}
          </Text>
        </View>
      )}
    </View>
  ), [selectedRoute]);

 
  const renderBusItem = useCallback(({ item: bus }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-gray-500 text-xs mb-1">Bus No</Text>
          <Text className="text-gray-800 font-medium">{bus.bus_no || 'N/A'}</Text>
        </View>
        
        <View className="flex-1 ml-2">
          <Text className="text-gray-500 text-xs mb-1">Driver</Text>
          <Text className="text-gray-800 font-medium">{bus.driver_name || 'N/A'}</Text>
        </View>
      </View>
      
      <View className="flex-row">
        <View className="flex-1 mr-2">
          <Text className="text-gray-500 text-xs mb-1">Departure</Text>
          <Text className="text-gray-800 font-medium">{bus.campus_departure_time || 'N/A'}</Text>
        </View>
        
        <View className="flex-1 ml-2">
          <Text className="text-gray-500 text-xs mb-1">Contact</Text>
          <Text className="text-gray-800 font-medium">{bus.contact_no || 'N/A'}</Text>
        </View>
      </View>
    </View>
  ), []);


  const renderAnnouncementItem = useCallback(({ item: announcement }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <Text className="text-gray-800 font-bold text-lg mb-1">
        {announcement.title}
      </Text>
      <Text className="text-gray-500 text-xs mb-2">
        {announcement.date}
      </Text>
      <Text className="text-gray-700">
        {announcement.content}
      </Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6750A4" />
        <Text className="mt-4 text-gray-600">
          Loading bus schedules...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-white">
        <MaterialIcons name="error-outline" size={48} color="#B3261E" />
        <Text className="mt-2 text-red-600 text-lg text-center">
          {error}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-purple-600 rounded-full px-6 py-3"
          onPress={retryFetch}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar backgroundColor="#6750A4" barStyle="light-content" />
      
    
      <View className="bg-white shadow-sm">
        
    
        <View className="flex-row border-b border-gray-200">
          <Pressable
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'schedule' ? 'border-purple-600' : 'border-transparent'
            }`}
            onPress={() => setActiveTab('schedule')}
          >
            <Text 
              className={`font-medium ${
                activeTab === 'schedule' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              Schedule
            </Text>
          </Pressable>
          
          <Pressable
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'announcements' ? 'border-purple-600' : 'border-transparent'
            }`}
            onPress={() => setActiveTab('announcements')}
          >
            <Text 
              className={`font-medium ${
                activeTab === 'announcements' ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              Announcements
            </Text>
          </Pressable>
        </View>
      </View>


      {activeTab === 'schedule' && (
        <FlatList
          data={[]} 
          keyExtractor={() => 'schedule'}
          ListHeaderComponent={
            <>
            
              <View className="bg-white m-4 rounded-lg shadow-sm p-4">
                <View className="mb-4 z-50">
                  <Text className="text-gray-500 text-xs mb-1">Select Route</Text>
                  <DropDownPicker
                    open={open}
                    value={selectedRouteId}
                    items={dropdownItems}
                    setOpen={setOpen}
                    setValue={(callback) => {
                      const newValue = typeof callback === 'function' ? callback(selectedRouteId) : callback;
                      handleRouteSelect(newValue);
                    }}
                    className="border border-gray-200 rounded-lg"
                    textStyle={{ color: '#1F2937', fontSize: 14 }}
                    containerStyle={{ zIndex: 9999 }}
                    dropDownContainerStyle={{ 
                      borderColor: '#E5E7EB',
                      borderWidth: 1,
                      elevation: 2
                    }}
                    placeholder="Select a route"
                  />
                </View>
                
                
                <View className="bg-purple-50 rounded-lg p-4 mb-4">
                  <Text className="text-purple-800 font-medium mb-2">Next Bus Times</Text>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700">From Campus</Text>
                    <View className="bg-white px-3 py-1 rounded-full">
                      <Text className="text-purple-600 font-medium">{busTimings.toCampus}</Text>
                    </View>
                  </View>
                </View>
                
            
                <TouchableOpacity className="bg-purple-600 rounded-full py-3 items-center flex-row justify-center">
                  <Text className="text-white font-medium mr-2">View Full Schedule</Text>
                  <MaterialIcons name="schedule" size={18} color="white" />
                </TouchableOpacity>
              </View>
              
          
              <View className="mx-4 mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
                <View className="p-4 border-b border-gray-200">
                  <Text className="text-gray-800 font-medium text-base">Route Map</Text>
                </View>
                
                <View className="relative">
                  <View className="h-56">
                    <BusMap
                      buses={buses}
                      stops={stops}
                      accessToken={mapboxToken}
                      mapHeight={220}
                    />
                  </View>
                  
                  
                  <View className="absolute bottom-3 left-3 right-3 bg-white bg-opacity-90 p-3 rounded-lg flex-row justify-between items-center">
                    <Text className="text-gray-800 font-medium">
                      {buses.length} Bus{buses.length !== 1 ? 'es' : ''} available
                    </Text>
                    
                    <TouchableOpacity className="bg-purple-600 rounded-full px-4 py-1">
                      <Text className="text-white font-medium">Track</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
      
              {selectedRoute && selectedRoute.buses && selectedRoute.buses.length > 0 && (
                <View className="mx-4 mb-4">
                  <Text className="text-gray-800 font-medium text-base mb-2">Bus Details</Text>
                  <FlatList
                    data={selectedRoute.buses}
                    renderItem={renderBusItem}
                    keyExtractor={(item, index) => `bus-${index}`}
                    scrollEnabled={false}
                  />
                </View>
              )}
              
            
              {selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && (
                <View className="mx-4 mb-24">
                  <Text className="text-gray-800 font-medium text-base mb-2">Stops Schedule</Text>
                  <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <FlatList
                      data={selectedRoute.stops}
                      renderItem={renderStopItem}
                      keyExtractor={(item, index) => `stop-${index}`}
                      scrollEnabled={false}
                    />
                  </View>
                </View>
              )}
            </>
          }
        />
      )}

      {activeTab === 'announcements' && (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={item => `announcement-${item.id}`}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
      
    </SafeAreaView>
  );
}