import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  getCartApi,
  updateCartItemApi,
  deleteCartItemApi,
  clearCartApi,
  applyPromoApi,
} from "../../api/cartApi";

import { productImages } from "../../utils/imageMapping";

const PRIMARY = "#2e7d32";
const LIGHT_GREEN = "#e8f5e9";
const BORDER = "#c8e6c9";
const BACKGROUND = "#f4fbf4";
const DISCOUNT = "#ef4444";
const INACTIVE = "#999999";

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  const load = async () => {
    setStatus("Loading...");

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setStatus("Please login first");
        return;
      }

      const res = await getCartApi(token);

      const cartItems = res?.cart || [];

      const parsedItems = cartItems.map((item) => ({
        ...item,
        images:
          typeof item.images === "string"
            ? JSON.parse(item.images)
            : item.images,
      }));

      setItems(parsedItems);
      setStatus("");

      setDiscount(0);
      setNewTotal(0);
      setPromoCode("");
    } catch (error) {
      setStatus("Failed to load cart");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = discount > 0 ? item.original_price : item.finalPrice;
        return sum + price * Number(item.quantity || 0);
      }, 0),
    [items, discount]
  );

  const finalTotal = discount > 0 ? newTotal : total;

  const changeQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await updateCartItemApi(item.id, newQty, token);
      load();
    } catch (error) {
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const deleteItem = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await deleteCartItemApi(item.id, token);
      load();
    } catch (error) {
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const clearCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await clearCartApi(token);
      load();
    } catch (error) {
      Alert.alert("Error", "Failed to clear cart");
    }
  };

  const applyPromo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!promoCode.trim()) {
        Alert.alert("Enter promo code");
        return;
      }

      const data = await applyPromoApi(promoCode.trim(), token);

      if (data.success) {
        setDiscount(Number(data.discountAmount));
        setNewTotal(Number(data.newTotal));
        Alert.alert("Promo applied!", `Discount: Rs. ${data.discountAmount}`);
      } else {
        setDiscount(0);
        setNewTotal(total);
        Alert.alert("Error", data.message || "Invalid promo code");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to apply promo code");
    }
  };

  const renderItem = ({ item }) => {
    const imageName = item?.images?.[0] || "placeholder.jpeg";
    const displayPrice = discount > 0 ? item.original_price : item.finalPrice;

    return (
      <View style={styles.card}>
        <Image
          source={productImages[imageName] || productImages["placeholder.jpeg"]}
          style={styles.image}
        />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item?.name}</Text>

          {discount > 0 ? (
            <Text style={styles.meta}>Rs. {displayPrice}</Text>
          ) : item.discount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.priceFinal}>Rs. {item.finalPrice}</Text>
              <Text style={styles.priceOriginal}>Rs. {item.original_price}</Text>
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

      {/* ✅ Compact Professional Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>

        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={load} style={styles.iconBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </Pressable>

          <Pressable onPress={clearCart} style={styles.iconBtn}>
            <Ionicons name="trash" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 14 }}>

        {/* Promo Input */}
        <View style={{ flexDirection: "row", marginBottom: 12, gap: 10 }}>
          <TextInput
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            style={styles.input}
          />

          <Pressable onPress={applyPromo} style={styles.applyBtn}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Items: {items.length}</Text>

          {discount > 0 && (
            <Text style={[styles.summaryText, { color: DISCOUNT }]}>
              Discount: Rs. {discount.toFixed(2)}
            </Text>
          )}

          <Text style={styles.summaryText}>
            Total: Rs. {finalTotal.toFixed(2)}
          </Text>
        </View>

        {status ? <Text style={styles.status}>{status}</Text> : null}

        {items.length === 0 && !status ? (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </ScrollView>

      {/* Bottom Checkout */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            if (items.length === 0) {
              Alert.alert("Cart is empty");
            } else {
              navigation.navigate("Checkout", {
                cartItems: items,
                total: finalTotal,
              });
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
    backgroundColor: PRIMARY,
    height: 60,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  iconBtn: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  applyBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },

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

  summaryText: {
    fontWeight: "700",
    color: PRIMARY,
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

  primaryText: {
    color: "#fff",
    fontWeight: "800",
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

  status: {
    marginBottom: 10,
    color: "#555",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});