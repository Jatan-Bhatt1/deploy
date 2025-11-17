import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backend URL (Expo env var or fallback)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE || "http://192.168.1.5:5000";

let socket: Socket | null = null;

// Initialize socket connection manually when user logs in
export const connectSocket = (userId: string) => {
  if (!userId) {
    return null;
  }

  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket?.emit("join", userId);
    });
  }

  return socket;
};

// Async version that fetches userId from AsyncStorage (used in App.tsx)
export const initSocket = async () => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem("token");
  if (!token) {
    return null;
  }

  const userData = JSON.parse((await AsyncStorage.getItem("userData")) || "{}");
  const userId = userData._id;

  if (!userId) {
    return null;
  }

  return connectSocket(userId);
};

// Get the current socket instance (returns null if not connected)
export const getSocket = (): Socket | null => socket;
