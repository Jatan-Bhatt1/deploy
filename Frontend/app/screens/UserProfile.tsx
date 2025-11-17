import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { resolveApiBase } from "../utils/api";
import { useTheme } from "../theme/ThemeContext";

interface Skill {
  _id?: string;
  name: string;
  category: string;
  description?: string;
  experience?: string;
}

interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
  requestSentByMe: boolean;
  skills?: Skill[];
}

export default function UserProfile() {
  const { theme } = useTheme();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please log in to view profiles");
        router.back();
        return;
      }

      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to load profile");
        router.back();
        return;
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Error", "Failed to load profile");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!profile || sendingRequest) return;

    setSendingRequest(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const base = resolveApiBase();
      const res = await fetch(`${base}/api/friends/send/${profile._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message || "Friend request sent!");
        // Refresh profile to update request status
        fetchProfile();
      } else {
        Alert.alert("Error", data.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Error sending request:", err);
      Alert.alert("Error", "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const startChat = () => {
    if (profile) {
      router.push({
        pathname: "/screens/chatscreen/ChatScreen",
        params: { receiverId: profile._id, receiverName: profile.name },
      });
    }
  };

  const removeFriend = async () => {
    if (!profile || removingFriend) return;

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${profile.name} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingFriend(true);
            try {
              const token = await AsyncStorage.getItem("authToken");
              const base = resolveApiBase();
              const res = await fetch(`${base}/api/friends/remove/${profile._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await res.json();
              if (res.ok) {
                Alert.alert("Success", data.message || "Friend removed successfully");
                setMenuVisible(false);
                // Refresh profile to update friend status
                fetchProfile();
              } else {
                Alert.alert("Error", data.message || "Failed to remove friend");
              }
            } catch (err) {
              console.error("Error removing friend:", err);
              Alert.alert("Error", "Failed to remove friend");
            } finally {
              setRemovingFriend(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#E0AA3E" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Profile not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const defaultAvatar = Image.resolveAssetSource(
    require("../../assets/images/default-avatar.jpg")
  ).uri;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        {profile.isFriend && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        {!profile.isFriend && <View style={{ width: 24 }} />}
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: profile.avatarUrl || defaultAvatar }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>{profile.name}</Text>
        <Text style={[styles.email, { color: theme.muted }]}>{profile.email}</Text>
      </View>

      <View style={styles.actionsSection}>
        {profile.isFriend ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={startChat}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Start Chat</Text>
          </TouchableOpacity>
        ) : profile.hasPendingRequest ? (
          <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
            <Ionicons
              name={profile.requestSentByMe ? "time-outline" : "mail-outline"}
              size={24}
              color={theme.muted}
            />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {profile.requestSentByMe
                ? "Friend request sent"
                : "You have a pending request from this user"}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.requestButton]}
            onPress={sendFriendRequest}
            disabled={sendingRequest}
          >
            {sendingRequest ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Send Friend Request</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <View style={styles.skillsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profile.skills.map((skill, index) => (
              <View
                key={skill._id || index}
                style={[styles.skillCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.skillHeader}>
                  <Text style={[styles.skillName, { color: theme.text }]}>
                    {skill.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: "#E0AA3E" }]}>
                    <Text style={styles.categoryText}>{skill.category}</Text>
                  </View>
                </View>
                {skill.description && (
                  <Text style={[styles.skillDescription, { color: theme.muted }]}>
                    {skill.description}
                  </Text>
                )}
                {skill.experience && (
                  <Text style={[styles.skillExperience, { color: theme.muted }]}>
                    Experience: {skill.experience}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {(!profile.skills || profile.skills.length === 0) && (
        <View style={styles.skillsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills</Text>
          <View style={[styles.emptySkillsCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="briefcase-outline" size={32} color={theme.muted} />
            <Text style={[styles.emptySkillsText, { color: theme.muted }]}>
              No skills added yet
            </Text>
          </View>
        </View>
      )}

      {/* Three Dots Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
            {profile.isFriend && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={removeFriend}
                disabled={removingFriend}
              >
                {removingFriend ? (
                  <ActivityIndicator size="small" color={theme.error} />
                ) : (
                  <Ionicons name="person-remove" size={20} color={theme.error} />
                )}
                <Text style={[styles.menuItemText, { color: theme.error }]}>
                  Remove Friend
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#E0AA3E",
    shadowColor: "#E0AA3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  requestButton: {
    backgroundColor: "#E0AA3E",
  },
  chatButton: {
    backgroundColor: "#6DB193",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButtonText: {
    color: "#E0AA3E",
    fontSize: 16,
    fontWeight: "600",
  },
  skillsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  skillsContainer: {
    gap: 12,
  },
  skillCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skillName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  skillDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  skillExperience: {
    fontSize: 13,
    fontStyle: "italic",
  },
  emptySkillsCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptySkillsText: {
    fontSize: 16,
    marginTop: 12,
  },
});

