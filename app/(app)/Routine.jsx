import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity, Alert, ToastAndroid, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import LottieView from "lottie-react-native";

const semesterMapping = {
  '1': '1.1',
  '2': '1.2',
  '3': '2.1',
  '4': '2.2',
  '5': '3.1',
  '6': '3.2',
  '7': '4.1',
  '8': '4.2',
};

const Routines = () => {
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingRoutine, setFetchingRoutine] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://cse.uap-bd.edu/v1/api/classroutines/");
        setSemesters([...new Set(response.data.map((item) => item.semester))]);
        setSections([...new Set(response.data.map((item) => item.section))]);
        setRoutines(response.data);
      } catch (error) {
        setError("Failed to load data. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedSection) {
      setFetchingRoutine(true);
      const routineData = routines.find(
        (item) => item.semester === selectedSemester && item.section === selectedSection
      );
      setRoutine(routineData || null);
      setFetchingRoutine(false);
    }
  }, [selectedSemester, selectedSection]);

  const saveRoutine = async () => {
    try {
      await AsyncStorage.setItem("savedRoutine", JSON.stringify({ semester: selectedSemester, section: selectedSection, routine }));
      ToastAndroid.show("Routine saved successfully!", ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show("Failed to save routine. Try again.", ToastAndroid.SHORT);
    }
  };

  const loadSavedRoutine = async () => {
    try {
      const savedRoutine = await AsyncStorage.getItem("savedRoutine");
      if (savedRoutine) {
        const { semester, section, routine } = JSON.parse(savedRoutine);
        setSelectedSemester(semester);
        setSelectedSection(section);
        setRoutine(routine);
      }
    } catch (error) {
      console.error("Failed to load saved routine", error);
    }
  };

  useEffect(() => {
    loadSavedRoutine();
  }, []);

  const downloadRoutine = async () => {
    if (!routine) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant media library access.");
        return;
      }
      const fileUri = `${FileSystem.documentDirectory}${routine.image.split("/").pop()}`;
      await FileSystem.downloadAsync(routine.image, fileUri);
      await MediaLibrary.createAssetAsync(fileUri);
      ToastAndroid.show("Routine downloaded successfully!", ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show("Download failed. Try again.", ToastAndroid.SHORT);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <LottieView className="w-40 h-40" source={require("../../assets/images/loading.json")} autoPlay loop />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-5 bg-gray-50">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="schedule" size={24} color="#2563eb" />
        <Text className="text-lg font-semibold text-gray-800 ml-2">Select Semester</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {semesters.map((semester) => (
          <TouchableOpacity
            key={semester}
            className={`flex-row items-center px-4 py-2 rounded-md ${selectedSemester === semester ? "bg-blue-600" : "bg-gray-200"}`}
            onPress={() => setSelectedSemester(semester)}
          >
            <MaterialIcons
              name="school"
              size={20}
              color={selectedSemester === semester ? "white" : "black"}
              className="mr-2"
            />
            <Text className={`font-medium ${selectedSemester === semester ? "text-white" : "text-gray-800"}`}>
              {semesterMapping[semester] || semester}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSemester && (
        <>
          <View className="flex-row items-center mt-4 mb-2">
            <MaterialIcons name="groups" size={24} color="#2563eb" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">Select Section</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {sections.map((section) => (
              <TouchableOpacity
                key={section}
                className={`flex-row items-center px-4 py-2 rounded-md ${selectedSection === section ? "bg-blue-600" : "bg-gray-200"}`}
                onPress={() => setSelectedSection(section)}
              >
                <Text className={`font-medium ${selectedSection === section ? "text-white" : "text-gray-800"}`}>
                  {section}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {fetchingRoutine ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-5" />
      ) : (
        routine && (
          <View className="mt-6 items-center">
            <View className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
              <Image
                source={{ uri: routine.image }}
                className="w-full h-60 rounded-md"
                resizeMode="contain"
              />
            </View>
            <View className="flex-row justify-center w-full">
              <TouchableOpacity
                className="flex-row items-center flex-1 bg-blue-600 py-3 rounded-md mr-2"
                onPress={downloadRoutine}
              >
                <Text className="text-white text-center font-semibold flex-1">Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center flex-1 bg-green-600 py-3 rounded-md"
                onPress={saveRoutine}
              >
                <Text className="text-white text-center font-semibold flex-1">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}

      {error && (
        <View className="mt-4 bg-red-100 p-4 rounded-md flex-row items-center">
          <MaterialIcons name="error-outline" size={24} color="red" className="mr-2" />
          <Text className="text-red-800 flex-1">{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Routines;
