import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:5000";
interface SearchResult {
    _id: string;
    name: string;
    email: string;
  }
  
export default function SearchUser() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);


  const handleSearch = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/friends/search/${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/friends/request/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) alert("Request sent!");
      else alert(data.message || "Failed to send request");
    } catch (err) {
      console.error("Send request error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Users</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <TouchableOpacity
              style={styles.requestBtn}
              onPress={() => sendRequest(item._id)}
            >
              <Text style={styles.requestText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  searchBtn: {
    backgroundColor: "#E0AA3E",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  searchText: { color: "#FFF", fontWeight: "bold" },
  userCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  userName: { fontSize: 18, fontWeight: "600" },
  userEmail: { color: "#666", marginBottom: 8 },
  requestBtn: {
    backgroundColor: "#6DB193",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  requestText: { color: "#FFF", fontWeight: "bold" },
});
