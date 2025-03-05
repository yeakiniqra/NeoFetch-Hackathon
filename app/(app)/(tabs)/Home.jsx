import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import useAuthStore from '../../../store/useAuthStore';
import useAssignment from '../../../store/useAssignment';
import useNotices from '../../../hooks/useGetNotice';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchAssignments,
  } = useAssignment();

  const {
    notices,
    loading: noticesLoading,
    error: noticesError,
    refreshNotices
  } = useNotices();

  const [latestNotices, setLatestNotices] = useState([]);

  useEffect(() => {
    fetchAssignments();
    refreshNotices();
  }, []);


  useEffect(() => {
    if (notices && notices.length > 0) {
    
      const sortedNotices = [...notices].sort((a, b) =>
        new Date(b.datetime) - new Date(a.datetime)
      ).slice(0, 2);

      setLatestNotices(sortedNotices);
    }
  }, [notices]);

  const navigateToScreen = (screenName) => {
    router.navigate(screenName);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderOptionButton = (iconName, iconColor, bgColor, label, screenName) => (
    <TouchableOpacity
      className="items-center"
      onPress={() => navigateToScreen(screenName)}
    >
      <View className={`w-12 h-12 ${bgColor} rounded-full items-center justify-center mb-1`}>
        <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
      </View>
      <Text className="text-sm font-medium">{label}</Text>
    </TouchableOpacity>
  );

  const renderAssignmentCard = (assignment) => {
    const diffDays = getDaysRemaining(assignment.date);

  
    let statusColor = 'bg-green-100 text-green-800';
    if (diffDays < 0) {
      statusColor = 'bg-red-100 text-red-800';
    } else if (diffDays <= 3) {
      statusColor = 'bg-amber-100 text-amber-800'; 
    }

    return (
      <TouchableOpacity
        key={assignment.id}
        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3"
        onPress={() => navigateToScreen('Schedule')}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-bold text-slate-800">{assignment.title}</Text>
            <Text className="text-slate-500 text-xs mt-1">{assignment.notes}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColor}`}>
            <Text className="text-xs font-medium">
              {diffDays < 0
                ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`
                : diffDays === 0
                  ? 'Due today'
                  : `${diffDays} day${diffDays !== 1 ? 's' : ''} left`}
            </Text>
          </View>
        </View>

        <View className="flex-row mt-3 items-center">
          <MaterialCommunityIcons name="clock-outline" size={14} color="#64748b" />
          <Text className="text-xs text-slate-500 ml-1">
            {formatDate(assignment.date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNoticeCard = (notice) => (
    <TouchableOpacity
      key={notice.id}
      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3"
      onPress={() => navigateToScreen('Notices')}
    >
      <View className="flex-row items-center">
        <View className="h-10 w-10 bg-amber-100 rounded-lg items-center justify-center mr-3">
          <MaterialCommunityIcons name="bell-outline" size={20} color="#d97706" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-800 flex-shrink" numberOfLines={1}>
            {notice.headline || notice.title}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">
            {formatDate(notice.datetime || notice.date)}
          </Text>
          {notice.short_Description && (
            <Text className="text-xs text-slate-600 mt-1" numberOfLines={1}>
              {notice.short_Description}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (icon, title, description, action = null) => (
    <View className="bg-slate-50 p-6 rounded-xl items-center">
      <MaterialCommunityIcons name={icon} size={48} color="#94a3b8" />
      <Text className="text-slate-700 font-medium mt-2">{title}</Text>
      <Text className="text-slate-500 text-center mt-1">{description}</Text>
      {action && (
        <TouchableOpacity
          className="mt-4 bg-blue-600 px-5 py-2 rounded-full"
          onPress={action.onPress}
        >
          <Text className="text-white font-medium">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* App Logo and Welcome Section */}
        <View className="items-center mt-2">
          <Image
            source={require('../../../assets/images/UAPEDIA.png')}
            className="w-40 h-12 object-cover"
          />
          <View className="items-start w-full px-4 mt-6">
            <Text className="text-2xl font-bold text-slate-800">
              Welcome, {user?.displayName || 'Student'}
            </Text>
            <Text className="text-slate-500 mt-1">
              Your UAP CSE Companion
            </Text>
          </View>
        </View>

        {/* Options Bar */}
        <View className="flex-row justify-around mt-8 mx-4 p-2 bg-slate-50 rounded-2xl">
          {renderOptionButton('account-tie', '#2563eb', 'bg-blue-100', 'Faculty', 'Faculty')}
          {renderOptionButton('calendar-clock', '#7e22ce', 'bg-purple-100', 'Routine', 'Routine')}
          {renderOptionButton('bell', '#d97706', 'bg-amber-100', 'Notices', 'Notices')}
          {renderOptionButton('account-group', '#059669', 'bg-emerald-100', 'Clubs', 'Clubs')}
          {renderOptionButton('food', '#ff6347', 'bg-red-100', 'Cafeteria', 'cafe/Cafeteria')}
        </View>

        {/* Assignments Section */}
        <View className="mt-8 mx-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Assignments</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Schedule')}>
              <Text className="text-blue-600 font-medium">See more →</Text>
            </TouchableOpacity>
          </View>

          {assignmentsLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : assignmentsError ? (
            <Text className="text-red-500 text-center py-4">Error loading assignments</Text>
          ) : assignments.length > 0 ? (
            <View className="space-y-3">
              {assignments.slice(0, 2).map(renderAssignmentCard)}
            </View>
          ) : (
            renderEmptyState(
              'clipboard-text-outline',
              'No assignments scheduled',
              'Keep track of your assignments and deadlines',
              {
                label: 'Add Assignment',
                onPress: () => navigateToScreen('Schedule')
              }
            )
          )}
        </View>

        {/* Notices Section */}
        <View className="mt-8 mx-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Recent Notices</Text>
            <TouchableOpacity onPress={() => navigateToScreen('/Notices')}>
              <Text className="text-blue-600 font-medium">See more →</Text>
            </TouchableOpacity>
          </View>

          {noticesLoading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : noticesError ? (
            <Text className="text-red-500 text-center py-4">Error loading notices</Text>
          ) : latestNotices.length > 0 ? (
            <View className="space-y-3">
              {latestNotices.map(renderNoticeCard)}
            </View>
          ) : (
            renderEmptyState(
              'bell-off-outline',
              'No recent notices',
              'Check back later for updates'
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}