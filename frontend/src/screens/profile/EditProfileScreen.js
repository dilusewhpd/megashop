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
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { profileImages } from "../../utils/imageMapping";
import { updateProfileApi, deleteProfileImageApi } from "../../api/userApi";

const PRIMARY = "#2e7d32";
const CARD_BG = "#fff";
const BORDER_COLOR = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function EditProfileScreen({ navigation, route }) {
  const { onProfileUpdate } = route.params || {};
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

  // Convert image to base64 data URL for persistent storage
  const convertImageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Get file extension from URI
      const extension = uri.split('.').pop().toLowerCase();
      const mimeType = extension === 'jpg' ? 'jpeg' : extension;
      return `data:image/${mimeType};base64,${base64}`;
    } catch (error) {
      console.log("Error converting image to base64:", error);
      return null;
    }
  };

  const saveProfile = async () => {
    try {
      if (!token) return Alert.alert("Error", "You are not logged in!");

      // Prepare image for upload (convert base64 back to file if needed)
      let imageToUpload = image;
      if (image && image.startsWith('data:image/')) {
        // For base64 images, we might need to handle differently
        // For now, we'll send the base64 string and let the backend handle it
        imageToUpload = image;
      }

      const res = await updateProfileApi(token, name, email, imageToUpload);

      if (res.data.message) {
        const storedUser = JSON.parse(await AsyncStorage.getItem("user")) || {};
        const updatedUser = { ...storedUser, fullName: name, email };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        // Always save the current image to AsyncStorage for persistence
        if (image) {
          await AsyncStorage.setItem("profileImage", image);
        }

        if (res.data.profileImage) {
          // If backend returns a URL, use that instead
          setImage(res.data.profileImage);
          await AsyncStorage.setItem("profileImage", res.data.profileImage);
        }

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

        // Convert to base64 for persistent storage
        const base64Image = await convertImageToBase64(uri);
        if (base64Image) {
          setImage(base64Image);
          // Save base64 image to AsyncStorage for persistence
          await AsyncStorage.setItem("profileImage", base64Image);
        } else {
          // Fallback to original URI if conversion fails
          setImage(uri);
          await AsyncStorage.setItem("profileImage", uri);
        }
      }
    } catch (err) {
      console.log("Pick image error:", err);
    }
  };

  const deleteImage = async () => {
    if (!image) return;
    const storedToken = await AsyncStorage.getItem("token");
    if (!storedToken) return alert("You are not logged in!");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile image?"
    );
    if (!confirmDelete) return;

    try {
      await deleteProfileImageApi(storedToken);
      setImage(null);
      await AsyncStorage.removeItem("profileImage");

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
        {/* NAME FIELD */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#bbb"
          />
        </View>

        {/* EMAIL FIELD */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
          />
        </View>

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
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#ddd",
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  iconRow: { flexDirection: "row", marginTop: 10, gap: 15 },
  iconButton: { backgroundColor: PRIMARY, padding: 8, borderRadius: 25 },
  card: {
    backgroundColor: CARD_BG,
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: 10,
  },
  inputGroup: { width: "100%", marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fdfdfd",
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});