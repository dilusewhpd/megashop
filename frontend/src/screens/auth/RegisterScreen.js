import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { registerApi } from "../../api/authApi";

const PRIMARY = "#2e7d32";
const LIGHT_BLUE = "#e8f5e9";
const BORDER_BLUE = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!email.includes("@")) newErrors.email = "Invalid email";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);

    // stop if there are errors
    if (Object.keys(newErrors).length > 0) return;

    try {
      await registerApi(name.trim(), email.trim(), password.trim());
      navigation.navigate("Login");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Registration failed";
      setErrors({ general: errorMsg });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}

      {/* NAME FIELD */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* EMAIL FIELD */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* PASSWORD FIELD */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* REGISTER BUTTON */}
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      {/* LOGIN LINK */}
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: BACKGROUND,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#222",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    padding: 14,
    borderRadius: 10,
    backgroundColor: LIGHT_BLUE,
    fontSize: 16,
    color: "#222",
  },
  button: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 15,
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 13,
  },
  generalError: {
    color: "red",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "center",
  },
});