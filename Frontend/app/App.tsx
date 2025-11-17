// Frontend/app/App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import Chats from "./screens/chats/Chats";
import ChatScreen from "./screens/chatscreen/ChatScreen";
import FriendRequests from "./screens/FriendRequests";
import { getSocket } from "./utils/socket";

// Import your screens
import Dashboard from "./screens/Dashboard";
import Creative from "./screens/batches/creative";
import Mentorships from "./screens/batches/mentorships";
import Music from "./screens/batches/music";
import Studies from "./screens/batches/studies";
import Competition from "./screens/batches/competition";
import More from "./screens/batches/more";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      // Listen for friend request notifications
      socket.on("friendRequestReceived", ({ senderId }) => {
        Alert.alert("New Friend Request", `You received a request from ${senderId}`);
      });

      // Listen for accepted requests
      socket.on("friendRequestAccepted", ({ receiverId }) => {
        Alert.alert("Friend Request Accepted", `Your request was accepted by ${receiverId}`);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      socket?.off("friendRequestReceived");
      socket?.off("friendRequestAccepted");
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false }}
      >
        {/* All routes must be registered here */}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Creative" component={Creative} />
        <Stack.Screen name="Mentorships" component={Mentorships} />
        <Stack.Screen name="Music" component={Music} />
        <Stack.Screen name="Studies" component={Studies} />
        <Stack.Screen name="Competition" component={Competition} />
        <Stack.Screen name="More" component={More} />
        <Stack.Screen name="Chats" component={Chats} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="FriendRequests" component={FriendRequests} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
