import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useNavigation } from 'expo-router';

export default function TabLayout() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#6750A4',
            tabBarInactiveTintColor: '#79747E',
            tabBarShowLabel: true,
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#E7E0EC',
                backgroundColor: 'white',
                position: 'absolute',
                elevation: 2,
                paddingVertical: 10,
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                height: 60,
                justifyContent: 'center',
                alignSelf: 'center',
            }
        }}>
            <Tabs.Screen
                name="Home"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="Transport"
                options={{
                    title: 'Transport',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="directions-bus" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="Schedule"
                options={{
                    title: 'Schedule',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="Events"
                options={{
                    title: 'Events',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />
                }}
            />


            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
                }}
            />


        </Tabs>
    );
}
