import React from "react";
import { 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  useWindowDimensions,
  ImageBackground,
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" }}
        className="flex-1"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          className="flex-1"
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1 justify-between px-6 py-8">
              {/* Header Section */}
              <View className="items-center mt-4">
                <View className="bg-white/20 rounded-full p-5 backdrop-blur-md">
                  <View className="w-16 h-16 bg-purple-600 rounded-full items-center justify-center">
                    <Text className="text-3xl font-bold text-white">UA</Text>
                  </View>
                </View>
                <Text className="text-white text-3xl font-bold mt-4 text-center">University All-in-One</Text>
                <Text className="text-white/80 text-center mt-2 text-base">Everything you need for campus life</Text>
              </View>

              {/* Features Section */}
              <View className="my-8">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">1</Text>
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-lg">Campus Transport</Text>
                    <Text className="text-white/70">Never miss a bus with real-time tracking</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">2</Text>
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-lg">Class Schedule</Text>
                    <Text className="text-white/70">Manage your timetable and reminders</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">3</Text>
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-lg">Campus Events</Text>
                    <Text className="text-white/70">Stay updated with all university events</Text>
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View className="space-y-4">
                <TouchableOpacity 
                  className="bg-purple-600 py-4 rounded-xl shadow-lg"
                  onPress={() => router.push("/login")}
                >
                  <Text className="text-white text-center font-bold text-lg">Sign In</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-white/20 backdrop-blur-md py-4 rounded-xl"
                  onPress={() => router.push("/signup")}
                >
                  <Text className="text-white text-center font-bold text-lg">Create Account</Text>
                </TouchableOpacity>
                
                <Text className="text-white/60 text-center mt-3 text-sm">
                  By continuing, you agree to our Terms and Privacy Policy
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}