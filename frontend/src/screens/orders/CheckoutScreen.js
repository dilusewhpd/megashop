import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function CheckoutScreen({ navigation }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name || !email || !phone || !address) {
      Alert.alert("Missing Information", "Please fill all delivery details.");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Please login first.");
        return;
      }

      console.log("Creating order...");

      // 1️⃣ CREATE ORDER
      const orderRes = await axios.post(
        `${API_BASE}/orders/checkout`,
        {
          paymentMethod: "ONLINE",
          shippingAddress: {
            name,
            email,
            phone,
            address,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("ORDER RESPONSE:", orderRes.data);
      const orderNumber = orderRes.data.orderNumber;

      // 2️⃣ CREATE PAYHERE PAYMENT
      console.log("Creating payment...");
      const payRes = await axios.post(
        `${API_BASE}/payment/create`,
        { orderNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("PAYHERE DATA:", payRes.data);

      if (!payRes.data) {
        Alert.alert("Payment Error", "Failed to create PayHere payment.");
        return;
      }

      // 3️⃣ REDIRECT TO PAYHERE SANDBOX
      redirectToPayHere(payRes.data);

    } catch (err) {
      console.log("CHECKOUT ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 FUNCTION TO REDIRECT TO PAYHERE SANDBOX
  const redirectToPayHere = (paymentData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Delivery Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Delivery Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Pressable
          style={styles.button}
          onPress={handleCheckout}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Pay with PayHere</Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});