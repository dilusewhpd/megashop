import React, { useState, useLayoutEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutApi } from "../../api/authApi";
import { profileImages } from "../../utils/imageMapping";

const PRIMARY = "#2e7d32";
const BACKGROUND = "#f4fbf4";
const CARD_BG = "#fff";
const BORDER = "#c8e6c9";
const DANGER = "#ef4444";

export default function ProfileScreen({ navigation, setToken }) {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerTintColor: "#fff",
    });
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedImage = await AsyncStorage.getItem("profileImage");
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedImage) setImage(storedImage);
      else setImage(null);
    } catch (err) {
      console.log("Load user error:", err);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const token = await AsyncStorage.getItem("token");
      if (token) await logoutApi(token);

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      if (setToken) setToken(null);
    } catch (err) {
      console.log("Logout error:", err?.response?.data || err.message);
    }
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: BACKGROUND }]}>
        <Text style={{ color: "#555" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: BACKGROUND }} contentContainerStyle={styles.container}>
      <Pressable
        style={styles.profileCard}
        onPress={() =>
          navigation.navigate("EditProfile", {
            onProfileUpdate: (updatedUser, updatedImage) => {
              setUser(updatedUser);
              setImage(updatedImage);
            },
          })
        }
      >
        <Image
          source={image ? { uri: image } : profileImages.default}
          style={styles.avatarImage}
        />
        <Text style={styles.name}>{user.fullName || user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </Pressable>

      <View style={styles.card}>
        <ProfileItem
          icon="create-outline"
          label="Edit Profile"
          onPress={() =>
            navigation.navigate("EditProfile", {
              onProfileUpdate: (updatedUser, updatedImage) => {
                setUser(updatedUser);
                setImage(updatedImage);
              },
            })
          }
        />
        <ProfileItem
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <ProfileItem icon="log-out-outline" label="Logout" danger onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

function ProfileItem({ icon, label, danger, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color={danger ? DANGER : "#333"} />
      <Text style={[styles.itemText, { color: danger ? DANGER : "#333" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ddd", marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "800", color: "#222" },
  email: { fontSize: 14, color: "#555", marginTop: 4 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },
  itemText: { flex: 1, fontWeight: "600", fontSize: 16 },
});