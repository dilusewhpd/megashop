import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getOrdersApi } from "../../api/orderApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:5000"; // change to your PC IP if testing on phone 

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token"); // now AsyncStorage works

      const res = await axios.get(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("ORDERS RESPONSE:", res.data);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("LOAD ORDERS ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("OrderDetails", {
          orderNumber: item.order_number,
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.orderId}>Order #{item.order_number}</Text>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.amount}>Rs. {item.total}</Text>

        <Text style={styles.date}>
          {new Date(item.created_at).toDateString()}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
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
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

// 🎯 Status Badge
function StatusBadge({ status }) {
  const isDelivered = status === "DELIVERED";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDelivered ? "#d1fae5" : "#fef3c7" },
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: isDelivered ? "#065f46" : "#92400e",
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
    borderColor: "#f0f0f0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderId: {
    fontWeight: "800",
    fontSize: 15,
  },
  amount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
  },
  date: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
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
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#777",
  },
});
