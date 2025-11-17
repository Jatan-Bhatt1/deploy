// // Frontend/app/index.tsx
// import { StyleSheet, Text, View } from "react-native";

// export default function Home() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to MovieApp 🎬</Text>
//       <Text style={styles.subtitle}>This is the Home Screen (index.tsx)</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#121212",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#bbb",
//   },
// });

// Frontend/app/index.tsx
// import { useRouter } from "expo-router";
// import { Button, StyleSheet, Text, View } from "react-native";

// export default function Home() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome 👋</Text>
//       <Button title="Login" onPress={() => router.push("/login")} />
//       <Button title="Register" onPress={() => router.push("/register")} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
// });

import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./theme/ThemeContext";
import { CLOUDINARY_ASSETS } from "./constants/cloudinaryAssets";

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={{ uri: CLOUDINARY_ASSETS.DEFAULT_AVATAR }} style={{ width: 120, height: 120, borderRadius: 24 }} />

      <Text style={[styles.title, { color: theme.text }]}>Welcome 👋</Text>

      <Pressable style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => router.push("/register")}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#E0AA3E",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: 200,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#6DB193",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

