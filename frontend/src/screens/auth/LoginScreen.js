import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi } from "../../api/authApi";

export default function LoginScreen({ navigation, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage("Logging in...");

      const res = await loginApi(email, password);

      const token = res.data.token;
      const user = res.data.user;

      // ✅ Save token
      await AsyncStorage.setItem("token", token);

      // ✅ Save user
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setToken(token);

      setMessage("Login successful ✅");

    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "Login failed ❌";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MegaShop Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : "Login"}
        </Text>
      </Pressable>

      <Text style={styles.message}>{message}</Text>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f4fbf4", // HomeScreen BACKGROUND
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#222", // HomeScreen dark title color
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8e6c9", // HomeScreen BORDER_BLUE
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#e8f5e9", // HomeScreen LIGHT_BLUE
    color: "#222", // text color for input
  },
  button: {
    backgroundColor: "#2e7d32", // HomeScreen PRIMARY
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff", // white text
    fontWeight: "bold",
  },
  message: {
    marginTop: 15,
    textAlign: "center",
    color: "#555", // similar to HomeScreen text
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#2e7d32", // HomeScreen PRIMARY green
    fontWeight: "600",
  },
});