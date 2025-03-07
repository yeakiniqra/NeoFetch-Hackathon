import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import useFaqChatbot from "../../hooks/AiModel";

export default function FAQ() {
  const [input, setInput] = useState("");
  const { generateResponse } = useFaqChatbot();
  const [chat, setChat] = useState([]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { type: "user", text: input };
    setChat((prevChat) => [...prevChat, userMessage]);

    setInput(""); // Clear input field

    try {
      const botReply = await generateResponse(input);
      if (botReply) {
        const botMessage = { type: "bot", text: botReply };
        setChat((prevChat) => [...prevChat, botMessage]);
      } else {
        throw new Error("No response from AI model.");
      }
    } catch (error) {
      console.error("Error generating response:", error);
      Alert.alert("Chatbot Error", "Failed to fetch response. Please check your internet connection.");
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
    
      {/* Chat Container */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}>
        {chat.map((item, index) => (
          <View
            key={index}
            className={`p-3 my-2 rounded-lg ${
              item.type === "user" ? "bg-blue-500 self-end" : "bg-gray-700 self-start"
            }`}
          >
            <Text className="text-white">{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Box */}
      <View className="flex-row items-center bg-white p-2 rounded-lg border border-gray-300 mt-4">
        <TextInput
          className="flex-1 p-2 text-base"
          placeholder="Ask your question..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-lg"
          onPress={handleSubmit}
        >
          <MaterialIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}