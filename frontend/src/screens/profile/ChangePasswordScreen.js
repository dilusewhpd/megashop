import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

const PRIMARY = "#2e7d32";     // main green theme
const CARD_BG = "#fff";         // input background
const BORDER_COLOR = "#c8e6c9"; // border color
const BACKGROUND = "#f4fbf4";  // screen background

export default function ChangePasswordScreen() {

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const changePassword = () => {
    if(password !== confirm){
      Alert.alert("Error","Passwords do not match");
      return;
    }

    Alert.alert("Success","Password changed successfully");
  };

  return(
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <Text style={[styles.title, { color: PRIMARY }]}>Change Password</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#777"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          placeholderTextColor="#777"
        />

        <Pressable style={[styles.button, { backgroundColor: PRIMARY }]} onPress={changePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </Pressable>
      </View>
    </View>
  )
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