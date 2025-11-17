// Frontend/app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { LogBox } from "react-native";

// Disable development overlays that might show orange icons
LogBox.ignoreAllLogs(true);

function StackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          color: theme.text,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen 
        name="screens/Dashboard" 
        options={{ 
          title: "Dashboard",
          headerBackVisible: false,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginLeft: 10,
          },
        }} 
      />
      <Stack.Screen name="screens/Profile" options={{ title: "Profile" }} />
      <Stack.Screen name="screens/chats/Chats" options={{ title: "Chats" }} />
      <Stack.Screen name="screens/chatscreen/ChatScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/UserProfile" options={{ headerShown: false }} />
      <Stack.Screen name="screens/SearchResults" options={{ headerShown: false }} />
      <Stack.Screen name="screens/FriendRequests" options={{ title: "FriendRequests" }} />
      <Stack.Screen name="screens/Credits" options={{ title: "Credits" }} />
      <Stack.Screen name="screens/Settings" options={{ title: "Settings" }} />
      <Stack.Screen name="screens/SkillDetail" options={{ title: "Skill Information" }} />
      <Stack.Screen name="screens/batches/creative" options={{ title: "Creative" }} />
      <Stack.Screen name="screens/batches/mentorships" options={{ title: "Mentorships" }} />
      <Stack.Screen name="screens/batches/music" options={{ title: "Music & Dance" }} />
      <Stack.Screen name="screens/batches/studies" options={{ title: "Studies" }} />
      <Stack.Screen name="screens/batches/competition" options={{ title: "Competitions" }} />
      <Stack.Screen name="screens/batches/more" options={{ title: "More" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <StackNavigator />
    </ThemeProvider>
  );
}
