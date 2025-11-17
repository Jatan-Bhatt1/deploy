import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { resolveApiBase } from "../../utils/api";
import { useTheme } from "../../theme/ThemeContext";

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}


export default function Chats() {
  const { theme } = useTheme();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const router = useRouter();

  // Fetch pending requests count
  const fetchPendingCount = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
  
        if (!token) {
          console.warn("⚠️ No auth token found");
          setFriends([]);
          setLoading(false);
          return;
        }
  
        const base = resolveApiBase();
        const res = await fetch(`${base}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!res.ok) {
          console.error("❌ Failed to fetch friends:", res.status);
          setFriends([]);
          return;
        }
  
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
        
        // Also fetch pending count
        fetchPendingCount();
      } catch (err) {
        console.error("🚨 Error fetching friends:", err);
        setFriends([]);
      } finally {
        // ✅ Always stop loading, even on error
        setLoading(false);
      }
    })();
  }, []);
  

  // 🔍 Search users by name/email
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const token = await AsyncStorage.getItem("authToken");
    try {
      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/search/${text}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 📨 Send friend request
  const sendRequest = async (receiverId: string) => {
    const token = await AsyncStorage.getItem("authToken");
    try {
      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/send/${receiverId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Friend request sent!");
        // Refresh pending count
        fetchPendingCount();
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.log("Error sending request:", err);
      alert("Error sending request");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#E0AA3E" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🔝 Header with title + Friend Requests button */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Chats</Text>
  
        {/* 👥 Friend Requests button */}
        <TouchableOpacity
          style={[styles.friendReqBtn, { backgroundColor: "#E0AA3E" }]}
          onPress={() => router.push("/screens/FriendRequests")}
        >
          <Ionicons name="person-add" size={16} color="#FFF" />
          <Text style={styles.friendReqText}>Requests</Text>
          {/* Optional: red dot badge for pending requests */}
          {pendingCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>
  
      {/* 🔍 Search input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Entypo name="magnifying-glass" size={18} color={theme.muted} />
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search users..."
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={theme.muted} />
          </TouchableOpacity>
        )}
      </View>
  
      {/* Search results */}
      {searchLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#E0AA3E" />
        </View>
      ) : searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.searchResult, { backgroundColor: theme.surface }]}
                onPress={() =>
                  router.push({
                    pathname: "/screens/UserProfile",
                    params: { userId: item._id },
                  })
                }
              >
                <Image
                  source={
                    item.avatarUrl
                      ? { uri: item.avatarUrl }
                      : require("../../../assets/images/default-avatar.jpg")
                  }
                  style={styles.searchAvatar}
                />
                <View style={styles.searchInfo}>
                  <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.friendEmail, { color: theme.muted }]}>{item.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: "#E0AA3E" }]}
                  onPress={() => sendRequest(item._id)}
                >
                  <Ionicons name="person-add" size={16} color="#FFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
  
      {/* Friends list */}
      {searchResults.length === 0 && (
        <View style={styles.friendsContainer}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Your Friends</Text>
          {friends.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Ionicons name="people-outline" size={48} color={theme.muted} />
              <Text style={[styles.noFriends, { color: theme.muted }]}>No friends yet.</Text>
              <Text style={[styles.noFriendsSubtext, { color: theme.muted }]}>
                Search for users to add them as friends
              </Text>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.friendItem, { backgroundColor: theme.surface }]}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/chatscreen/ChatScreen",
                      params: { receiverId: item._id, name: item.name },
                    })
                  }
                >
                  <Image
                    source={
                      item.avatarUrl
                        ? { uri: item.avatarUrl }
                        : require("../../../assets/images/default-avatar.jpg")
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.friendEmail, { color: theme.muted }]}>{item.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  friendReqBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  friendReqText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e53e3e",
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  searchInfo: {
    flex: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  friendsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    borderRadius: 16,
    marginTop: 32,
  },
  noFriends: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noFriendsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
