// src/screens/home/ProductDetailsScreen.js
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { addWishlistApi } from "../../api/wishlistApi";

const PRIMARY = "#2e7d32";
const LIGHT_GREEN = "#e8f5e9";
const BORDER_GREEN = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    try {
      setStatus("Loading...");

      const res = await getProductByIdApi(id);
      const productData = res.data.product;

      setProduct(productData);

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
    navigation.setOptions({
      title: product?.name || "Product Details",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerTintColor: "#fff",
    });
  }, [navigation, product]);

  /* ---------- PRICE CALCULATION (FIXED) ---------- */

  const originalPrice = useMemo(
    () => (product ? Number(product.original_price || product.price) : 0),
    [product],
  );

  const discount = useMemo(
    () => (product ? Number(product.discount || 0) : 0),
    [product],
  );

  const finalPrice = useMemo(
    () => originalPrice - (originalPrice * discount) / 100,
    [originalPrice, discount],
  );

  const totalPrice = useMemo(
    () => finalPrice * quantity,
    [finalPrice, quantity],
  );

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

  const handleAddToWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Login required", "Please login first");
        return;
      }

      // ✅ Call addWishlistApi with product id and token
      await addWishlistApi(id, token);

      Alert.alert("Success", "Product added to wishlist 💚");
    } catch (error) {
      console.log(
        "Add Wishlist Error:",
        error?.response?.data || error.message,
      );
      Alert.alert("Error", "Failed to add to wishlist");
    }
  };

  if (!product)
    return <Text style={{ padding: 20, textAlign: "center" }}>{status}</Text>;

  const renderRelatedItem = ({ item }) => (
    <Pressable
      style={styles.relatedCard}
      onPress={() => navigation.push("ProductDetails", { id: item.id })}
    >
      <Image
        source={
          productImages[item.images?.[0]] || productImages["placeholder.jpeg"]
        }
        style={styles.relatedImage}
      />
      <Text numberOfLines={1} style={styles.relatedName}>
        {item.name}
      </Text>
      <Text style={styles.relatedPrice}>Rs. {item.price}</Text>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* PRODUCT IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={
            productImages[product.images?.[0]] ||
            productImages["placeholder.jpeg"]
          }
          style={styles.productImage}
        />
      </View>

      {/* PRODUCT NAME */}
      <Text style={styles.name}>{product.name}</Text>

      {/* PRICE + RATING */}
      <View style={styles.row}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.price}>Rs. {totalPrice.toFixed(2)}</Text>

          {discount > 0 && (
            <>
              <Text style={styles.oldPrice}>
                Rs. {(originalPrice * quantity).toFixed(2)}
              </Text>

              <Text style={styles.discountBadge}>-{discount}%</Text>
            </>
          )}
        </View>

        <View style={styles.pill}>
          <Ionicons name="star" size={14} color={PRIMARY} />
          <Text style={styles.pillText}>
            {product.rating ?? "-"} ({product.review ?? 0})
          </Text>
        </View>
      </View>

      {/* PRODUCT INFO */}
      <View style={styles.infoCard}>
        <View style={styles.infoLine}>
          <Ionicons name="cube-outline" size={18} color={PRIMARY} />
          <Text style={styles.infoText}>
            Category: {product.category || "General"}
          </Text>
        </View>

        <View style={styles.infoLine}>
          <Ionicons name="pricetag-outline" size={18} color={PRIMARY} />
          <Text style={styles.infoText}>
            Brand: {product.brand || "MegaShop"}
          </Text>
        </View>

        {product.stock_quantity && (
          <View style={styles.infoLine}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={PRIMARY}
            />
            <Text style={styles.infoText}>Stock: {product.stock_quantity}</Text>
          </View>
        )}
      </View>

      {/* DESCRIPTION */}
      {product.description && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.sectionText}>{product.description}</Text>
        </View>
      )}

      {/* QUANTITY */}
      <View style={styles.quantityRow}>
        <Text style={styles.label}>Quantity</Text>

        <View style={styles.qtyControls}>
          <Pressable
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyText}>-</Text>
          </Pressable>

          <Text style={styles.qtyNumber}>{quantity}</Text>

          <Pressable
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* ADD TO CART */}
      <Pressable style={styles.cartButton} onPress={handleAddToCart}>
        <Ionicons name="cart" size={18} color="#fff" />
        <Text style={styles.cartButtonText}>Add to Cart</Text>
      </Pressable>

      {/* ADD TO WISHLIST */}
      <Pressable
        style={[
          styles.cartButton,
          { backgroundColor: "#2f4f1e", marginTop: 10 },
        ]}
        onPress={handleAddToWishlist}
      >
        <Ionicons name="heart" size={18} color="#fff" />
        <Text style={styles.cartButtonText}>Add to Wishlist</Text>
      </Pressable>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Related Products</Text>

          <FlatList
            horizontal
            data={relatedProducts}
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
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 16,
  },

  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },

  productImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    borderRadius: 14,
    backgroundColor: "#fff",
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    color: "#222",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  price: {
    fontSize: 20,
    fontWeight: "900",
    color: PRIMARY,
  },

  oldPrice: {
    textDecorationLine: "line-through",
    color: "#888",
    fontWeight: "600",
  },

  discountBadge: {
    backgroundColor: "#ef4444",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "700",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f6f6f6",
    borderWidth: 1,
    borderColor: BORDER_GREEN,
  },

  pillText: {
    fontWeight: "700",
    color: "#333",
  },

  infoCard: {
    borderWidth: 1,
    borderColor: BORDER_GREEN,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  infoText: {
    fontWeight: "700",
    color: "#333",
  },

  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  label: {
    fontWeight: "800",
    fontSize: 15,
  },

  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  qtyButton: {
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  qtyText: {
    fontSize: 18,
    fontWeight: "900",
  },

  qtyNumber: {
    fontSize: 16,
    fontWeight: "900",
  },

  cartButton: {
    backgroundColor: PRIMARY,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  cartButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  sectionCard: {
    borderWidth: 1,
    borderColor: BORDER_GREEN,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  sectionTitle: {
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 6,
  },

  sectionText: {
    fontSize: 14,
    color: "#555",
  },

  relatedCard: {
    width: 120,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_GREEN,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "#fff",
  },

  relatedImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  relatedName: {
    fontWeight: "700",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  relatedPrice: {
    fontWeight: "900",
    fontSize: 12,
    color: PRIMARY,
  },
});
