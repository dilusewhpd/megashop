import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductByIdApi } from "../../api/productApi";
import { addToCartApi } from "../../api/cartApi";

export default function ProductDetailsScreen({ route, navigation, token }) {
  const { id } = route.params;

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("Loading...");

  const load = async () => {
    try {
      setStatus("Loading...");
      const res = await getProductByIdApi(id);
      setProduct(res.data.product);
      setStatus("");
    } catch (e) {
      setStatus("Failed to load product");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Set header title professionally
  useLayoutEffect(() => {
    if (product?.name) {
      navigation.setOptions({ title: product.name });
    } else {
      navigation.setOptions({ title: "Product Details" });
    }
  }, [navigation, product]);

  const price = useMemo(() => (product ? Number(product.price) : 0), [product]);

  const handleAddToCart = async () => {
    try {
      await addToCartApi(id, token);
      alert("Added to cart ✅");
    } catch (e) {
      alert(JSON.stringify(e?.response?.data || e.message));
    }
  };

  // Loading state
  if (!product) {
    return <Text style={{ padding: 20 }}>{status}</Text>;
  }

  // ✅ compute after product exists (prevents crash)
  const brandText = product.brand || product.seller || "MegaShop";
  const stockText =
    product.stock_quantity !== undefined && product.stock_quantity !== null
      ? String(product.stock_quantity)
      : null;

  return (
    <View style={styles.container}>
      {/* Optional: remove this if you only want header title */}
      <Text style={styles.name}>{product.name}</Text>

      <View style={styles.row}>
        <Text style={styles.price}>Rs. {price}</Text>

        <View style={styles.pill}>
          <Ionicons name="star" size={14} color="#111" />
          <Text style={styles.pillText}>
            {product.rating ?? "-"} ({product.review_count ?? 0})
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        {product.category ? (
          <View style={styles.infoLine}>
            <Ionicons name="cube-outline" size={18} color="#333" />
            <Text style={styles.infoText}>Category: {product.category}</Text>
          </View>
        ) : null}

        <View style={styles.infoLine}>
          <Ionicons name="pricetag-outline" size={18} color="#333" />
          <Text style={styles.infoText}>Brand: {brandText}</Text>
        </View>

        {stockText ? (
          <View style={styles.infoLine}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#333" />
            <Text style={styles.infoText}>Stock: {stockText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cta}>
        <Button title="Add to Cart" onPress={handleAddToCart} />
      </View>

      <Text style={styles.note}>
        (Next we can add color/size selection and quantity.)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  name: { fontSize: 20, fontWeight: "900" },

  row: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 16, fontWeight: "900" },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pillText: { fontWeight: "800", color: "#333" },

  infoCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  infoLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontWeight: "700", color: "#333" },

  cta: { marginTop: 18 },
  note: { marginTop: 12, color: "#666" },
});