import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '../../../store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/login');
    }
  }


  const menuItems = [
    { label: 'View Profile', icon: 'person-outline', route: 'profile/UserProfile' },
    { label: 'Order History', icon: 'history', route: 'cafe/OrderHistory' },
    { label: 'Emergency', icon: 'emergency', route: '/Emergency' },
    { label: 'About the App', icon: 'info-outline', route: '/About' },
  ];



  return (
    <ScrollView className="flex-1 bg-white">
      {/* User Info */}
      <View className="items-center mt-6">
        <View className="h-20 w-20 rounded-full bg-gray-300 items-center justify-center mb-2">
          <Text className="text-2xl font-bold text-gray-600">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text className="text-xl font-semibold">{user?.displayName || 'User'}</Text>
        <Text className="text-gray-500">{user?.email || 'No email provided'}</Text>
      </View>

      {/* Menu Options */}
      <View className="p-4 mt-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center p-4 bg-gray-100 rounded-lg mb-3"
            onPress={() => router.push(item.route)}
          >
            <MaterialIcons name={item.icon} size={24} color="#3b82f6" />
            <Text className="text-lg ml-4">{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Notification Toggle */}
        <View className="flex-row items-center justify-between p-4 bg-gray-100 rounded-lg mt-3">
          <View className="flex-row items-center">
            <MaterialIcons name="notifications-none" size={24} color="#3b82f6" />
            <Text className="text-lg ml-4">Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        </View>
      </View>
      {/* Logout Button */}
      <View className="p-4 mt-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-lg items-center flex-row justify-center"
        >
          <MaterialIcons name="logout" size={24} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
