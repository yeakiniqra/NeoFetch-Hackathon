import {
    View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, Share, Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router';
import useEvents from '../../store/useEvents'
import useAuthStore from '../../store/useAuthStore'
import * as Calendar from 'expo-calendar'

export default function EventDetails() {
    const router = useRouter();
    const { eventId } = useLocalSearchParams();
    
    const { user } = useAuthStore();
    const {
        currentEvent,
        loading,
        error,
        fetchEventById,
        rsvpToEvent,
        cancelRsvp,
        hasUserRsvpd
    } = useEvents();

    const [calendarPermission, setCalendarPermission] = useState(false);
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
    const [isRsvpd, setIsRsvpd] = useState(false);

    useEffect(() => {
        if (eventId) {
            fetchEventById(eventId);
        }

        (async () => {
            const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
            setCalendarPermission(calendarStatus === 'granted');
        })();
    }, [eventId]);

    // Update RSVP status whenever currentEvent or user changes
    useEffect(() => {
        if (user && eventId) {
            setIsRsvpd(hasUserRsvpd(eventId, user.uid));
        } else {
            setIsRsvpd(false);
        }
    }, [currentEvent, user, eventId]);



    const handleRsvp = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to RSVP for this event.');
            return;
        }

        try {
            if (isRsvpd) {
                Alert.alert(
                    'Cancel RSVP',
                    'Are you sure you want to cancel your RSVP?',
                    [
                        { text: 'No', style: 'cancel' },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                const success = await cancelRsvp(eventId, user.uid);
                                if (success) {
                                    setIsRsvpd(false);
                                    Alert.alert('Success', 'Your RSVP has been canceled.');
                                }
                            }
                        }
                    ]
                );
            } else {
                const success = await rsvpToEvent(eventId, user.uid, user.displayName || 'Anonymous');
                if (success) {
                    setIsRsvpd(true);
                    Alert.alert('RSVP Successful', 'Would you like to add this event to your calendar?', [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes', onPress: addToCalendar }
                    ]);
                }
            }
        } catch (error) {
            console.error('Error in RSVP process:', error);
            Alert.alert('Error', 'There was a problem processing your RSVP. Please try again.');
        }
    };

    const addToCalendar = async () => {
        if (!currentEvent) return;

        try {
            setIsAddingToCalendar(true);

            if (!calendarPermission) {
                Alert.alert('Permission Required', 'Calendar permission is needed to add this event.');
                setIsAddingToCalendar(false);
                return;
            }

            const defaultCalendar = await Calendar.getDefaultCalendarAsync();
            let startDate = new Date(currentEvent.date);
            let endDate = new Date(currentEvent.date);

            if (currentEvent.time) {
                const times = currentEvent.time.split('-').map(t => t.trim());
                if (times.length > 0) {
                    const startTimeParts = times[0].match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (startTimeParts) {
                        let [_, hours, minutes, ampm] = startTimeParts;
                        hours = parseInt(hours);
                        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                        startDate.setHours(hours, parseInt(minutes), 0);
                    }

                    if (times.length > 1) {
                        const endTimeParts = times[1].match(/(\d+):(\d+)\s*(AM|PM)/i);
                        if (endTimeParts) {
                            let [_, hours, minutes, ampm] = endTimeParts;
                            hours = parseInt(hours);
                            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                            endDate.setHours(hours, parseInt(minutes), 0);
                        }
                    } else {
                        endDate.setHours(startDate.getHours() + 1, startDate.getMinutes(), 0);
                    }
                }
            }

            await Calendar.createEventAsync(defaultCalendar.id, {
                title: currentEvent.title,
                startDate,
                endDate,
                location: currentEvent.venue,
                notes: currentEvent.description,
                alarms: [{ relativeOffset: -60 }]
            });

            Alert.alert('Success', 'Event added to your calendar');
        } catch (error) {
            console.error('Error adding to calendar:', error);
            Alert.alert('Error', 'Could not add event to calendar');
        } finally {
            setIsAddingToCalendar(false);
        }
    };

    const handleShare = async () => {
        if (!currentEvent) return;

        try {
            await Share.share({
                message: `Check out this event: ${currentEvent.title}\n\nDate: ${new Date(currentEvent.date).toLocaleDateString()}\nTime: ${currentEvent.time || 'TBA'}\nVenue: ${currentEvent.venue || 'TBA'}\n\n${currentEvent.description}`,
            });
        } catch (error) {
            console.error('Error sharing event:', error);
        }
    };


    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-slate-500 mt-2">Loading event...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
                <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                <Text className="text-red-500 mt-2">{error}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/Events')}
                    className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg"
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!currentEvent) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
                <Text className="text-slate-500">Event not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg"
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1">
                {/* Image Header */}
                <View className="relative w-full h-56">
                    {currentEvent.image_url ? (
                        <Image
                            source={{ uri: currentEvent.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-gray-200 items-center justify-center">
                            <MaterialIcons name="event" size={64} color="#9ca3af" />
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/Events')}
                        className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-sm"
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleShare}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm"
                    >
                        <MaterialIcons name="share" size={24} color="#1f2937" />
                    </TouchableOpacity>

                    <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
                </View>

                {/* Event Details */}
                <View className="px-4 py-5">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                            <Text className="text-2xl font-bold text-slate-800">{currentEvent.title}</Text>
                            <Text className="text-indigo-600 font-medium mt-1">
                                {new Date(currentEvent.date).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View className="bg-indigo-100 rounded-full px-3 py-1">
                            <Text className="text-indigo-800 text-xs font-medium">{currentEvent.category}</Text>
                        </View>
                    </View>

                    <View className="mt-4 flex-row flex-wrap">
                        <View className="flex-row items-center mr-6 mb-2">
                            <MaterialIcons name="access-time" size={20} color="#6b7280" />
                            <Text className="text-slate-600 ml-2">{currentEvent.time || 'TBA'}</Text>
                        </View>

                        <View className="flex-row items-center mr-6 mb-2">
                            <MaterialIcons name="location-on" size={20} color="#6b7280" />
                            <Text className="text-slate-600 ml-2">{currentEvent.venue || 'TBA'}</Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="person" size={20} color="#6b7280" />
                            <Text className="text-slate-600 ml-2">
                                {currentEvent.rsvp_count || 0} attending
                            </Text>
                        </View>
                    </View>

                    <View className="mt-2">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons name="business" size={20} color="#6b7280" />
                            <Text className="text-slate-600 ml-2">
                                Organized by {currentEvent.organizer || 'University'}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
                        <Text className="text-lg font-medium text-slate-800 mb-2">About Event</Text>
                        <Text className="text-slate-600 leading-6">{currentEvent.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="bg-white border-t border-gray-200 px-4 py-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <MaterialIcons
                        name={isRsvpd ? "event-available" : "event"}
                        size={24}
                        color={isRsvpd ? "#4f46e5" : "#6b7280"}
                    />
                    <Text className={`ml-2 font-medium ${isRsvpd ? 'text-indigo-600' : 'text-slate-600'}`}>
                        {isRsvpd ? 'RSVP\'d' : 'RSVP to attend'}
                    </Text>
                </View>

                <View className="flex-row">
                    {isRsvpd && (
                        <TouchableOpacity
                            onPress={addToCalendar}
                            disabled={isAddingToCalendar}
                            className="bg-indigo-100 rounded-xl px-4 py-2 mr-2 flex-row items-center"
                        >
                            {isAddingToCalendar ? (
                                <ActivityIndicator size="small" color="#4f46e5" />
                            ) : (
                                <>
                                    <MaterialIcons name="event-note" size={18} color="#4f46e5" />
                                    <Text className="text-indigo-600 font-medium ml-1">Calendar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleRsvp}
                        disabled={loading}
                        className={`rounded-xl px-6 py-3 flex-row items-center ${isRsvpd ? 'bg-red-100' : 'bg-indigo-600'}`}
                    >
                        <MaterialIcons
                            name={isRsvpd ? "close" : "check"}
                            size={18}
                            color={isRsvpd ? "#ef4444" : "white"}
                        />
                        <Text className={`font-medium ml-1 ${isRsvpd ? 'text-red-600' : 'text-white'}`}>
                            {loading ? "Processing..." : (isRsvpd ? 'Cancel' : 'RSVP')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
