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
            <Stack.Screen name="Cafeteria"
                options={{
                    headerShown: true
                }}
            />
        </Stack>
    )
}
