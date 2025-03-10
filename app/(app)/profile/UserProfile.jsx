import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfile() {
    const { user, userProfile, loading, error, updateUserProfile, fetchUserProfile } = useAuthStore();

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        semester: '',
        address: '',
        contactNo: '',
        bio: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    // Load profile data when component mounts or when userProfile changes
    useEffect(() => {
        if (user && userProfile) {
            setProfile({
                username: userProfile.username || user.displayName || '',
                email: user.email || '',
                semester: userProfile.semester || '',
                address: userProfile.address || '',
                contactNo: userProfile.contactNo || '',
                bio: userProfile.bio || ''
            });
        }
    }, [user, userProfile]);

    // Fetch user profile if not available
    useEffect(() => {
        const loadProfile = async () => {
            if (user && !userProfile) {
                await fetchUserProfile(user.uid);
            }
        };

        loadProfile();
    }, [user]);

    const handleSave = async () => {
        const success = await updateUserProfile({
            username: profile.username,
            semester: profile.semester,
            address: profile.address,
            contactNo: profile.contactNo,
            bio: profile.bio
        });

        if (success) {
            Alert.alert("Success", "Profile updated successfully");
            setIsEditing(false);
        } else {
            Alert.alert("Error", error || "Failed to update profile");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-lg">Please log in to view your profile</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">

            {/* Profile Picture and Name */}
            <View className="items-center mt-4">
                <View className="h-24 w-24 rounded-full bg-gray-300 items-center justify-center mb-2">
                    <Text className="text-2xl font-bold text-gray-600">
                        {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </Text>
                </View>
                {isEditing ? (
                    <TextInput
                        className="text-xl font-semibold p-2 border-b border-gray-300 w-64 text-center"
                        value={profile.username}
                        onChangeText={(text) => setProfile({ ...profile, username: text })}
                        placeholder="Your Name"
                    />
                ) : (
                    <Text className="text-xl font-semibold">{profile.username || "User"}</Text>
                )}
                <Text className="text-gray-500">{profile.email}</Text>
            </View>

            {/* Profile Details */}
            <View className="p-4 mt-4">
                <Text className="text-lg font-bold mb-4">Personal Information</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" />
                ) : (
                    <>
                        <ProfileField
                            label="Semester"
                            value={profile.semester}
                            isEditing={isEditing}
                            onChangeText={(text) => setProfile({ ...profile, semester: text })}
                            placeholder="e.g. 5th Semester"
                            icon="school-outline"
                        />

                        <ProfileField
                            label="Address"
                            value={profile.address}
                            isEditing={isEditing}
                            onChangeText={(text) => setProfile({ ...profile, address: text })}
                            placeholder="Your address"
                            icon="location-outline"
                        />

                        <ProfileField
                            label="Contact No"
                            value={profile.contactNo}
                            isEditing={isEditing}
                            onChangeText={(text) => setProfile({ ...profile, contactNo: text })}
                            placeholder="Your phone number"
                            icon="call-outline"
                            keyboardType="phone-pad"
                        />

                        <ProfileField
                            label="Bio"
                            value={profile.bio}
                            isEditing={isEditing}
                            onChangeText={(text) => setProfile({ ...profile, bio: text })}
                            placeholder="Tell us about yourself"
                            icon="information-circle-outline"
                            multiline={true}
                        />
                    </>
                )}
            </View>

            {/* Save Button for Mobile UX */}
            {isEditing && (
                <View className="p-4">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-500 p-4 rounded-lg items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {error && (
                <Text className="text-red-500 p-4 text-center">{error}</Text>
            )}

            <View className="h-20" />

            <View className="pt-4 pb-4 px-4">
                <View className="flex-row justify-center items-center">
                    <TouchableOpacity
                        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="bg-white rounded-full p-2 flex-row items-center"
                    >
                        <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={24} color="#3b82f6" className="mr-2" />
                        <Text className="text-blue-600 font-bold text-lg">{isEditing ? "Save Profile" : "Edit Profile"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// Helper component for profile fields
const ProfileField = ({ label, value, isEditing, onChangeText, placeholder, icon, keyboardType = "default", multiline = false }) => {
    return (
        <View className="mb-6">
            <View className="flex-row items-center mb-1">
                <Ionicons name={icon} size={18} color="#6b7280" />
                <Text className="text-gray-500 ml-2">{label}</Text>
            </View>

            {isEditing ? (
                <TextInput
                    className={`bg-gray-100 p-3 rounded-lg ${multiline ? 'h-24 text-top' : ''}`}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    multiline={multiline}
                />
            ) : (
                <Text className="p-3 bg-gray-50 rounded-lg">
                    {value || `No ${label.toLowerCase()} provided`}
                </Text>
            )}
        </View>
    );
}