import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:5000";
const PRIMARY = "#2e7d32";
const BACKGROUND = "#f4fbf4";
const ACTIVE_COLOR = "#e8f5e9";
const BORDER_COLOR = "#c8e6c9";
const ERROR_COLOR = "#ef4444";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CheckoutScreen({ navigation, route }) {
  const {
    cartItems = [],
    total: totalFromCart = 0,
    promoDiscount = 0, // 🔹 receive promo discount from CartScreen
  } = route.params; // 🔹 receive final total from CartScreen

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Order summary
  const orderSummary = useMemo(() => {
    let totalItems = 0;

    cartItems.forEach((item) => {
      totalItems += Number(item.quantity || 0);
    });

    const finalTotal = Number(totalFromCart || 0);

    return {
      totalItems,
      fullPrice: finalTotal + Number(promoDiscount || 0), // ✅ key fix
      promoDiscount: Number(promoDiscount || 0),
      finalTotal: finalTotal,
    };
  }, [cartItems, totalFromCart, promoDiscount]);

  // Show toast at top for 3s
  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage("");
      });
    }, 3000);
  };

  // Validation
  const validate = () => {
    const tName = name.trim(),
      tEmail = email.trim(),
      tPhone = phone.trim(),
      tAddress = address.trim();

    if (!tName) return showToast("Please enter your full name.") || false;
    if (!tEmail) return showToast("Please enter your email.") || false;
    if (!tPhone) return showToast("Please enter your phone number.") || false;
    if (tPhone.replace(/\D/g, "").length !== 10)
      return showToast("Phone number must be exactly 10 digits.") || false;
    if (!tAddress)
      return showToast("Please enter your delivery address.") || false;

    return true;
  };

  // Checkout
  const handleCheckout = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return showToast("Please login first.") || false;

      // Send promoCode instead of totalAmount
      // After checkout
      // 🔹 send final total along with promoCode
const orderRes = await axios.post(
  `${API_BASE}/orders/checkout`,
  {
    paymentMethod: "ONLINE",
    shippingAddress: { name, email, phone, address },
    promoCode: route.params.promoCode || null,
    totalAmount: orderSummary.finalTotal, // 🔹 pass final total
  },
  { headers: { Authorization: `Bearer ${token}` } },
);

      const { orderNumber, total } = orderRes.data;

      // Send total to backend payment creation
      const payRes = await axios.post(
        `${API_BASE}/payment/create`,
        { orderNumber, amount: total }, // 🔹 pass total
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!payRes.data)
        return showToast("Failed to create PayHere payment.") || false;

      await axios.patch(
        `${API_BASE}/orders/${orderNumber}/pay`,
        { status: "Paid" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      redirectToPayHere(payRes.data);
    } catch (err) {
      console.log("CHECKOUT ERROR:", err.response?.data || err.message);
      showToast("Checkout failed. Please try again.");
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

  const getInputStyle = (field) => ({
    ...styles.input,
    backgroundColor: focusedField === field ? ACTIVE_COLOR : "#fff",
    borderColor: focusedField === field ? PRIMARY : BORDER_COLOR,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BACKGROUND }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {toastMessage ? (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
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
          {orderSummary.promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Promo Discount</Text>
              <Text style={styles.discount}>
                - Rs. {orderSummary.promoDiscount}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.summaryRow,
            {
              borderTopWidth: 1,
              borderTopColor: BORDER_COLOR,
              marginTop: 8,
              paddingTop: 8,
            },
          ]}
        >
          <Text style={styles.finalTotal}>Total</Text>
          <Text style={styles.finalTotal}>Rs. {orderSummary.finalTotal}</Text>
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <TextInput
            style={getInputStyle("name")}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField("")}
          />
          <TextInput
            style={getInputStyle("email")}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField("")}
          />
          <TextInput
            style={getInputStyle("phone")}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField("")}
          />
          <TextInput
            style={[getInputStyle("address"), { height: 100 }]}
            placeholder="Delivery Address"
            value={address}
            onChangeText={setAddress}
            multiline
            onFocus={() => setFocusedField("address")}
            onBlur={() => setFocusedField("")}
          />
          <Pressable
            style={styles.button}
            onPress={handleCheckout}
            disabled={loading}
          >
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: PRIMARY,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  discount: { color: ERROR_COLOR, fontWeight: "700" },
  finalTotal: { fontSize: 16, fontWeight: "800", color: PRIMARY },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  toast: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: ERROR_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 999,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
  },
  toastText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
