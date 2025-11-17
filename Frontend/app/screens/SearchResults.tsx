import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { resolveApiBase } from "../utils/api";
import { useTheme } from "../theme/ThemeContext";

interface SearchResult {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function SearchResults() {
  const { theme } = useTheme();
  const router = useRouter();
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.warn("No auth token found");
        return;
      }

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: "/screens/UserProfile",
      params: { userId },
    });
  };

  const defaultAvatar = Image.resolveAssetSource(
    require("../../assets/images/default-avatar.jpg")
  ).uri;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Entypo name="magnifying-glass" size={18} color={theme.muted} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={theme.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E0AA3E" />
        </View>
      ) : results.length === 0 && searchQuery.trim() ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={64} color={theme.muted} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            No users found
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={64} color={theme.muted} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            Start typing to search for users
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userCard, { backgroundColor: theme.surface }]}
              onPress={() => handleUserPress(item._id)}
            >
              <Image
                source={{ uri: item.avatarUrl || defaultAvatar }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.muted }]}>
                  {item.email}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
});

