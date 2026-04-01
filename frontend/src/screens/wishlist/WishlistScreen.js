import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getWishlistApi, removeWishlistApi } from "../../api/wishlistApi";
import { productImages } from "../../utils/imageMapping";

const PRIMARY = "#2e7d32"; // Green header
const BORDER_BLUE = "#c8e6c9";
const BACKGROUND = "#f4fbf4";
const DISCOUNT = "#ef4444";
const INACTIVE = "#999999";

export default function WishlistScreen({ navigation, route }) {
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [refreshing, setRefreshing] = useState(false);

  const loadWishlist = async () => {
    try {
      setStatus("Loading...");
      const token = await AsyncStorage.getItem("token");
      const res = await getWishlistApi(token);
      setWishlist(res.data.wishlist || []);
      setStatus("");
    } catch (err) {
      console.log("Wishlist fetch error:", err);
      setStatus("Failed to load wishlist");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [])
  );

  const handleRemove = async (productId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await removeWishlistApi(productId, token);
      setWishlist((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );

      if (route.params?.updateHomeWishlist) {
        route.params.updateHomeWishlist(productId, false);
      }
    } catch (err) {
      console.log("Remove from wishlist error:", err);
    }
  };

  const renderItem = ({ item }) => {
    const imageName = item.images?.[0] || "placeholder.jpeg";
    const originalPrice = Number(item.price || 0);
    const discount = Number(item.discount || 0);
    const finalPrice = originalPrice - (originalPrice * discount) / 100;

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("Home", {
  screen: "ProductDetails",
  params: { id: item.product_id?.toString() }, // ✅ send id instead of productId
})
        }
        style={styles.card}
      >
        <Image
          source={productImages[imageName] || productImages["placeholder.jpeg"]}
          style={styles.productImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {discount > 0 ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
            >
              <Text style={styles.priceFinal}>Rs. {finalPrice.toFixed(2)}</Text>
              <Text style={styles.priceOriginal}>
                {" "}
                Rs. {originalPrice.toFixed(2)}
              </Text>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          ) : (
            <Text style={[styles.priceFinal, { marginTop: 4 }]}>
              Rs. {originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => handleRemove(item.product_id)}
          style={styles.deleteIcon}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BACKGROUND }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Pressable onPress={loadWishlist} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      {status === "Loading..." ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={70} color="#ccc" />
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyText}>
            Items you love will appear here 💚
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadWishlist();
              }}
              colors={[PRIMARY]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PRIMARY,
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  refreshBtn: {
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    elevation: 3,
  },
  productImage: { width: 90, height: 90, borderRadius: 12 },
  cardInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: "800" },
  priceFinal: { fontWeight: "700", color: PRIMARY },
  priceOriginal: {
    textDecorationLine: "line-through",
    marginLeft: 6,
    color: INACTIVE,
  },
  discountText: {
    color: "#fff",
    backgroundColor: DISCOUNT,
    paddingHorizontal: 6,
    marginLeft: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
  deleteIcon: { marginLeft: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "800", color: "#222" },
  emptyText: { marginTop: 6, color: "#555", textAlign: "center" },
});