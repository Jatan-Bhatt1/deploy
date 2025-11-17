// Frontend/app/screens/ChatScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  Keyboard,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "../../utils/socket";
import { useRoute, useNavigation } from "@react-navigation/native";
import { resolveApiBase } from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

type MessageItem = {
  _id?: string;
  sender?: string | { _id?: string; name?: string };
  receiver?: string;
  content: string;
  createdAt?: string;
};

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  // @ts-ignore
  const receiverId: string = (route.params && (route.params as any).receiverId) || "";
  // @ts-ignore
  const receiverName: string = (route.params && (route.params as any).name) || "User";
  // @ts-ignore
  const receiverAvatar: string = (route.params && (route.params as any).avatarUrl) || "";

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [userCredits, setUserCredits] = useState(0);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const socketRef = useRef<any>(null);
  const userIdRef = useRef<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Fetch user credits
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
        setUserCredits(data.credits || 0);
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = await AsyncStorage.getItem("authToken");
      
      // Get userId from stored user data
      let storedUserId = (globalThis as any).__USER_ID__ || await AsyncStorage.getItem("userId");
      if (!storedUserId && token) {
        // If we have a token but no userId, we might need to decode it or fetch user info
        // For now, try to get from global or wait for it to be set
        console.warn("⚠️ No userId found, chat may not work properly");
      }
      userIdRef.current = storedUserId;

      // Fetch credits
      await fetchCredits();

      // --- Load chat history ---
      try {
        const base = resolveApiBase();
        const url = `${base}/api/messages/${receiverId}`;
        const resp = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!resp.ok) {
          console.warn("Failed to load messages:", resp.status);
        } else {
          const data = await resp.json();
          if (mounted) setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Error fetching messages:", err);
      } finally {
        if (mounted) setLoading(false);
      }

      // --- Attach socket ---
      const socket = getSocket();
      socketRef.current = socket;

      if (socket) {
        console.log("📡 Socket connected in ChatScreen");

        socket.on(
          "receiveMessage",
          (payload: { senderId: string; content: string; createdAt?: string }) => {
            if (!payload) return;
            const { senderId, content, createdAt } = payload;

            // Only show message if it's from this chat partner (receiverId is the person we're chatting with)
            // senderId is the person who sent the message, which should match receiverId
            // Don't show our own messages (we already added them optimistically)
            const currentUserId = userIdRef.current?.toString();
            if (senderId === receiverId && senderId !== currentUserId) {
              setMessages((prev) => {
                // Check if message already exists (prevent duplicates)
                const messageExists = prev.some(
                  (msg) => 
                    msg.content === content && 
                    (typeof msg.sender === "string" ? msg.sender === senderId : msg.sender?._id === senderId)
                );
                
                if (messageExists) {
                  return prev; // Don't add duplicate
                }
                
                return [
                  ...prev,
                  { sender: senderId, receiver: userIdRef.current || "", content, createdAt },
                ];
              });
            }
          }
        );

        // Listen for credit received notifications
        socket.on("creditReceived", (payload: { senderId: string; senderName: string; amount: number; newBalance: number }) => {
          Alert.alert(
            "💰 Credits Received!",
            `You received ${payload.amount} credits from ${payload.senderName}. Your new balance is ${payload.newBalance} credits.`,
            [{ text: "OK" }]
          );
          fetchCredits(); // Refresh credits
        });
      } else {
        console.log("⚠️ Socket not connected yet in ChatScreen");
      }
    }

    init();

    return () => {
      mounted = false;
      const s = socketRef.current;
      if (s) {
        s.off("receiveMessage");
        s.off("creditReceived");
      }
    };
  }, [receiverId]);

  // --- Send message ---
  const sendMessage = async () => {
    if (!text.trim()) return;

    const senderId = userIdRef.current;
    if (!senderId) {
      alert("User not found (not logged in).");
      return;
    }

    const messageObj = {
      senderId: senderId?.toString() || "",
      receiverId: receiverId?.toString() || "",
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, messageObj]);
    setText("");

    // --- Send message via Socket (preferred) or REST (fallback) ---
    const socket = socketRef.current;
    if (socket) {
      // Send via socket - backend will save and emit to receiver
      socket.emit("sendMessage", messageObj);
      
      // Update optimistic message with server response after a short delay
      // The socket handler saves it, so we'll get it back via receiveMessage
      // But we already added it optimistically, so we need to prevent duplicates
    } else {
      // Fallback to REST API if socket not available
      console.warn("Socket not initialized — message sent via REST only");
      try {
        const token = await AsyncStorage.getItem("authToken");
        const base = resolveApiBase();
        const resp = await fetch(`${base}/api/messages/${receiverId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ content: text }),
        });
        
        if (resp.ok) {
          const savedMessage = await resp.json();
          // Update the optimistic message with the real one from server
          setMessages((prev) => 
            prev.map((msg, idx) => 
              idx === prev.length - 1 && !msg._id ? savedMessage : msg
            )
          );
        }
      } catch (err) {
        console.warn("Failed to persist message via REST:", err);
      }
    }
  };

  // Send payment function
  const handleSendPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0");
      return;
    }

    if (amount > userCredits) {
      Alert.alert("Insufficient Credits", `You only have ${userCredits} credits.`);
      return;
    }

    setSendingPayment(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const base = resolveApiBase();
      const resp = await fetch(`${base}/api/payments/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          amount,
          description: `Payment to ${receiverName}`,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        Alert.alert("Success", `Successfully sent ${amount} credits to ${receiverName}`);
        setPaymentModalVisible(false);
        setPaymentAmount("");
        await fetchCredits(); // Refresh credits
      } else {
        Alert.alert("Error", data.message || "Failed to send payment");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send payment");
    } finally {
      setSendingPayment(false);
    }
  };

  // Clear chat function
  const clearChat = async () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to delete all messages in this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setMenuVisible(false) },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              const base = resolveApiBase();
              const resp = await fetch(`${base}/api/messages/${receiverId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              if (resp.ok) {
                setMessages([]);
                setMenuVisible(false);
                Alert.alert("Success", "Chat cleared successfully");
              } else {
                const data = await resp.json();
                Alert.alert("Error", data.message || "Failed to clear chat");
              }
            } catch (err) {
              console.error("Error clearing chat:", err);
              Alert.alert("Error", "Failed to clear chat");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#E0AA3E" />
      </View>
    );
  }

  // --- UI ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header with name and three dots menu */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Image
            source={
              receiverAvatar
                ? { uri: receiverAvatar }
                : require("../../../assets/images/default-avatar.jpg")
            }
            style={[styles.headerAvatar, { backgroundColor: theme.border }]}
          />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{receiverName}</Text>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

      {/* Three dots menu modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setPaymentModalVisible(true);
              }}
            >
              <Ionicons name="wallet-outline" size={20} color="#E0AA3E" />
              <Text style={[styles.menuItemText, { color: "#E0AA3E" }]}>Send Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={clearChat}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
              <Text style={[styles.menuItemText, { color: "#f44336" }]}>Clear Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.menuItemCancel, { color: theme.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={[styles.paymentModalContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.paymentModalHeader}>
              <Text style={[styles.paymentModalTitle, { color: theme.text }]}>Send Credits</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentModalContent}>
              <Text style={[styles.paymentModalLabel, { color: theme.text }]}>To: {receiverName}</Text>
              <Text style={[styles.paymentModalBalance, { color: theme.muted }]}>Your Balance: {userCredits} credits</Text>

              <Text style={[styles.paymentModalLabel, { color: theme.text }]}>Amount</Text>
              <TextInput
                style={[styles.paymentInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                placeholder="Enter amount"
                placeholderTextColor={theme.muted}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.paymentSendButton,
                  (sendingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) && styles.paymentSendButtonDisabled
                ]}
                onPress={handleSendPayment}
                disabled={sendingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                {sendingPayment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.paymentSendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, idx) => item._id ?? idx.toString()}
        style={{ 
          backgroundColor: theme.background, 
          flex: 1,
          marginBottom: keyboardHeight > 0 ? keyboardHeight + 110 : 100 
        }}
        contentContainerStyle={{ 
          padding: 12, 
          paddingBottom: 20
        }}
        renderItem={({ item }) => {
          const senderId =
            typeof item.sender === "string" ? item.sender : item.sender?._id;
          const isMe = senderId === userIdRef.current;

          return (
            <View
              style={[styles.msgContainer, isMe ? styles.msgRight : styles.msgLeft]}
            >
              <Text style={styles.msgText}>{item.content}</Text>
              <Text style={styles.msgTime}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>
          );
        }}
      />

      <View style={[styles.inputRow, { 
        backgroundColor: theme.surface, 
        borderTopColor: theme.border,
        bottom: keyboardHeight > 0 ? keyboardHeight + 50 : 40,
        position: 'absolute',
        left: 0,
        right: 0,
      }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          placeholderTextColor={theme.muted}
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
        />
        <TouchableOpacity 
          onPress={sendMessage}
          style={styles.sendButton}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 28,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginLeft: "auto",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemCancel: {
    fontSize: 16,
    textAlign: "center",
  },
  msgContainer: {
    marginVertical: 6,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
  },
  msgLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  msgRight: {
    alignSelf: "flex-end",
    backgroundColor: "#E0AA3E",
  },
  msgText: { fontSize: 16 },
  msgTime: { fontSize: 10, marginTop: 6, textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0AA3E",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  paymentModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  paymentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  paymentModalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  paymentModalContent: {
    gap: 16,
  },
  paymentModalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentModalBalance: {
    fontSize: 14,
    marginTop: -8,
  },
  paymentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
  },
  paymentSendButton: {
    backgroundColor: "#E0AA3E",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  paymentSendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  paymentSendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
