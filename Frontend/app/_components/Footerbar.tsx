// import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
// import type { Href } from "expo-router";
// import { useRouter } from "expo-router";
// import type { ReactElement } from "react";
// import React, { useState } from "react";
// import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// const { width } = Dimensions.get("window");

// export default function Footerbar() {
//   const [active, setActive] = useState("Home");
//   const router = useRouter();

//   const menuItems = [
//     { name: "Home", icon: <FontAwesome5 name="home" size={24} color="white" />, route: "../screens/Dashboard" as const },
//     { name: "Session", icon: <Entypo name="calendar" size={24} color="white" />, route: "../screens/Session" as const },
//     { name: "Profile", icon: <FontAwesome5 name="user" size={24} color="white" />, route: "../screens/Profile" as const },
//     { name: "Credits", icon: <FontAwesome5 name="coins" size={24} color="white" />, route: "../screens/Credits" as const },
//     { name: "Settings", icon: <MaterialIcons name="settings" size={24} color="white" />, route: "../screens/Settings" as const },
//   ] satisfies { name: string; icon: ReactElement; route: Href }[];

//   return (
//     <View style={styles.container}>
      
//       <View style={styles.footer}>
//         {menuItems.map((item) => (
//           <TouchableOpacity
//             key={item.name}
//             style={styles.iconContainer}
//             onPress={() => {
//               setActive(item.name);
//               router.push(item.route);
//             }}
//           >
//             {React.cloneElement(item.icon, {
//               color: active === item.name ? "#00e0ff" : "white",
//             })}
//             <Text style={[styles.label, active === item.name && { color: "#00e0ff" }]}>
//               {item.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//       <View style={styles.bottomSpace} />
//     </View>
    
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     bottom: 50,
//     left: 0,
//     right: 0,
//   },
//   bottomSpace: {
//     width: "100%",
//     height:10,
//     backgroundColor: "#000",
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     width: "100%",
//     height: 70,
//     backgroundColor: "#1e1e1e",
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   iconContainer: { alignItems: "center" },
//   label: { fontSize: 12, color: "white", marginTop: 2 },
// });
import { Entypo, FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import type { ReactElement } from "react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function Footerbar() {
  const router = useRouter();
  const pathname = usePathname(); // 🔹 get current active route
  const { theme, isDark } = useTheme();

  const menuItems = [
    { name: "Home", icon: <FontAwesome5 name="home" size={20} />, route: "/screens/Dashboard" as const },
    { name: "Chats", icon: <Ionicons name="chatbubbles" size={20} />, route: "/screens/chats/Chats" as const },
    { name: "Profile", icon: <FontAwesome5 name="user" size={20} />, route: "/screens/Profile" as const },
    { name: "Credits", icon: <FontAwesome5 name="coins" size={20} />, route: "/screens/Credits" as const },
    { name: "Settings", icon: <MaterialIcons name="settings" size={20} />, route: "/screens/Settings" as const },
  ] satisfies { name: string; icon: ReactElement; route: Href }[];

  return (
    <View style={styles.container}> 
      <View style={[styles.footer, { backgroundColor: isDark ? "#1e1e1e" : "#1e1e1e" }]}> 
        {menuItems.map((item) => {
          const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
          let isActive = false;
          if (item.name === "Home") {
            // Active for any screens under /screens that are not dedicated tabs
            const isScreens = normalizedPath.startsWith("/screens/");
            const isOtherTab = [
              "/screens/chats/Chats",
              "/screens/Profile",
              "/screens/Credits",
              "/screens/Settings",
            ].some((p) => normalizedPath.startsWith(p));
            isActive = isScreens && !isOtherTab;
          } else {
            isActive = normalizedPath.startsWith(item.route as string);
          }
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.iconContainer}
              onPress={() => router.push(item.route)}
            >
              {React.cloneElement(item.icon, {
                color: isActive ? "#00e0ff" : "#f0f6fc",
              })}
              <Text style={[styles.label, isActive && { color: "#00e0ff" }]}> 
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.bottomSpace, { backgroundColor: theme.background }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomSpace: {
    width: "100%",
    height: 35,
    backgroundColor: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 60,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    paddingHorizontal: 10,
  },
  iconContainer: { 
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: { 
    fontSize: 10, 
    color: "#f0f6fc", 
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
