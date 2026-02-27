import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { getProductByIdApi } from "../../api/productApi";

export default function ProductDetailsScreen({ route }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);

  const load = async () => {
    try {
      const res = await getProductByIdApi(id);
      setProduct(res.data.product);
    } catch (e) {
      console.log("Error loading product");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!product) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>Rs. {product.price}</Text>

      <Pressable style={styles.button}>
        <Text style={{ color: "#fff" }}>Add to Cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  name: { fontSize: 20, fontWeight: "700" },
  price: { marginTop: 10, fontSize: 16 },
  button: {
    marginTop: 20,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});