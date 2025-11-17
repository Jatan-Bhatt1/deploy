// Frontend/app/screens/Credits.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FooterBar from "../_components/Footerbar";
import { useTheme } from "../theme/ThemeContext";
import { resolveApiBase } from "../utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { CLOUDINARY_ASSETS } from "../constants/cloudinaryAssets";

type Payment = {
  _id: string;
  amount: number;
  type: string;
  isSent: boolean;
  otherUser: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
};

export default function Credits() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");

  const fetchCredits = async () => {
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
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const base = resolveApiBase();
      const url = `${base}/api/payments/history${filter !== "all" ? `?type=${filter}` : ""}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchCredits(), fetchPaymentHistory()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCredits(), fetchPaymentHistory()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const defaultAvatar = { uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0AA3E" />
        </View>
        <FooterBar />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Enhanced Credits Balance Card */}
        <LinearGradient
          colors={["#B8860B", "#CD9C2E", "#D4A43D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceCardContent}>
            <View style={styles.balanceTopRow}>
              <View style={styles.walletIconContainer}>
                <Ionicons name="wallet" size={28} color="#fff" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceSubtitle}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{credits.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.balanceBottomRow}>
              <View style={styles.balanceStat}>
                <Ionicons name="trending-up" size={16} color="rgba(255, 250, 240, 0.95)" />
                <Text style={styles.balanceStatText}>Active</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceStat}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 250, 240, 0.95)" />
                <Text style={styles.balanceStatText}>Real-time</Text>
              </View>
            </View>
          </View>
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: filter === "all" ? "#B8860B" : theme.surface, borderColor: theme.border },
              filter === "all" && styles.filterButtonActive
            ]}
            onPress={() => setFilter("all")}
          >
            <Ionicons
              name="list"
              size={18}
              color={filter === "all" ? "#FFF8E7" : theme.text}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.filterText, { color: filter === "all" ? "#FFF8E7" : theme.text }, filter === "all" && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: filter === "sent" ? "#B8860B" : theme.surface, borderColor: theme.border },
              filter === "sent" && styles.filterButtonActive
            ]}
            onPress={() => setFilter("sent")}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={filter === "sent" ? "#FFF8E7" : theme.text}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.filterText, { color: filter === "sent" ? "#FFF8E7" : theme.text }, filter === "sent" && styles.filterTextActive]}>
              Sent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: filter === "received" ? "#B8860B" : theme.surface, borderColor: theme.border },
              filter === "received" && styles.filterButtonActive
            ]}
            onPress={() => setFilter("received")}
          >
            <Ionicons
              name="arrow-down"
              size={18}
              color={filter === "received" ? "#FFF8E7" : theme.text}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.filterText, { color: filter === "received" ? "#FFF8E7" : theme.text }, filter === "received" && styles.filterTextActive]}>
              Received
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Ionicons name="receipt" size={22} color={theme.text} />
            <Text style={[styles.historyTitle, { color: theme.text }]}>Transaction History</Text>
          </View>
          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                <Ionicons name="receipt-outline" size={64} color={theme.muted} />
              </View>
              <Text style={[styles.emptyText, { color: theme.muted }]}>No transactions yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.muted }]}>
                Your payment history will appear here
              </Text>
            </View>
          ) : (
            payments.map((payment) => (
              <View
                key={payment._id}
                style={[styles.paymentItem, { backgroundColor: theme.surface }]}
              >
                <View
                  style={[
                    styles.paymentIconContainer,
                    { backgroundColor: payment.isSent ? (isDark ? "#4A1A1A" : "#FFEBEE") : (isDark ? "#1A4A1A" : "#E8F5E9") },
                  ]}
                >
                  <Ionicons
                    name={payment.isSent ? "arrow-up" : "arrow-down"}
                    size={20}
                    color={payment.isSent ? "#f44336" : "#4CAF50"}
                  />
                </View>
                <Image
                  source={
                    payment.otherUser.avatarUrl
                      ? { uri: payment.otherUser.avatarUrl }
                      : defaultAvatar
                  }
                  style={styles.avatar}
                />
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentUserName, { color: theme.text }]}>
                    {payment.otherUser.name}
                  </Text>
                  <View style={styles.paymentMeta}>
                    <Text style={[styles.paymentType, { color: theme.muted }]}>
                      {payment.isSent ? "Sent" : "Received"}
                    </Text>
                    <Text style={[styles.paymentDate, { color: theme.muted }]}>
                      • {formatDate(payment.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentAmountContainer}>
                  <Text
                    style={[
                      styles.paymentAmount,
                      { color: payment.isSent ? "#f44336" : "#4CAF50" },
                    ]}
                  >
                    {payment.isSent ? "-" : "+"}
                    {payment.amount}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FooterBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 28,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 24,
    shadowColor: "#E0AA3E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  balanceCardContent: {
    padding: 24,
    zIndex: 1,
  },
  balanceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: "rgba(255, 250, 240, 0.95)",
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFF8E7",
    letterSpacing: -1,
  },
  balanceBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  balanceStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceStatText: {
    fontSize: 12,
    color: "rgba(255, 250, 240, 0.95)",
    fontWeight: "500",
  },
  balanceDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -30,
    left: -30,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: "#B8860B",
    borderColor: "#B8860B",
    shadowColor: "#B8860B",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFF8E7",
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentUserName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentType: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentAmountContainer: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
});
