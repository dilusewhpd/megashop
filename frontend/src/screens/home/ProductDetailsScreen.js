import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet , Button } from "react-native";
import { getProductByIdApi } from "../../api/productApi";
import { addToCartApi } from "../../api/cartApi";

export default function ProductDetailsScreen({ route , token }) {
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

  const handleAddToCart = async () => {
  try {
    await addToCartApi(id, token);
    alert("Added to cart ✅");
  } catch (e) {
    alert("Failed to add to cart");
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

      <View style={{ marginTop: 20 }}>
        <Button title="Add to Cart" onPress={handleAddToCart} color="#111" />
      </View>
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