import { Stack } from 'expo-router'

export default function _layout() {
    return (
        <Stack>
            <Stack.Screen name="Clubs"
                options={{
                    headerShown: true
                }}
            />
            <Stack.Screen name="Faculty"
                options={{
                    headerShown: true
                }}
            />
            <Stack.Screen name="Notices"
                options={{
                    headerShown: true
                }}
            />
            <Stack.Screen name="Routine"
                options={{
                    headerShown: true
                }}
            />
            <Stack.Screen name="cafe/Cafeteria"
                options={{
                    headerShown: true,
                    title: 'Campus Cafeteria'
                }}
            />
            <Stack.Screen name="profile/UserProfile"
                options={{
                    headerShown: true,
                    title: 'User Profile'
                }}
            />
            <Stack.Screen name="cafe/OrderHistory"
                options={{
                    headerShown: true,
                    title: 'Order History'
                }}
            />
            <Stack.Screen name="Emergency"
                options={{
                    headerShown: true,
                    title: 'Emergency Contacts'
                }}
            />
             <Stack.Screen name="EventDetails"
                options={{
                    headerShown: false,
                }}
            />

        </Stack>

    )
}