import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import useNotices from "../../hooks/useGetNotice";

export default function Notices() {
  const { notices, loading, error } = useNotices();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Loading notices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load notices</Text>
      </View>
    );
  }

  // Sort notices by latest
  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.datetime) - new Date(a.datetime)
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <FlatList
        data={sortedNotices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white p-4 mb-3 rounded-lg shadow-md flex-row items-center">
            <Image
              source={{ uri: item.headline_image }}
              className="w-12 h-12 rounded-md"
              resizeMode="cover"
            />
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {item.headline.length > 50
                  ? `${item.headline.substring(0, 50)}...`
                  : item.headline}
              </Text>
              <Text className="text-sm text-gray-500">
                {format(new Date(item.datetime), "MMM dd, yyyy")}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {item.short_Description.length > 80
                  ? `${item.short_Description.substring(0, 80)}...`
                  : item.short_Description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
