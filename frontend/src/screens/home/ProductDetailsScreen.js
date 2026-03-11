// src/screens/home/ProductDetailsScreen.js
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Alert,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getProductByIdApi, getRelatedProductsApi } from "../../api/productApi";
import { addToCartApi } from "../../api/cartApi";
import { productImages } from "../../utils/imageMapping";

export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const loadProduct = async () => {
    try {
      setStatus("Loading...");
      const res = await getProductByIdApi(id);
      setProduct(res.data.product);

      // Load related products
      const relatedRes = await getRelatedProductsApi(id);
      setRelatedProducts(relatedRes.data.products || []);

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

  const unitPrice = useMemo(() => (product ? Number(product.price) : 0), [product]);
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

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

  const renderRelatedItem = ({ item }) => (
    <Pressable
      style={styles.relatedCard}
      onPress={() => navigation.push("ProductDetails", { id: item.id })}
    >
      <Image
        source={productImages[item.images?.[0]] || productImages["placeholder.jpeg"]}
        style={styles.relatedImage}
      />
      <Text style={styles.relatedName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.relatedPrice}>Rs. {item.price}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={productImages[product.images?.[0]] || productImages["placeholder.jpeg"]}
          style={styles.productImage}
        />
      </View>

      {/* Product Name */}
      <Text style={styles.name}>{product.name}</Text>

      {/* Price and Rating */}
      <View style={styles.row}>
        <Text style={styles.price}>Rs. {totalPrice}</Text>
        <View style={styles.pill}>
          <Ionicons name="star" size={14} color="#111" />
          <Text style={styles.pillText}>
            {product.rating ?? "-"} ({product.review_count ?? 0})
          </Text>
        </View>
      </View>

      {/* Product Info */}
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

      {/* Color & Size Selection */}
      <View style={styles.selectionCard}>
        <Text style={styles.selectionLabel}>Select Color:</Text>
        <View style={styles.optionsRow}>
          {["Red", "Blue", "Green"].map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.optionPill,
                selectedColor === color && styles.optionPillActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedColor === color && styles.optionTextActive,
                ]}
              >
                {color}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.selectionLabel}>Select Size:</Text>
        <View style={styles.optionsRow}>
          {["S", "M", "L", "XL"].map((size) => (
            <Pressable
              key={size}
              onPress={() => setSelectedSize(size)}
              style={[
                styles.optionPill,
                selectedSize === size && styles.optionPillActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSize === size && styles.optionTextActive,
                ]}
              >
                {size}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quantity Selector */}
      <View style={styles.quantityRow}>
        <Text style={styles.selectionLabel}>Quantity:</Text>
        <View style={styles.qtyControls}>
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.cta}>
        <Button title="Add to Cart" onPress={handleAddToCart} />
      </View>

      {/* Product Description */}
      {product.description && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.sectionText}>{product.description}</Text>
        </View>
      )}

      {/* Special Offers */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <Text style={styles.sectionText}>
          Buy 2 get 1 free! Limited time offer.
        </Text>
      </View>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Related Products</Text>
          <FlatList
            data={relatedProducts}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRelatedItem}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  productImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    borderRadius: 12,
  },

  name: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  price: { fontSize: 18, fontWeight: "900" },
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
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  infoText: { fontWeight: "700", color: "#333" },

  selectionCard: { marginBottom: 18 },
  selectionLabel: { fontWeight: "800", marginBottom: 6 },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f5f5f5",
  },
  optionPillActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  optionText: { color: "#333", fontWeight: "700" },
  optionTextActive: { color: "#fff" },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#111",
  },
  qtyButtonText: { fontWeight: "900", fontSize: 18 },
  qtyText: { fontWeight: "900", fontSize: 16 },

  cta: { marginTop: 10, marginBottom: 20 },
  note: { color: "#666", fontSize: 14 },

  sectionCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  sectionTitle: { fontWeight: "900", fontSize: 16, marginBottom: 6 },
  sectionText: { fontSize: 14, color: "#555" },

  relatedCard: {
    width: 120,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 8,
  },
  relatedImage: { width: 100, height: 100, resizeMode: "contain" },
  relatedName: { fontWeight: "700", fontSize: 12, marginTop: 6, textAlign: "center" },
  relatedPrice: { fontWeight: "900", fontSize: 12, color: "#111" },
});