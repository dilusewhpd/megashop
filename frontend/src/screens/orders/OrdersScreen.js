import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
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
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://192.168.8.167:5000";

// Theme
const PRIMARY = "#2e7d32";
const BACKGROUND = "#f4fbf4";
const BORDER_BLUE = "#c8e6c9";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Header like HomeScreen
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Orders",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerTintColor: "#fff",
      headerRight: () => (
        <Ionicons
          name="refresh"
          size={22}
          color="#fff"
          style={{ marginRight: 12 }}
          onPress={loadOrders}
        />
      ),
    });
  }, [navigation]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const token =
        Platform.OS === "web"
          ? localStorage.getItem("token")
          : await AsyncStorage.getItem("token");

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

  const deleteOrder = async (orderNumber) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token =
              Platform.OS === "web"
                ? localStorage.getItem("token")
                : await AsyncStorage.getItem("token");

            await axios.delete(
              `${API_BASE}/orders/by-number/${orderNumber}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            setOrders((prev) =>
              prev.filter((o) => o.order_number !== orderNumber)
            );

            Alert.alert("Deleted", "Order deleted successfully ✅");
          } catch (err) {
            console.log("DELETE ERROR:", err.response || err.message);
            Alert.alert("Error", "Failed to delete order");
          }
        },
      },
    ]);
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

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <StatusBadge status={item.status} />

            <Pressable
              style={{ marginLeft: 10 }}
              onPress={() => deleteOrder(item.order_number)}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.amount}>Rs. {item.total}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toDateString()}
        </Text>

        <Text style={styles.viewDetails}>View Details</Text>
      </View>
    </Pressable>
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[PRIMARY]}
        />
      }
    />
  );
}

// Status Badge
function StatusBadge({ status }) {
  const isDelivered = status === "DELIVERED";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDelivered ? "#e8f5e9" : "#fef3c7" },
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

  viewDetails: {
    marginTop: 8,
    color: PRIMARY,
    fontWeight: "600",
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