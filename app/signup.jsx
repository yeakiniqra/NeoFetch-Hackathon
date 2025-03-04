import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../store/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  
  const router = useRouter();
  const { register, error, loading, resetError } = useAuthStore();

  // Reset auth store errors when component unmounts
  useEffect(() => {
    return () => resetError();
  }, []);

  const validateForm = () => {
    setFormError('');
    
    if (!username.trim()) {
      setFormError('Username is required');
      return false;
    }
    
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!email.endsWith('@uap-bd.edu')) {
      setFormError('Please use your university email (@uap-bd.edu)');
      return false;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    const success = await register(username, email, password);
    if (success) {
      // Registration successful, router will automatically redirect to Home
      // based on your RootLayout authentication check
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6 py-10">
          {/* App Logo */}
          <View className="my-8 items-center">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-3">
              <Image 
                source={require('../assets/images/splash-icon.png')} 
                style={{ width: 60, height: 60 }}
              />
            </View>
            <Text className="text-4xl font-bold text-slate-800">UAPedia</Text>
            <Text className="text-xl text-slate-500 mt-1">Create your account</Text>
          </View>

          {/* Error Messages */}
          {(error || formError) && (
            <View className="w-full bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-600 text-center">
                {formError || error}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View className="w-full space-y-4">
            {/* Username Field */}
            <View className="space-y-1">
              <Text className="text-slate-700 font-medium ml-1 mb-2 mt-2">Username</Text>
              <View className="flex-row items-center bg-slate-100 rounded-lg px-3 py-2">
                <MaterialIcons name="person" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-slate-800 py-2 mb-2"
                  placeholder="Your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="space-y-1">
              <Text className="text-slate-700 font-medium ml-1 mb-2 mt-2">University Email</Text>
              <View className="flex-row items-center bg-slate-100 rounded-lg px-3 py-2">
                <MaterialIcons name="email" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-slate-800 py-2 mb-2"
                  placeholder="youremail@uap-bd.edu"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="space-y-1">
              <Text className="text-slate-700 font-medium ml-1 mb-2 mt-2">Password</Text>
              <View className="flex-row items-center bg-slate-100 rounded-lg px-3 py-2">
                <MaterialIcons name="lock" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-slate-800 py-2 mb-2"
                  placeholder="Set a strong password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View className="space-y-1">
              <Text className="text-slate-700 font-medium ml-1 mb-2 mt-2">Confirm Password</Text>
              <View className="flex-row items-center bg-slate-100 rounded-lg px-3 py-2">
                <MaterialIcons name="lock" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-slate-800 py-2 mb-2"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              className={`w-full rounded-lg py-3 ${loading ? 'bg-purple-300' : 'bg-purple-600'} mt-4`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row mt-6">
            <Text className="text-slate-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-purple-600 font-semibold ml-1">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}