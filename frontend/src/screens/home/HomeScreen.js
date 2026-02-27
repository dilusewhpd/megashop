import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { getProductsApi } from "../../api/productApi";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Loading...");

  const load = async () => {
    try {
      setStatus("Loading...");
      const res = await getProductsApi();
      setProducts(res.data.products || []);
      setStatus("");
    } catch (e) {
      setStatus("Failed to load products");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetails", { id: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>Rs. {item.price}</Text>
      <Text style={styles.meta}>
        ⭐ {item.rating ?? "-"} • Reviews {item.review_count ?? 0}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {status ? <Text style={styles.status}>{status}</Text> : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, gap: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  status: { padding: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
  },
  name: { fontSize: 16, fontWeight: "700" },
  price: { marginTop: 4, fontSize: 14, fontWeight: "600" },
  meta: { marginTop: 6, color: "#555" },
});