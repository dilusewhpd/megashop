import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

const API_BASE = "http://localhost:5000"; // change this

export default function CheckoutScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create Order
      const orderRes = await axios.post(
        `${API_BASE}/orders/checkout`,
        {
          paymentMethod: "ONLINE",
        },
        {
          headers: {
            Authorization: "Bearer YOUR_TOKEN",
          },
        }
      );

      const orderNumber = orderRes.data.orderNumber;

      // 2️⃣ Create PayHere Payment
      const payRes = await axios.post(
        `${API_BASE}/payment/create`,
        { orderNumber },
        {
          headers: {
            Authorization: "Bearer YOUR_TOKEN",
          },
        }
      );

      setPaymentData(payRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 If payment created → open PayHere
  if (paymentData) {
    const formBody = `
      <html>
        <body onload="document.forms[0].submit()">
          <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
            ${Object.entries(paymentData)
              .map(
                ([key, value]) =>
                  `<input type="hidden" name="${key}" value="${value}" />`
              )
              .join("")}
          </form>
        </body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={["*"]}
        source={{ html: formBody }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <Pressable style={styles.button} onPress={handleCheckout}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay with PayHere</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#111",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});