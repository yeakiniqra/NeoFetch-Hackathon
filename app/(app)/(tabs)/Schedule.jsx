import { View, Text, SafeAreaView, KeyboardAvoidingView, ScrollView, 
  TouchableOpacity, Pressable, TextInput, Alert, Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import useAssignment from '../../../store/useAssignment';
import useAuthStore from '../../../store/useAuthStore'

export default function Schedule() {
  const { user } = useAuthStore();
  const { 
    assignments,
    loading,
    error,
    formOpen,
    currentAssignment,
    fetchAssignments,
    openAddForm,
    openEditForm,
    closeForm,
    updateFormField,
    saveAssignment,
    deleteAssignment
  } = useAssignment();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    if (user?.uid) {
      fetchAssignments(user.uid);
    }
  }, [user]);
  
  const handleSave = async () => {
    if (!currentAssignment.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your assignment');
      return;
    }
    
    const success = await saveAssignment(user?.uid);
    if (success) {
      Alert.alert('Success', 'Assignment saved successfully');
    }
  };
  
  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => deleteAssignment(id, user?.uid),
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormField('date', selectedDate);
    }
  };
  
  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="bg-white rounded-t-3xl p-6 shadow-lg">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-medium text-slate-800">
            {currentAssignment.id ? 'Edit Assignment' : 'New Assignment'}
          </Text>
          <TouchableOpacity onPress={closeForm} className="p-2">
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-600 mb-1">Title</Text>
          <TextInput
            className="bg-gray-50 p-4 rounded-lg text-slate-800 border border-gray-200"
            placeholder="Assignment title"
            value={currentAssignment.title}
            onChangeText={(text) => updateFormField('title', text)}
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-600 mb-1">Due Date</Text>
          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-slate-800">
              {format(currentAssignment.date, 'PPP')}
            </Text>
            <MaterialIcons name="event" size={24} color="#4f46e5" />
          </Pressable>
          
          {showDatePicker && (
            <DateTimePicker
              value={currentAssignment.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-600 mb-1">Notes</Text>
          <TextInput
            className="bg-gray-50 p-4 rounded-lg text-slate-800 border border-gray-200 h-32"
            placeholder="Additional details"
            multiline
            textAlignVertical="top"
            value={currentAssignment.notes}
            onChangeText={(text) => updateFormField('notes', text)}
          />
        </View>
        
        <TouchableOpacity 
          className="bg-indigo-600 py-4 rounded-xl items-center"
          onPress={handleSave}
        >
          <Text className="text-white font-medium text-lg">Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
  
  const renderAssignmentCard = (assignment) => {
    // Calculate days remaining
    const today = new Date();
    const dueDate = new Date(assignment.date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine color based on due date
    let statusColor = 'bg-green-100 text-green-800';
    if (diffDays < 0) {
      statusColor = 'bg-red-100 text-red-800'; // overdue
    } else if (diffDays <= 3) {
      statusColor = 'bg-amber-100 text-amber-800'; // due soon
    }
    
    return (
      <View key={assignment.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-medium text-slate-800 mb-1">{assignment.title}</Text>
            <Text className="text-sm text-slate-500 mb-2">
              {format(new Date(assignment.date), 'PPP')}
            </Text>
            
            {assignment.notes ? (
              <Text className="text-slate-600 mb-3" numberOfLines={2}>
                {assignment.notes}
              </Text>
            ) : null}
            
            <View className={`self-start rounded-full px-3 py-1 ${statusColor}`}>
              <Text className="text-xs font-medium">
                {diffDays < 0
                  ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`
                  : diffDays === 0
                  ? 'Due today'
                  : `${diffDays} day${diffDays !== 1 ? 's' : ''} left`}
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              onPress={() => openEditForm(assignment)}
              className="p-2 mr-1"
            >
              <MaterialIcons name="edit" size={22} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => confirmDelete(assignment.id)}
              className="p-2"
            >
              <MaterialIcons name="delete" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {formOpen ? (
        renderForm()
      ) : (
        <>
          <View className="px-4 pt-6 pb-4 bg-indigo-600">
            <Text className="text-2xl font-bold text-white">Note Schedules</Text>
            <Text className="text-white text-opacity-80">
              Track your assignments and quizzes
            </Text>
          </View>
          
          <ScrollView className="flex-1 px-4 pt-4">
            {loading ? (
              <View className="items-center justify-center py-10">
                <Text className="text-slate-500">Loading assignments...</Text>
              </View>
            ) : error ? (
              <View className="items-center justify-center py-10">
                <Text className="text-red-500">{error}</Text>
                <TouchableOpacity 
                  onPress={() => fetchAssignments(user?.uid)}
                  className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : assignments.length === 0 ? (
              <View className="items-center justify-center py-20">
                <MaterialIcons name="assignment" size={64} color="#d1d5db" />
                <Text className="text-slate-400 text-lg mt-4">No assignments yet</Text>
                <Text className="text-slate-400 text-center mb-6">
                  Tap the + button to add your first assignment
                </Text>
              </View>
            ) : (
              <View className="pb-24">
                {assignments.map(renderAssignmentCard)}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            onPress={openAddForm}
            className="absolute right-6 bottom-20 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
          >
            <MaterialIcons name="add" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
