import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { profileImages } from "../../utils/imageMapping";
import { updateProfileApi, deleteProfileImageApi } from "../../api/userApi";

const PRIMARY = "#2e7d32";
const CARD_BG = "#fff";
const BORDER_COLOR = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function EditProfileScreen({ navigation, route }) {
  const { onProfileUpdate } = route.params || {}; // ✅ callback
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    const storedImage = await AsyncStorage.getItem("profileImage");
    const storedToken = await AsyncStorage.getItem("token");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setName(parsed.fullName || parsed.name);
      setEmail(parsed.email);
    }
    if (storedImage) setImage(storedImage);
    if (storedToken) setToken(storedToken);
  };

  const saveProfile = async () => {
    try {
      if (!token) return Alert.alert("Error", "You are not logged in!");
      const res = await updateProfileApi(token, name, email, image);

      if (res.data.message) {
        const storedUser = JSON.parse(await AsyncStorage.getItem("user")) || {};
        const updatedUser = { ...storedUser, fullName: name, email };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        if (res.data.profileImage) {
          setImage(res.data.profileImage);
          await AsyncStorage.setItem("profileImage", res.data.profileImage);
        }

        // ✅ Update ProfileScreen instantly
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser, res.data.profileImage || image);
        }

        Alert.alert("Success", "Profile updated ✅");
        navigation.goBack();
      }
    } catch (err) {
      console.log("Save profile error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
      }
    } catch (err) {
      console.log("Pick image error:", err);
    }
  };

  const deleteImage = async () => {
    if (!image) return;
    const storedToken = await AsyncStorage.getItem("token");
    if (!storedToken) return alert("You are not logged in!");
    const confirmDelete = window.confirm("Are you sure you want to delete your profile image?");
    if (!confirmDelete) return;

    try {
      await deleteProfileImageApi(storedToken);
      setImage(null);
      await AsyncStorage.removeItem("profileImage");

      // ✅ Update ProfileScreen instantly
      if (onProfileUpdate) {
        const storedUser = JSON.parse(await AsyncStorage.getItem("user")) || {};
        onProfileUpdate(storedUser, null);
      }

      alert("Profile image removed ✅");
    } catch (err) {
      console.log("Delete image error:", err.response?.data || err.message);
      alert("Failed to delete profile image");
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: BACKGROUND }}
      contentContainerStyle={styles.container}
    >
      {/* PROFILE IMAGE */}
      <View style={styles.avatarContainer}>
        <Image
          source={image ? { uri: image } : profileImages.default}
          style={styles.avatarImage}
        />
        <View style={styles.iconRow}>
          <Pressable style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
          </Pressable>
          {image && (
            <Pressable style={styles.iconButton} onPress={deleteImage}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      {/* PROFILE FORM */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#777"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#777"
        />
        <Pressable style={[styles.button, { backgroundColor: PRIMARY }]} onPress={saveProfile}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatarImage: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#ddd" },
  iconRow: { flexDirection: "row", marginTop: 10, gap: 15 },
  iconButton: { backgroundColor: PRIMARY, padding: 6, borderRadius: 20 },
  card: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 10,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
    width: "100%",
  },
  button: { padding: 14, borderRadius: 8, alignItems: "center", width: "100%" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});