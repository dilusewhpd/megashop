import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

const PRIMARY = "#2e7d32";   // main green theme
const BACKGROUND = "#f4fbf4"; // screen background
const CARD_BG = "#fff";        // item background
const DANGER = "#ef4444";      // logout red

export default function ProfileScreen({ navigation, setToken }) {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedImage = await AsyncStorage.getItem("profileImage");

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedImage) setImage(storedImage);
    } catch (err) {
      console.log("Load user error:", err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await AsyncStorage.setItem("profileImage", uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            if (setToken) setToken(null);
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
        <Text style={{ color: "#555" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scrollContainer, { backgroundColor: BACKGROUND }]} contentContainerStyle={styles.container}>
      {/* Avatar with edit icon */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: image ? image : "https://www.w3schools.com/howto/img_avatar.png" }}
          style={styles.avatarImage}
        />

        {/* Edit Icon */}
        <Pressable style={styles.editIcon} onPress={pickImage}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Name & Email */}
      <Text style={[styles.name, { color: PRIMARY }]}>{user.fullName || user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* Profile options */}
      <View style={styles.section}>
        <ProfileItem
          icon="create-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <ProfileItem
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <ProfileItem
          icon="log-out-outline"
          label="Logout"
          danger
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}

function ProfileItem({ icon, label, danger, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.item, { backgroundColor: CARD_BG }]}>
      <Ionicons name={icon} size={22} color={danger ? DANGER : "#333"} />
      <Text style={[styles.itemText, { color: danger ? DANGER : "#333" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },

  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },

  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
  },

  editIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: PRIMARY,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },

  email: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },

  section: {
    marginTop: 30,
    width: "90%",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  itemText: {
    flex: 1,
    fontWeight: "600",
    fontSize: 16,
  },
});