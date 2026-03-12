import React, { useState, useMemo } from "react";
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

export default function CheckoutScreen({ navigation, route }) {
  const { cartItems = [] } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Calculate order summary
  const orderSummary = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const fullPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.original_price || item.price || 0) * Number(item.quantity || 0),
      0
    );

    const totalDiscount = cartItems.reduce((sum, item) => {
      const discount = Number(item.discount || 0);
      const original = Number(item.original_price || item.price || 0);
      const finalPrice = original - (original * discount) / 100;
      return sum + (original - finalPrice) * Number(item.quantity || 0);
    }, 0);

    const finalTotal = cartItems.reduce((sum, item) => {
      const discount = Number(item.discount || 0);
      const original = Number(item.original_price || item.price || 0);
      const finalPrice = original - (original * discount) / 100;
      return sum + finalPrice * Number(item.quantity || 0);
    }, 0);

    return { totalItems, fullPrice, totalDiscount, finalTotal };
  }, [cartItems]);

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

      const orderRes = await axios.post(
        `${API_BASE}/orders/checkout`,
        {
          paymentMethod: "ONLINE",
          shippingAddress: { name, email, phone, address },
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price:
              (item.original_price || item.price) -
              ((item.original_price || item.price) * (item.discount || 0)) / 100,
          })),
          total: orderSummary.finalTotal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderNumber = orderRes.data.orderNumber;

      // CREATE PAYHERE PAYMENT
      const payRes = await axios.post(
        `${API_BASE}/payment/create`,
        { orderNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!payRes.data) {
        Alert.alert("Payment Error", "Failed to create PayHere payment.");
        return;
      }

      // TEMP: mark order as paid (testing)
      await axios.patch(
        `${API_BASE}/orders/${orderNumber}/pay`,
        { status: "Paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // REDIRECT TO PAYHERE
      redirectToPayHere(payRes.data);
    } catch (err) {
      console.log("CHECKOUT ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

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
      style={{ flex: 1, backgroundColor: "#f2f2f7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* ================= Order Summary ================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Total Items</Text>
            <Text>{orderSummary.totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Full Price</Text>
            <Text>Rs. {orderSummary.fullPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Discount</Text>
            <Text style={styles.discount}>- Rs. {orderSummary.totalDiscount}</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: "#ddd", marginTop: 8, paddingTop: 8 }]}>
            <Text style={styles.finalTotal}>Total</Text>
            <Text style={styles.finalTotal}>Rs. {orderSummary.finalTotal}</Text>
          </View>
        </View>

        {/* ================= Delivery Details ================= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>

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

          <Pressable style={styles.button} onPress={handleCheckout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Pay with PayHere</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  discount: { color: "red", fontWeight: "700" },
  finalTotal: { fontSize: 16, fontWeight: "800", color: "#111" },
  input: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});