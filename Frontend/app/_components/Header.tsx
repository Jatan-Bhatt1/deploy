import React, { useCallback, useState, useEffect } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";
import { resolveApiBase } from "../utils/api";

type HeaderProps = {
  userName?: string;
};

// Top bar with TROT logo, credits, and profile
function TopBar() {
  const router = useRouter();
  const { theme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string>((globalThis as any).__AVATAR_URL__ || Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri);
  const [credits, setCredits] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const next = (globalThis as any).__AVATAR_URL__;
        if (typeof next === "string" && next.length > 0) {
          setAvatarUrl(next);
          return;
        }
        const cached = await AsyncStorage.getItem("avatarUrl");
        if (cached) setAvatarUrl(cached);
      })();
    }, [])
  );

  // Fetch credits balance
  const fetchCredits = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const base = resolveApiBase();
      const resp = await fetch(`${base}/api/payments/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        setCredits(data.credits || 0);
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCredits();
    }, [fetchCredits])
  );

  useEffect(() => {
    fetchCredits();
  }, []);

  return (
    <View style={[styles.topBarWrapper, { backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        <Text style={[styles.brand, { color: theme.text }]}>TROT</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.creditsContainer, { backgroundColor: "#E0AA3E" }]}
            onPress={() => router.push("/screens/Credits")}
          >
            <Ionicons name="wallet" size={18} color="#fff" />
            <Text style={styles.creditsText}>{credits}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("../screens/Profile")}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Greeting section
function Greeting({ userName = "" }: HeaderProps) {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState<string>(userName || (globalThis as any).__USER_NAME__ || "");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          if (!displayName) {
            const cachedName = await AsyncStorage.getItem("userName");
            if (cachedName) setDisplayName(cachedName);
          }
        } catch {}
      })();
    }, [displayName])
  );

  return (
    <View style={[styles.greetingWrapper, { backgroundColor: theme.surface }]}>
      <View style={styles.greetingWrap}>
        <Text style={[styles.greetLineOne, { color: theme.text }]}>Hi, {displayName || "User"}</Text>
        <Text style={[styles.greetLineTwo, { color: theme.text }]}>Unlock Your Career</Text>
      </View>
    </View>
  );
}

// Search bar component
function SearchBar() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState("");

  const handleSearchPress = () => {
    router.push({
      pathname: "/screens/SearchResults",
      params: { query: searchText },
    });
  };

  return (
    <View style={[styles.searchBarWrapper, { backgroundColor: theme.surface }]}>
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: theme.background }]}
        onPress={handleSearchPress}
        activeOpacity={0.7}
      > 
        <Entypo name="magnifying-glass" size={18} color={theme.muted} />
        <TextInput
          placeholder="Search users..."
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.text }]}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={handleSearchPress}
          editable={false}
        />
      </TouchableOpacity>
    </View>
  );
}

// Main Header component (combines TopBar and Greeting)
export default function Header({ userName = "" }: HeaderProps) {
  return (
    <>
      <TopBar />
      <Greeting userName={userName} />
    </>
  );
}

export { SearchBar, TopBar, Greeting };

const styles = StyleSheet.create({
  topBarWrapper: {
    width: "100%",
    backgroundColor: "#eef6ff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a202c",
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  creditsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  avatar: { width: 34, height: 34, borderRadius: 17, marginLeft: 6 },
  greetingWrapper: {
    width: "100%",
    backgroundColor: "#eef6ff",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  greetingWrap: {},
  greetLineOne: { fontSize: 28, fontWeight: "700", color: "#1a202c" },
  greetLineTwo: { fontSize: 24, fontWeight: "600", color: "#1a202c" },
  searchBarWrapper: {
    width: "100%",
    backgroundColor: "#eef6ff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { marginLeft: 8, flex: 1, color: "#1a202c" },
});


