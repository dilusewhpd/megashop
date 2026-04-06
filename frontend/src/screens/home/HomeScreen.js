import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductsApi } from "../../api/productApi";
import { productImages, promoImages } from "../../utils/imageMapping";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPromoBannersApi } from "../../api/cartApi";
import { addWishlistApi, removeWishlistApi, getWishlistApi } from "../../api/wishlistApi";
import { useFocusEffect } from "@react-navigation/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PRIMARY = "#2e7d32";
const LIGHT_BLUE = "#e8f5e9";
const BORDER_BLUE = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [availablePromos, setAvailablePromos] = useState([]);

  // Load products and promos
  const load = async () => {
    try {
      setStatus("Loading...");

      const res = await getProductsApi();
      const products = res.data.products || [];

      const parsedProducts = products.map((p) => ({
        ...p,
        images:
          typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      }));

      setProducts(parsedProducts);

      const token = await AsyncStorage.getItem("token");
      const promos = await getPromoBannersApi(token);

      setAvailablePromos(promos || []);
      
      // Refresh wishlist
      const wishRes = await getWishlistApi(token);
      const wishlistIds = wishRes.data.wishlist.map((p) => p.product_id);
      setWishlist(wishlistIds);
      
      setStatus("");
    } catch (e) {
      console.log("LOAD ERROR:", e);
      setStatus("Failed to load products");
    }
  };

  // Refresh wishlist when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshWishlist = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const res = await getWishlistApi(token);
          const productIds = res.data.wishlist.map((p) => p.product_id);
          setWishlist(productIds);
        } catch (err) {
          console.log("Failed to refresh wishlist:", err);
        }
      };

      refreshWishlist();
    }, [])
  );

  // Load wishlist from AsyncStorage
 useEffect(() => {
  const initialize = async () => {
    await load(); // load products and promos

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await getWishlistApi(token);
      const productIds = res.data.wishlist.map((p) => p.product_id);
      setWishlist(productIds); // set wishlisted product IDs
    } catch (err) {
      console.log("Failed to load wishlist:", err);
    }
  };

  initialize();
}, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "MegaShop",
      headerStyle: { backgroundColor: PRIMARY },
      headerTitleStyle: { color: "#fff" },
      headerRight: () => (
        <Ionicons
          name="refresh"
          size={22}
          color="#fff"
          style={{ marginRight: 12 }}
          onPress={load}
        />
      ),
    });
  }, [navigation]);

  // ✅ Wishlist toggle
const toggleWishlist = async (productId) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (wishlist.includes(productId)) {
      // Remove from backend
      await removeWishlistApi(productId, token);
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } else {
      // Add to backend
      await addWishlistApi(productId, token);
      setWishlist((prev) => [...prev, productId]);
    }
  } catch (err) {
    console.log("Wishlist toggle error:", err);
  }
};

  const filteredProducts = products
    .filter((p) =>
      (p?.name || "").toLowerCase().includes(query.trim().toLowerCase())
    )
    .filter((p) => {
      const price = Number(p?.price || 0);
      if (priceFilter === "LT2000") return price < 2000;
      if (priceFilter === "BTW2000_5000")
        return price >= 2000 && price <= 5000;
      if (priceFilter === "GT5000") return price > 5000;
      return true;
    });

  const renderItem = ({ item }) => {
    const imageName = item?.images?.[0] || "placeholder.jpeg";
    const originalPrice = Number(item.original_price || item.price || 0);
    const discount = Number(item.discount || 0);
    const finalPrice = originalPrice - (originalPrice * discount) / 100;
    const isWishlisted = wishlist.includes(item.id);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() =>
          navigation.navigate("ProductDetails", { id: item.id })
        }
      >
        <View style={styles.cardRow}>
          <Image
            source={productImages[imageName] || productImages["placeholder.jpeg"]}
            style={styles.productImageLeft}
          />

          <View style={styles.cardInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {discount > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.priceFinal}>Rs. {finalPrice.toFixed(2)}</Text>
                <Text style={styles.priceOriginal}> Rs. {originalPrice.toFixed(2)}</Text>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            ) : (
              <Text style={styles.priceFinal}>Rs. {originalPrice.toFixed(2)}</Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.pill}>
                <Ionicons name="star" size={14} color={PRIMARY} />
                <Text style={styles.pillText}>
                  {item.rating ?? "-"} ({item.review_count ?? 0})
                </Text>
              </View>

              <View style={styles.pill}>
                <Ionicons name="cube" size={14} color={PRIMARY} />
                <Text style={styles.pillText}>In stock</Text>
              </View>
            </View>
          </View>

          {/* Heart Icon Top-Right */}
          <Pressable
            onPress={() => toggleWishlist(item.id)}
            style={styles.wishlistIcon}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? "red" : "#777"}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* SEARCH + FILTER */}
      <View style={{ backgroundColor: BACKGROUND, zIndex: 1 }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            placeholder="Search products..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterSection}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <Chip label="All" active={priceFilter === "ALL"} onPress={() => setPriceFilter("ALL")} />
          <Chip label="Under 2000" active={priceFilter === "LT2000"} onPress={() => setPriceFilter("LT2000")} />
          <Chip label="2000 - 5000" active={priceFilter === "BTW2000_5000"} onPress={() => setPriceFilter("BTW2000_5000")} />
          <Chip label="Above 5000" active={priceFilter === "GT5000"} onPress={() => setPriceFilter("GT5000")} />
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}

        ListHeaderComponent={
          <>
            {availablePromos.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>🔥 Hot Deals</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  style={{ height: 180 }}
                  contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
                  nestedScrollEnabled={true}
                >
                  {availablePromos.map((item) => (
                    <View key={item.id} style={styles.newPromoCard}>
                      <View style={styles.newPromoLeft}>
                        <Text style={styles.newPromoTitle}>{item.title}</Text>

                        <Text style={styles.newPromoDesc} numberOfLines={2}>
                          {item.description}
                        </Text>

                        <Text style={styles.newPromoCode}>
                          Use Code: {item.code}
                        </Text>

                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            {item.discount_type === "percentage"
                              ? `${item.discount_value}% OFF`
                              : `Rs. ${item.discount_value} OFF`}
                          </Text>
                        </View>
                      </View>

                      <Image
                        source={
                          promoImages[item.image_url] ||
                          promoImages["10-discount"]
                        }
                        style={styles.newPromoImage}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        }

        ListEmptyComponent={
          <Text style={styles.status}>
            {status || "No products found"}
          </Text>
        }
      />
    </View>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    backgroundColor: LIGHT_BLUE,
    elevation: 3,
  },

  searchInput: { flex: 1, marginLeft: 8 },

  filterSection: { marginBottom: 10 },

  chip: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },

  chipActive: { backgroundColor: PRIMARY },

  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
  },

  cardRow: { flexDirection: "row", alignItems: "center" },

  productImageLeft: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  cardInfo: { flex: 1, marginLeft: 15 },

  name: { fontSize: 16, fontWeight: "800" },

  priceFinal: { fontWeight: "700", color: PRIMARY },

  priceOriginal: {
    textDecorationLine: "line-through",
    marginLeft: 6,
  },

  discountText: {
    color: "#fff",
    backgroundColor: "red",
    paddingHorizontal: 6,
    marginLeft: 6,
  },

  metaRow: { flexDirection: "row", marginTop: 8 },

  pill: { flexDirection: "row", marginRight: 10 },

  pillText: { fontSize: 12 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 16,
    marginBottom: 10,
  },

  newPromoCard: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 0.85,
    marginRight: 14,
    borderRadius: 18,
    backgroundColor: LIGHT_BLUE,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER_BLUE,
  },

  newPromoLeft: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },

  newPromoTitle: {
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },

  newPromoDesc: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },

  newPromoCode: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "600",
    marginBottom: 6,
  },

  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  discountBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  newPromoImage: {
    width: 120,
    height: "100%",
    resizeMode: "cover",
  },

  status: { textAlign: "center", marginTop: 20 },

  wishlistIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});