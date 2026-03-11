import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:5000"; // change to your PC IP if testing on phone

export default function OrderDetailsScreen({ route }) {
  const { orderNumber } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrderDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE}/orders/${orderNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  const shippingAddress = order.shipping_address || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.card}>
        <Row label="Order Number" value={order.order_number} />
        <Row label="Status" value={order.status} />
        <Row label="Total" value={`Rs. ${order.total}`} />
        <Row label="Payment Method" value={order.payment_method} />
        <Row
          label="Order Date"
          value={new Date(order.created_at).toDateString()}
        />
      </View>

      <Text style={styles.sectionTitle}>Shipping Address</Text>

      <View style={styles.card}>
        <Text>{shippingAddress.name}</Text>
        <Text>{shippingAddress.email}</Text>
        <Text>{shippingAddress.phone}</Text>
        <Text>{shippingAddress.address}</Text>
      </View>
    </ScrollView>
  );
}

// 🎯 Reusable Row Component
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
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});