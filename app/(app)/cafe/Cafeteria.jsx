import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, TextInput, ToastAndroid } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { usePreOrderStore } from '../../../store/usePreOrder';
import { useMealsStore } from '../../../store/useMeals';
import { useOrderStore } from '../../../store/useOrder';
import useAuthStore from '../../../store/useAuthStore';

export default function Cafeteria() {
  const { user, userProfile, loading, error, fetchUserProfile } = useAuthStore();
  const { preOrderMeals, loading: preOrderMealsLoading, error: preOrderMealsError, fetchPreOrderMeals } = usePreOrderStore();
  const { meals, loading: mealsLoading, error: mealsError, fetchMeals } = useMealsStore();
  const { createOrder, loading: createOrderLoading, error: createOrderError } = useOrderStore();

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedPreOrderMeal, setSelectedPreOrderMeal] = useState(null);
  const quantityRef = useRef(1);
  const orderDetailsRef = useRef({
    uid: user?.uid,
    username: '',
    contactNo: '',
    pickupTime: '',
    department: '',
    paymentMethod: 'Cash On Delivery',
  });

  useEffect(() => {
    fetchMeals();
    fetchPreOrderMeals();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      orderDetailsRef.current = {
        uid: user.uid || '',
        username: user.displayName || user.username || '',
        contactNo: user.contactNo || user.contactNo || '',
        pickupTime: '',
        department: '',
        paymentMethod: 'Cash On Delivery',
      };
    }
  }, [user]);

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
  };

  const handlePreOrderMealPress = (meal) => {
    setSelectedPreOrderMeal(meal);
    quantityRef.current = 1;
  };

  const handleCreateOrder = () => {
    const orderPayload = {
      ...orderDetailsRef.current,
      mealId: selectedPreOrderMeal?.id,
      quantity: quantityRef.current,
      totalPrice: (selectedPreOrderMeal?.price || 0) * quantityRef.current,
    };
    
    createOrder(orderPayload, orderDetailsRef.current.uid, selectedPreOrderMeal?.name);
    
    // Show success toast
    ToastAndroid.show('Order placed successfully!', ToastAndroid.SHORT);
    
    // Reset states after order
    setSelectedPreOrderMeal(null);
    quantityRef.current = 1;
    orderDetailsRef.current = {
      uid: user?.uid,
      username: user?.displayName || '',
      contactNo: user?.contactNo || '',
      pickupTime: '',
      department: '',
      paymentMethod: 'Cash On Delivery',
    };
  };

  const renderMealCard = (meal, type) => (
    <TouchableOpacity
      key={meal.name}
      className="w-[48%] m-1 bg-white rounded-xl shadow-md"
      style={{
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      onPress={() => (type === 'meal' ? handleMealPress(meal) : handlePreOrderMealPress(meal))}
    >
      <Image
        source={{ uri: meal.image_url }}
        className="w-full h-48 rounded-t-xl"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900">{meal.name}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-green-600 font-semibold text-lg">৳{meal.price}</Text>
          {type === 'preOrder' && (
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium">Pre-Order</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const MealDetailsModal = () => (
    <Modal 
      visible={!!selectedMeal} 
      transparent={true} 
      animationType="slide" 
      onRequestClose={() => setSelectedMeal(null)}
    >
      {selectedMeal && (
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="w-11/12 bg-white rounded-2xl overflow-hidden">
            <Image
              source={{ uri: selectedMeal.image_url }}
              className="w-full h-64"
              resizeMode="cover"
            />
            <View className="p-6">
              <Text className="text-2xl font-bold text-gray-900 mb-4">{selectedMeal.name}</Text>
              <View className="bg-gray-100 rounded-xl p-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Nutrition Facts</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Calories</Text>
                  <Text className="font-medium">{selectedMeal.nutrition.calories}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Protein</Text>
                  <Text className="font-medium">{selectedMeal.nutrition.protein}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Carbohydrates</Text>
                  <Text className="font-medium">{selectedMeal.nutrition.carbohydrates}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Fat</Text>
                  <Text className="font-medium">{selectedMeal.nutrition.fat}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="mt-6 bg-blue-600 p-4 rounded-xl"
                onPress={() => setSelectedMeal(null)}
              >
                <Text className="text-white text-center text-lg font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );

  const PreOrderModal = React.memo(() => {
    const [localQuantity, setLocalQuantity] = useState(quantityRef.current);
    const [localOrderDetails, setLocalOrderDetails] = useState(orderDetailsRef.current);

    // Prepopulate with user data when modal opens
    useEffect(() => {
      if (user && selectedPreOrderMeal) {
        const prepopulatedDetails = {
          uid: user.uid || '',
          username: user.displayName || user.username || '',
          contactNo: user.contactNo || user.contactNo || '',
          pickupTime: '',
          department: '',
          paymentMethod: 'Cash On Delivery',
        };
        setLocalOrderDetails(prepopulatedDetails);
        orderDetailsRef.current = prepopulatedDetails;
      }
    }, [user, selectedPreOrderMeal]);

    const updateOrderDetails = useCallback((key) => (value) => {
      const updatedDetails = { ...localOrderDetails, [key]: value };
      setLocalOrderDetails(updatedDetails);
      orderDetailsRef.current = updatedDetails;
    }, [localOrderDetails]);

    const handleConfirmOrder = () => {
      quantityRef.current = localQuantity;
      handleCreateOrder();
    };

    return (
      <Modal 
        visible={!!selectedPreOrderMeal} 
        transparent={true} 
        animationType="slide" 
        onRequestClose={() => setSelectedPreOrderMeal(null)}
      >
        {selectedPreOrderMeal && (
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="w-11/12 bg-white rounded-2xl overflow-hidden">
              <View className="p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-4">{selectedPreOrderMeal.name}</Text>
                
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg text-gray-700">Quantity</Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                      className="p-2 bg-gray-100 rounded-full mr-4"
                    >
                      <MaterialIcons name="remove" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold">{localQuantity}</Text>
                    <TouchableOpacity
                      onPress={() => setLocalQuantity(localQuantity + 1)}
                      className="p-2 bg-gray-100 rounded-full ml-4"
                    >
                      <MaterialIcons name="add" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-lg font-semibold text-green-600 mb-4">
                  Total Price: ৳{(selectedPreOrderMeal.price * localQuantity).toFixed(2)}
                </Text>

                <View className="space-y-4 mt-2">
                  <TextInput
                    placeholder="Name"
                    value={localOrderDetails.username}
                    onChangeText={updateOrderDetails('username')}
                    className="border border-gray-300 p-3 rounded-xl mb-2"
                  />
                  <TextInput
                    placeholder="Contact Number"
                    value={localOrderDetails.contactNo}
                    onChangeText={updateOrderDetails('contactNo')}
                    keyboardType="phone-pad"
                    className="border border-gray-300 p-3 rounded-xl mb-2"
                  />
                  <TextInput
                    placeholder="Pickup Time"
                    value={localOrderDetails.pickupTime}
                    onChangeText={updateOrderDetails('pickupTime')}
                    className="border border-gray-300 p-3 rounded-xl mb-2"
                  />
                  <TextInput
                    placeholder="Department"
                    value={localOrderDetails.department}
                    onChangeText={updateOrderDetails('department')}
                    className="border border-gray-300 p-3 rounded-xl mb-2" 
                  />
                </View>

                <View className="flex-row mt-6 space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-red-500 p-4 rounded-xl"
                    onPress={() => setSelectedPreOrderMeal(null)}
                  >
                    <Text className="text-white text-center text-lg font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-green-600 p-4 rounded-xl"
                    onPress={handleConfirmOrder}
                    disabled={createOrderLoading}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      {createOrderLoading ? 'Processing...' : 'Place Order'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    );
  });

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4">
        <SegmentedControl
          values={['Meals', 'Pre-Order']}
          selectedIndex={selectedSegment}
          onChange={(event) => {
            setSelectedSegment(event.nativeEvent.selectedSegmentIndex);
          }}
          style={{ marginTop: 10 }}
        />
      </View>

      <ScrollView>
        <View className="p-2 flex-row flex-wrap">
          {(selectedSegment === 0 ? meals : preOrderMeals).map((meal) => 
            renderMealCard(meal, selectedSegment === 0 ? 'meal' : 'preOrder')
          )}
        </View>
      </ScrollView>

      <MealDetailsModal />
      <PreOrderModal />
    </View>
  );
}