import React from "react";
import { Text, View, Image, TouchableOpacity, useWindowDimensions, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from 'expo-font';

export default function Index() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const [loaded] = useFonts({
    'RobotoFlex-Regular': require('../assets/fonts/RobotoFlex-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white items-center px-6 py-8">
      <StatusBar barStyle="dark-content" />
      
      {/* Logo Section */}
      <View className="items-center mt-12">
        <Image source={require("../assets/images/splash-icon.png")} style={{ width: 200, height: 100 }} />
        <Text className="text-3xl font-bold text-black mt-4 text-center" style={{ fontFamily: 'RobotoFlex-Regular' }}>University All-in-One</Text>
        <Text className="text-gray-600 text-center mt-2 text-base" style={{ fontFamily: 'RobotoFlex-Regular' }}>Everything you need for campus life</Text>
      </View>
      
      {/* Main Image */}
      <Image 
        source={{ uri: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" }}
        className="w-full rounded-2xl mt-10" 
        style={{ height: height * 0.35 }}
        resizeMode="cover"
      />
      
      {/* Get Started Button */}
      <TouchableOpacity 
        className="border-2 border-indigo-500 py-4 px-10 rounded-2xl mt-10 w-full items-center"
        onPress={() => router.push("/login")}
      >
        <Text className="text-indigo-700 font-bold text-lg">GET STARTED</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
