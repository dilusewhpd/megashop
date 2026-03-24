import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";

const PRIMARY = "#2e7d32";
const BACKGROUND = "#f4fbf4";
const CARD_BG = "#fff";
const BORDER = "#c8e6c9";
const DANGER = "#ef4444";

export default function ProfileScreen({ navigation, setToken }) {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  // ✅ Header like HomeScreen (no back arrow)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerTintColor: "#fff",
    });
  }, [navigation]);

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

  // ✅ FIXED LOGOUT
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["token", "user"]);

            // update global auth state
            if (setToken) setToken(null);

            // reset navigation stack (important fix)
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (err) {
            console.log("Logout error:", err);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: BACKGROUND }]}>
        <Text style={{ color: "#555" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: BACKGROUND }}
      contentContainerStyle={styles.container}
    >
      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: image
                ? image
                : "https://www.w3schools.com/howto/img_avatar.png",
            }}
            style={styles.avatarImage}
          />

          <Pressable style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.name}>
          {user.fullName || user.name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* OPTIONS CARD */}
      <View style={styles.card}>
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

// Reusable item
function ProfileItem({ icon, label, danger, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color={danger ? DANGER : "#333"} />
      <Text style={[styles.itemText, { color: danger ? DANGER : "#333" }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 3,
  },

  avatarWrapper: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },

  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ddd",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },

  email: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

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

  itemText: {
    flex: 1,
    fontWeight: "600",
    fontSize: 16,
  },
});