import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIMARY = "#2e7d32";     // main green theme
const CARD_BG = "#fff";         // card background for inputs
const BORDER_COLOR = "#c8e6c9"; // input border
const BACKGROUND = "#f4fbf4";  // screen background

export default function EditProfileScreen({ navigation }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setName(parsed.name);
      setEmail(parsed.email);
    }
  };

  const saveProfile = async () => {
    const updatedUser = { name, email };

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    Alert.alert("Success", "Profile updated");

    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <Text style={[styles.title, { color: PRIMARY }]}>Edit Profile</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});