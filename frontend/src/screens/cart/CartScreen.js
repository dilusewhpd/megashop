import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  getCartApi,
  updateCartItemApi,
  deleteCartItemApi,
  clearCartApi,
} from "../../api/cartApi";

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading...");

  const load = async () => {
    try {
      setStatus("Loading...");
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setStatus("Please login first");
        return;
      }

      const res = await getCartApi(token);
      setItems(res?.cart || []);
      setStatus("");
    } catch (error) {
      console.log("LOAD CART ERROR:", error?.response?.data || error.message);
      setStatus("Failed to load cart");
    }
  };

  // Reload cart whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item?.price || 0) * Number(item?.quantity || 0),
      0
    );
  }, [items]);

  const changeQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await updateCartItemApi(item.id, newQty, token);
      load();
    } catch (error) {
      console.log("UPDATE ERROR:", error?.response?.data);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const deleteItem = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await deleteCartItemApi(item.id, token);
      load();
    } catch (error) {
      console.log("DELETE ERROR:", error?.response?.data);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const clearCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await clearCartApi(token);
      load();
    } catch (error) {
      console.log("CLEAR ERROR:", error?.response?.data);
      Alert.alert("Error", "Failed to clear cart");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item?.images ? (
        <Image source={{ uri: item.images }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{item?.name}</Text>
        <Text style={styles.meta}>Rs. {item?.price}</Text>

        <View style={styles.qtyRow}>
          <Pressable
            style={styles.qtyBtn}
            onPress={() => changeQuantity(item, item.quantity - 1)}
          >
            <Text style={styles.qtyText}>-</Text>
          </Pressable>

          <Text style={styles.qtyNumber}>{item?.quantity}</Text>

          <Pressable
            style={styles.qtyBtn}
            onPress={() => changeQuantity(item, item.quantity + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => deleteItem(item)}>
        <Ionicons name="trash-outline" size={22} color="red" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ flex: 1, padding: 14 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Cart</Text>

          <View style={{ flexDirection: "row" }}>
            <Pressable onPress={load} style={styles.iconBtn}>
              <Ionicons name="refresh" size={22} color="#111" />
            </Pressable>

            <Pressable onPress={clearCart} style={styles.iconBtn}>
              <Ionicons name="trash" size={22} color="red" />
            </Pressable>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Items: {items.length}</Text>
          <Text style={styles.summaryText}>Total: Rs. {total}</Text>
        </View>

        {status ? <Text style={styles.status}>{status}</Text> : null}

        {items.length === 0 && !status ? (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }} // space for button
          />
        )}
      </View>

      {/* Bottom Checkout Button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            if (items.length === 0) {
              Alert.alert("Cart is empty", "Please add items before checkout.");
            } else {
              navigation.navigate("Checkout", { cartItems: items, total }); // pass data
            }
          }}
        >
          <Text style={styles.primaryText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "800" },
  iconBtn: { padding: 6, borderRadius: 20 },
  summary: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryText: { fontWeight: "700" },
  status: { marginBottom: 10, color: "#555" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#888" },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: { width: 70, height: 70, borderRadius: 12 },
  imagePlaceholder: { backgroundColor: "#eee" },
  name: { fontSize: 15, fontWeight: "800" },
  meta: { marginTop: 4, color: "#555" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: { backgroundColor: "#111", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  qtyText: { color: "#fff", fontWeight: "bold" },
  qtyNumber: { marginHorizontal: 12, fontWeight: "700" },
  bottomBar: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});