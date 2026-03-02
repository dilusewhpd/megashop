import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCartApi } from "../../api/cartApi";

export default function CartScreen({ token }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading...");

  const load = async () => {
    try {
      setStatus("Loading...");
      const res = await getCartApi(token);
      setItems(res.data.cart || []);
      setStatus("");
    } catch (e) {
      setStatus("Failed to load cart");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [items]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>Qty: {item.quantity}</Text>
        <Text style={styles.meta}>Price: Rs. {item.price}</Text>
      </View>
      <Text style={styles.lineTotal}>
        Rs. {Number(item.price) * Number(item.quantity)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>

        <Pressable onPress={load} style={styles.iconBtn}>
          <Ionicons name="refresh" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Items: {items.length}</Text>
        <Text style={styles.summaryText}>Total: Rs. {total}</Text>
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => alert("Next: Checkout")}
        >
          <Text style={styles.primaryText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: { fontSize: 20, fontWeight: "800" },

  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },

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

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontSize: 15, fontWeight: "800" },
  meta: { marginTop: 4, color: "#555" },
  lineTotal: { fontWeight: "900" },

  bottomBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryText: { color: "#fff", fontWeight: "800" },
});