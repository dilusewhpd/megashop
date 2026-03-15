import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerApi } from "../../api/authApi"; // if you have an API

const PRIMARY = "#2e7d32";      // main green
const LIGHT_BLUE = "#e8f5e9";    // input background
const BORDER_BLUE = "#c8e6c9";   // input border
const BACKGROUND = "#f4fbf4";    // screen background

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
  if (!name || !email || !password) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  try {

    const res = await registerApi(name, email, password);

    Alert.alert("Success", "Registered successfully!");

    navigation.navigate("Login");

  } catch (err) {
  console.log("REGISTER ERROR:", err.response?.data);

  const errorMsg =
    err?.response?.data?.message || "Registration failed";

  Alert.alert("Error", errorMsg);
}
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: "center",
    backgroundColor: BACKGROUND, // match HomeScreen
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
    color: "#222", // dark professional title
  },
  input: { 
    borderWidth: 1, 
    borderColor: BORDER_BLUE, // match HomeScreen
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    backgroundColor: LIGHT_BLUE, // match HomeScreen
    color: "#222", // text color inside input
  },
  button: { 
    backgroundColor: PRIMARY, // green button
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", // white text on button
    fontWeight: "bold", 
  },
  link: { 
    marginTop: 15, 
    textAlign: "center", 
    color: PRIMARY, // green link similar to HomeScreen theme
    fontWeight: "600",
  },
});