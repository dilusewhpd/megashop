import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:5000"; // change to your PC IP if testing on phone

// Theme colors
const PRIMARY = "#2e7d32";    // green theme
const LIGHT_BLUE = "#e8f5e9";  // light card highlight
const BORDER_BLUE = "#c8e6c9"; // border
const BACKGROUND = "#f4fbf4";  // screen background

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders from API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("LOAD ORDERS ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete order API
  const deleteOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this order?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await axios.delete(`${API_BASE}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Deleted", "Order deleted successfully.");
              loadOrders(); // refresh orders
            },
          },
        ]
      );
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to delete order.");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  // Render each order card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderId}>Order #{item.order_number}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StatusBadge status={item.status} />
          {/* Delete button */}
          <Pressable onPress={() => deleteOrder(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.amount}>Rs. {item.total}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toDateString()}</Text>

      {/* Card pressable to navigate order details */}
      <Pressable
        style={{ marginTop: 8 }}
        onPress={() =>
          navigation.navigate("OrderDetails", {
            orderNumber: item.order_number,
          })
        }
      >
        <Text style={{ color: PRIMARY, fontWeight: "600" }}>View Details</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          Your placed orders will appear here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, backgroundColor: BACKGROUND }}
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
      }
    />
  );
}

// Status Badge component
function StatusBadge({ status }) {
  const isDelivered = status === "DELIVERED";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDelivered ? LIGHT_BLUE : "#fef3c7" },
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: isDelivered ? PRIMARY : "#92400e",
        }}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontWeight: "800",
    fontSize: 15,
    color: "#222",
  },
  amount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },
  date: {
    marginTop: 6,
    fontSize: 13,
    color: "#555",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  emptyText: {
    marginTop: 6,
    color: "#555",
  },
});