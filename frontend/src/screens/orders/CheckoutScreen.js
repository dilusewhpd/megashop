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
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants.js";

const API_BASE = API_BASE_URL;

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
    promoDiscount = 0,
  } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const orderSummary = useMemo(() => {
    let totalItems = 0;

    cartItems.forEach((item) => {
      totalItems += Number(item.quantity || 0);
    });

    const finalTotal = Number(totalFromCart || 0);

    return {
      totalItems,
      fullPrice: finalTotal + Number(promoDiscount || 0),
      promoDiscount: Number(promoDiscount || 0),
      finalTotal: finalTotal,
    };
  }, [cartItems, totalFromCart, promoDiscount]);

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
      }).start(() => setToastMessage(""));
    }, 3000);
  };

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

  const handleCheckout = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) return showToast("Please login first.");

      const orderRes = await axios.post(
        `${API_BASE}/orders/checkout`,
        {
          paymentMethod: "ONLINE",
          shippingAddress: { name, email, phone, address },
          promoCode: route.params.promoCode || null,
          totalAmount: orderSummary.finalTotal,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { orderNumber, total } = orderRes.data;

      const payRes = await axios.post(
        `${API_BASE}/payment/create`,
        { orderNumber, amount: total },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("PAYHERE CREATE RESPONSE:", payRes.data);

      if (!payRes.data) {
        return showToast("Failed to create PayHere payment.");
      }

      redirectToPayHere(payRes.data);
    } catch (err) {
      console.log("CHECKOUT ERROR:", err.response?.data || err.message);
      showToast("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED PAYHERE REDIRECT (MAIN FIX)
 const redirectToPayHere = async (paymentData) => {
  console.log("PAYHERE PAYMENT DATA:", paymentData);

  const query = Object.keys(paymentData)
    .map((key) => {
      const value = paymentData[key];
      const normalized =
        value === true ? "true" : value === false ? "false" : value ?? "";
      return encodeURIComponent(key) + "=" + encodeURIComponent(normalized);
    })
    .join("&");

  const payHereUrl = "https://sandbox.payhere.lk/pay/checkout";

  console.log("PAYHERE FINAL URL:", payHereUrl, query);

  try {
    if (Platform.OS === "web") {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payHereUrl;
      form.target = "_self";
      form.enctype = "application/x-www-form-urlencoded";
      form.style.display = "none";

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value =
          value === true ? "true" : value === false ? "false" : value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      return;
    }

    const url = `${payHereUrl}?${query}`;
    await Linking.openURL(url);
  } catch (err) {
    console.log("PayHere open error:", err);
    showToast("Unable to open PayHere. Please try again or use a browser.");
  }
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

      <ScrollView contentContainerStyle={{ padding: 16 }}>
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

        <View style={styles.summaryRow}>
          <Text style={styles.finalTotal}>Total</Text>
          <Text style={styles.finalTotal}>
            Rs. {orderSummary.finalTotal}
          </Text>
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
          />

          <TextInput
            style={getInputStyle("phone")}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={[getInputStyle("address"), { height: 100 }]}
            placeholder="Delivery Address"
            value={address}
            onChangeText={setAddress}
            multiline
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
    padding: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  discount: {
    color: ERROR_COLOR,
    fontWeight: "700",
  },
  finalTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: PRIMARY,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  toast: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: ERROR_COLOR,
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
  },
});