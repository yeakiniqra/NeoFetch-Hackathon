import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ToastAndroid, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import useAuthStore from '../../store/useAuthStore';
import useLostFound from '../../store/useLostFound';
import useSafety from '../../store/useSafety';

export default function Report() {
  const { user } = useAuthStore();
  const { 
    lostItems, 
    loading: lostItemsLoading, 
    error: lostItemsError, 
    fetchLostItems, 
    reportLostItem 
  } = useLostFound();
  
  const { 
    safetyConcerns, 
    loading: safetyConcernsLoading, 
    error: safetyConcernsError, 
    fetchSafetyConcerns, 
    reportSafetyConcern 
  } = useSafety();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    fetchLostItems();
    fetchSafetyConcerns();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
      return;
    }

    const reportData = {
      title,
      description,
      location,
      userName: user?.displayName || 'Anonymous User',
    };

    try {
      if (selectedIndex === 0) {
        await reportLostItem(reportData);
        ToastAndroid.show('Lost item reported successfully', ToastAndroid.SHORT);
      } else {
        await reportSafetyConcern(reportData);
        ToastAndroid.show('Safety concern reported successfully', ToastAndroid.SHORT);
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting report:', error);
      ToastAndroid.show('Failed to submit report', ToastAndroid.SHORT);
    }
  };

  const renderLostItemCard = ({ item }) => (
    <View className="bg-white p-4 rounded-lg shadow-sm my-2 border-l-4 border-amber-500">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-bold text-lg">{item.title}</Text>
          <Text className="text-gray-600 mt-1">{item.description}</Text>
          {item.location && (
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="location-on" size={16} color="#6b7280" />
              <Text className="text-gray-500 ml-1">{item.location}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="mt-3 pt-2 border-t border-gray-200">
        <Text className="text-xs text-gray-500">
          Reported by: {item.userName}
        </Text>
        <Text className="text-xs text-gray-500">
          {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'Just now'}
        </Text>
      </View>
    </View>
  );

  const renderSafetyConcernCard = ({ item }) => (
    <View className="bg-white p-4 rounded-lg shadow-sm my-2 border-l-4 border-red-500">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-bold text-lg">{item.title}</Text>
          <Text className="text-gray-600 mt-1">{item.description}</Text>
          {item.location && (
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="location-on" size={16} color="#6b7280" />
              <Text className="text-gray-500 ml-1">{item.location}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="mt-3 pt-2 border-t border-gray-200">
        <Text className="text-xs text-gray-500">
          Reported by: {item.userName}
        </Text>
        <Text className="text-xs text-gray-500">
          {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'Just now'}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800">
            Get Help
        </Text>
        <Text className="text-gray-500">Report issues or concerns</Text>
      </View>

      {/* Segmented Control */}
      <SegmentedControl
        values={['Lost Items', 'Safety Concerns']}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        className="mb-4"
        backgroundColor="#000000"
        tintColor={selectedIndex === 0 ? "#f59e0b" : "#ef4444"}
      />

      {/* Add Button */}
      <TouchableOpacity
        className={`absolute right-6 top-4 z-10 p-3 rounded-full ${
          selectedIndex === 0 ? "bg-amber-500" : "bg-red-500"
        }`}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* List Content */}
      {selectedIndex === 0 ? (
        lostItemsLoading ? (
          <ActivityIndicator size="large" color="#f59e0b" />
        ) : lostItemsError ? (
          <Text className="text-center text-red-500 mt-4">{lostItemsError}</Text>
        ) : lostItems.length > 0 ? (
          <FlatList
            data={lostItems}
            renderItem={renderLostItemCard}
            keyExtractor={(item) => item.id}
            className="mt-4"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center">No lost items reported yet.</Text>
          </View>
        )
      ) : safetyConcernsLoading ? (
        <ActivityIndicator size="large" color="#ef4444" />
      ) : safetyConcernsError ? (
        <Text className="text-center text-red-500 mt-4">{safetyConcernsError}</Text>
      ) : safetyConcerns.length > 0 ? (
        <FlatList
          data={safetyConcerns}
          renderItem={renderSafetyConcernCard}
          keyExtractor={(item) => item.id}
          className="mt-4"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons name="shield-alert-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">No safety concerns reported yet.</Text>
        </View>
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-xl w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">
                {selectedIndex === 0 ? "Report Lost Item" : "Report Safety Concern"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">Title *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter title"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-medium">Description *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Provide details"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 mb-1 font-medium">Location</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Where did it happen?"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <TouchableOpacity
                className={`p-3 rounded-lg ${
                  selectedIndex === 0 ? "bg-amber-500" : "bg-red-500"
                }`}
                onPress={handleSubmit}
              >
                <Text className="text-white text-center font-bold">Submit Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}