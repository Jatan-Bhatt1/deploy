// Frontend/app/screens/FriendRequests.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveApiBase } from "../../lib/api";
import { getSocket } from "../utils/socket";

interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  status: string;
}

const FriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.warn("⚠️ No auth token found");
        setRequests([]);
        return;
      }

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch pending requests:", res.status);
        setRequests([]);
        return;
      }

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("🚨 Error fetching requests:", err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        alert("Not authenticated");
        return;
      }

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/accept/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to accept request");
        return;
      }

      setRequests((prev) => prev.filter((req) => req._id !== id));
      alert("Friend request accepted!");
    } catch (err: any) {
      console.error("Error accepting request:", err.message);
      alert("Error accepting request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        alert("Not authenticated");
        return;
      }

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/reject/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to reject request");
        return;
      }

      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err: any) {
      console.error("Error rejecting request:", err.message);
      alert("Error rejecting request");
    }
  };

  useEffect(() => {
    fetchRequests();

    // 🔔 Real-time updates via Socket.IO
    const socket = getSocket();
    if (socket) {
      socket.on("friendRequestReceived", (data: any) => {
        console.log("📩 New friend request received:", data);
        // Refetch to get the full request object
        fetchRequests();
      });

      socket.on("friendRequestAccepted", () => {
        console.log("✅ Friend request accepted");
        fetchRequests();
      });

      return () => {
        socket.off("friendRequestReceived");
        socket.off("friendRequestAccepted");
      };
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friend Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.noRequests}>No pending requests</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.sender.name || "Unknown User"}</Text>
                <Text style={styles.email}>{item.sender.email}</Text>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => handleAccept(item._id)}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.reject]}
                  onPress={() => handleReject(item._id)}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  noRequests: { textAlign: "center", color: "#888", marginTop: 20 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 1,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 14, color: "#666" },
  buttons: { flexDirection: "row", gap: 8 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  accept: { backgroundColor: "#4CAF50" },
  reject: { backgroundColor: "#f44336" },
  btnText: { color: "#fff", fontWeight: "500" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default FriendRequests;
