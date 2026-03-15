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

import { productImages } from "../../utils/imageMapping";

const PRIMARY = "#2e7d32"; // green main accent
  const LIGHT_GREEN = "#e8f5e9"; // soft green background for cards/inputs
  const BORDER = "#c8e6c9"; // soft green borders
  const BACKGROUND = "#f4fbf4"; // screen background
  const DISCOUNT = "#ef4444"; // red for discounts
  const INACTIVE = "#999999"; // gray for inactive text

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
      const cartItems = res?.cart || [];

      // Ensure images are arrays
      const parsedItems = cartItems.map((item) => ({
        ...item,
        images:
          typeof item.images === "string"
            ? JSON.parse(item.images)
            : item.images,
      }));

      setItems(parsedItems);
      setStatus("");
    } catch (error) {
      console.log("LOAD CART ERROR:", error?.response?.data || error.message);
      setStatus("Failed to load cart");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, []),
  );
  
  // Total price considering discounts
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.finalPrice || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );

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

  const renderItem = ({ item }) => {
    const imageName = item?.images?.[0] || "placeholder.jpeg";

    return (
      <View style={styles.card}>
        <Image
          source={productImages[imageName] || productImages["placeholder.jpeg"]}
          style={styles.image}
        />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item?.name}</Text>

          {item.discount > 0 ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.priceFinal}>Rs. {item.finalPrice}</Text>
              <Text style={styles.priceOriginal}>
                Rs. {item.original_price}
              </Text>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          ) : (
            <Text style={styles.meta}>Rs. {item.original_price}</Text>
          )}

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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND }}>
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
            contentContainerStyle={{ paddingBottom: 120 }}
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
              navigation.navigate("Checkout", { cartItems: items, total });
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
  title: { fontSize: 20, fontWeight: "800", color: PRIMARY },
  iconBtn: { padding: 6, borderRadius: 20 },
  summary: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: LIGHT_GREEN,
  },
  summaryText: { fontWeight: "700", color: PRIMARY },
  status: { marginBottom: 10, color: "#555" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 12 },
  name: { fontSize: 15, fontWeight: "800" },
  meta: { marginTop: 4, color: "#555" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyText: { color: "#fff", fontWeight: "bold" },
  qtyNumber: { marginHorizontal: 12, fontWeight: "700" },
  bottomBar: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  priceOriginal: {
    fontSize: 12,
    fontWeight: "600",
    color: INACTIVE,
    textDecorationLine: "line-through",
  },
  priceFinal: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: DISCOUNT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});
