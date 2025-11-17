// Frontend/app/login.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postJson, resolveApiBase } from "../lib/api";
import { useTheme } from "./theme/ThemeContext";
import { connectSocket } from "./utils/socket";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [rewardData, setRewardData] = useState<{
    credits: number;
    newBalance: number;
    streak?: number;
    message: string;
  } | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Welcome Back 👋</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>Log in to continue</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={async () => {
          try {
            const resp = await postJson("/api/auth/login", { email, password });
            const data = await resp.json();

            if (!resp.ok) {
              alert(data?.message || `Login failed (${resp.status})`);
              return;
            }

            // Store user data and token
            if (data?.token) await AsyncStorage.setItem("authToken", data.token);
            if (data?.avatarUrl) {
              await AsyncStorage.setItem("avatarUrl", data.avatarUrl);
              (globalThis as any).__AVATAR_URL__ = data.avatarUrl;
            } else {
              await AsyncStorage.removeItem("avatarUrl");
              (globalThis as any).__AVATAR_URL__ = "";
            }
            if (data?.name) await AsyncStorage.setItem("userName", data.name);
            if (data?.email) await AsyncStorage.setItem("userEmail", data.email);

            (globalThis as any).__USER_NAME__ = data?.name || (globalThis as any).__USER_NAME__;
            (globalThis as any).__USER_EMAIL__ = data?.email || (globalThis as any).__USER_EMAIL__;

            // ✅ Store userId for chat functionality
            const userId = data?.user?._id || data?._id;
            if (userId) {
              await AsyncStorage.setItem("userId", userId);
              (globalThis as any).__USER_ID__ = userId;
              
              // ✅ Connect to Socket.IO after login
              connectSocket(userId);
              console.log("Socket connected for user:", userId);
            } else {
              console.warn("⚠️ No user ID found for socket connection");
            }

            // ✅ Claim daily reward after login
            try {
              const token = data?.token;
              if (token) {
                const base = resolveApiBase();
                const rewardResp = await fetch(`${base}/api/daily-reward/claim`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                const rewardResult = await rewardResp.json();
                if (rewardResult.success && rewardResult.claimed) {
                  // Show reward popup
                  setRewardData({
                    credits: rewardResult.credits,
                    newBalance: rewardResult.newBalance,
                    streak: rewardResult.streak,
                    message: rewardResult.message,
                  });
                  setRewardModalVisible(true);
                  
                  // Auto-close after 3 seconds and navigate
                  setTimeout(() => {
                    setRewardModalVisible(false);
                    router.push("/screens/Dashboard");
                  }, 3000);
                } else {
                  // No reward to claim, just navigate
                  router.push("/screens/Dashboard");
                }
              } else {
                router.push("/screens/Dashboard");
              }
            } catch (rewardError) {
              console.error("Error claiming daily reward:", rewardError);
              // Navigate even if reward claim fails
              router.push("/screens/Dashboard");
            }
          } catch (e: any) {
            alert(e?.message || "Network error. Check API base and firewall.");
          }
        }}
      >
        <Text style={styles.primaryBtnText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.secondaryBtnText}>Create an Account</Text>
      </TouchableOpacity>

      {/* Daily Reward Modal */}
      <Modal
        visible={rewardModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setRewardModalVisible(false);
          router.push("/screens/Dashboard");
        }}
      >
        <View style={styles.rewardModalOverlay}>
          <View style={styles.rewardModalContainer}>
            <View style={styles.rewardIconContainer}>
              <Ionicons name="gift" size={64} color="#E0AA3E" />
            </View>
            <Text style={styles.rewardTitle}>Daily Login Reward! 🎉</Text>
            <Text style={styles.rewardAmount}>+{rewardData?.credits || 10} Credits</Text>
            {rewardData?.streak && rewardData.streak > 1 && (
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={20} color="#FF6B35" />
                <Text style={styles.streakText}>Streak: {rewardData.streak} days 🔥</Text>
              </View>
            )}
            <Text style={styles.rewardMessage}>{rewardData?.message || "Keep logging in daily for more rewards!"}</Text>
            <Text style={styles.rewardBalance}>New Balance: {rewardData?.newBalance || 0} credits</Text>
            <TouchableOpacity
              style={styles.rewardCloseButton}
              onPress={() => {
                setRewardModalVisible(false);
                router.push("/screens/Dashboard");
              }}
            >
              <Text style={styles.rewardCloseButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6F0",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  primaryBtn: {
    backgroundColor: "#E0AA3E",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondaryBtn: {
    backgroundColor: "#6DB193",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  rewardModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  rewardIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF8E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  rewardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  rewardAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#E0AA3E",
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5E6",
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
  },
  rewardMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  rewardBalance: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  rewardCloseButton: {
    backgroundColor: "#E0AA3E",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 150,
  },
  rewardCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
