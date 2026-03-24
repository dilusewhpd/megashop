import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://localhost:5000";

// Theme
const PRIMARY = "#2e7d32";
const BACKGROUND = "#f4fbf4";
const CARD_BG = "#fff";
const CARD_BORDER = "#c8e6c9";

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderNumber } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Custom Header (like HomeScreen)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Order Details",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerTintColor: "#fff",
    });
  }, [navigation]);

  const loadOrderDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE}/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data.order);
    } catch (err) {
      console.log("ORDER DETAILS ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: BACKGROUND }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: BACKGROUND }]}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  const shippingAddress = order.shipping_address || {};

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: BACKGROUND }]}
    >
      {/* ORDER SUMMARY CARD */}
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <Row label="Order Number" value={order.order_number} />
        <Row label="Status" value={order.status} />
        <Row label="Total" value={`Rs. ${order.total}`} />
        <Row label="Payment Method" value={order.payment_method} />
        <Row
          label="Order Date"
          value={new Date(order.created_at).toDateString()}
        />
      </View>

      {/* SHIPPING ADDRESS */}
      <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>

        <Text style={styles.text}>{shippingAddress.name}</Text>
        <Text style={styles.text}>{shippingAddress.email}</Text>
        <Text style={styles.text}>{shippingAddress.phone}</Text>
        <Text style={styles.text}>{shippingAddress.address}</Text>
      </View>
    </ScrollView>
  );
}

// Reusable Row
function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: PRIMARY,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontWeight: "600",
    color: "#555",
  },

  value: {
    fontWeight: "700",
    color: "#222",
  },

  text: {
    color: "#222",
    marginBottom: 6,
    fontWeight: "500",
  },
});