import "../global.css";
import { View, Text } from 'react-native';
import { Slot, Stack, useSegments, useRouter } from 'expo-router';
import useAuthStore from '../store/useAuthStore';
import { useEffect, useState } from 'react';

const MainLayout = () => {
  const { isAuthenticated, user, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the auth listener when component mounts
  useEffect(() => {
    const unsubscribe = init();
    setIsLoading(false);
    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    // Wait until auth state is determined
    if (isLoading) return;

    const inApp = segments[0] === '(app)';
    
    if (isAuthenticated() && !inApp) {
      // User is authenticated but not in the app route
      router.replace('/Home');
    } else if (!isAuthenticated() && inApp) {
      // User is not authenticated but trying to access app routes
      router.replace('/login');
    }
  }, [isAuthenticated(), segments, isLoading]);

  // Show loading state while determining auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return <MainLayout />;
}