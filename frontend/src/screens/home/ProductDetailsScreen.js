import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Button, Image, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getProductByIdApi } from "../../api/productApi";
import { addToCartApi } from "../../api/cartApi";

export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("Loading...");

  const loadProduct = async () => {
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
    loadProduct();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ title: product?.name || "Product Details" });
  }, [navigation, product]);

  const price = useMemo(() => (product ? Number(product.price) : 0), [product]);

  const handleAddToCart = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Login required", "Please login first");
      return;
    }

    await addToCartApi(id, token);

    Alert.alert("Success", "Product added to cart 🛒");

  } catch (error) {
    console.log("ADD CART ERROR:", error?.response?.data || error.message);
    Alert.alert("Error", "Failed to add product");
  }
};

  if (!product)
    return <Text style={{ padding: 20, textAlign: "center" }}>{status}</Text>;

  const brandText = product.brand || product.seller || "MegaShop";
  const stockText =
    product.stock_quantity !== undefined && product.stock_quantity !== null
      ? String(product.stock_quantity)
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Product Image */}
      {product.images && (
        <Image
          source={{ uri: product.images }}
          style={styles.productImage}
          resizeMode="contain"
        />
      )}

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
        {product.category && (
          <View style={styles.infoLine}>
            <Ionicons name="cube-outline" size={18} color="#333" />
            <Text style={styles.infoText}>Category: {product.category}</Text>
          </View>
        )}

        <View style={styles.infoLine}>
          <Ionicons name="pricetag-outline" size={18} color="#333" />
          <Text style={styles.infoText}>Brand: {brandText}</Text>
        </View>

        {stockText && (
          <View style={styles.infoLine}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#333" />
            <Text style={styles.infoText}>Stock: {stockText}</Text>
          </View>
        )}
      </View>

      {/* Add to Cart Button */}
      <View style={styles.cta}>
        <Button title="Add to Cart" onPress={handleAddToCart} />
      </View>

      <Text style={styles.note}>(Next we can add color/size selection and quantity.)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  productImage: { width: "100%", height: 250, borderRadius: 12, marginBottom: 16, alignSelf: "center" },
  name: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  price: { fontSize: 18, fontWeight: "900" },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#eee" },
  pillText: { fontWeight: "800", color: "#333" },
  infoCard: { borderWidth: 1, borderColor: "#eee", borderRadius: 16, padding: 14, marginBottom: 18 },
  infoLine: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  infoText: { fontWeight: "700", color: "#333" },
  cta: { marginTop: 10, marginBottom: 20 },
  note: { color: "#666", fontSize: 14 },
});