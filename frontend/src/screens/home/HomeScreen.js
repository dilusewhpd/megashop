import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from "react";
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
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductsApi, getCategoriesApi } from "../../api/productApi";
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
  const [availablePromos, setAvailablePromos] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    sortBy: "newest",
    category: "all",
    minRating: "all",
    priceRange: "all"
  });
  const [categories, setCategories] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load products and promos
  const load = async () => {
    try {
      setStatus("Loading...");

      const res = await getProductsApi(filters);
      const products = res.data.products || [];

      //product formating
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

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await getCategoriesApi();
      setCategories(res.data.categories || []);
    } catch (e) {
      console.log("LOAD CATEGORIES ERROR:", e);
    }
  };

  // Reload products when filters change
  useEffect(() => {
    load();
  }, [filters]);

  // Load wishlist from AsyncStorage
 useEffect(() => {
  const initialize = async () => {
    await load(); // load products and promos
    await loadCategories(); // load categories

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

  // ✅ Refresh wishlist when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      const refreshWishlist = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const res = await getWishlistApi(token);
          const wishlistIds = res.data.wishlist.map((p) => p.product_id);
          setWishlist(wishlistIds);
        } catch (err) {
          console.log("Failed to refresh wishlist:", err);
        }
      };

      refreshWishlist();
    }, [])
  );

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

  const filteredProducts = products.filter((p) =>
    (p?.name || "").toLowerCase().includes(query.trim().toLowerCase())
  );

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
                  {item.rating ?? "-"} ({item.review ?? 0})
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
      {/* SEARCH + FILTER BUTTON */}
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

        {/* Filter Button */}
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={18} color="#777" />
          <Text style={styles.filterButtonText}>Filter by...</Text>
          <Ionicons name="chevron-down" size={16} color="#777" />
        </Pressable>
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

            {/* All Products Header */}
            <Text style={styles.allProductsHeader}>All Products</Text>
          </>
        }

        ListEmptyComponent={
          <Text style={styles.status}>
            {status || "No products found"}
          </Text>
        }
      />

      {/* FILTER MODAL */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Products</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Sort By Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { label: "Newest", value: "newest" },
                    { label: "Price: Low to High", value: "price_low_to_high" },
                    { label: "Price: High to Low", value: "price_high_to_low" },
                    { label: "Most Popular", value: "most_popular" },
                    { label: "Most Sold", value: "most_sold" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        filters.sortBy === option.value && styles.optionButtonActive,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.sortBy === option.value && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      filters.category === "all" && styles.optionButtonActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, category: "all" }))}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.category === "all" && styles.optionTextActive,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.optionButton,
                        filters.category === category && styles.optionButtonActive,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, category }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.category === category && styles.optionTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Minimum Rating</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { label: "All Ratings", value: "all" },
                    { label: "4+ Stars", value: "4" },
                    { label: "3+ Stars", value: "3" },
                    { label: "2+ Stars", value: "2" },
                    { label: "1+ Stars", value: "1" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        filters.minRating === option.value && styles.optionButtonActive,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, minRating: option.value }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.minRating === option.value && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Price Range</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { label: "All Prices", value: "all" },
                    { label: "Under Rs. 1000", value: "under_1000" },
                    { label: "Rs. 1000 - 2000", value: "1000_2000" },
                    { label: "Rs. 2000 - 5000", value: "2000_5000" },
                    { label: "Rs. 5000 - 10000", value: "5000_10000" },
                    { label: "Above Rs. 10000", value: "above_10000" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        filters.priceRange === option.value && styles.optionButtonActive,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, priceRange: option.value }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.priceRange === option.value && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setFilters({
                    sortBy: "newest",
                    category: "all",
                    minRating: "all",
                    priceRange: "all"
                  });
                }}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    elevation: 2,
  },

  filterButtonText: {
    fontSize: 14,
    color: "#333",
    marginHorizontal: 8,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  closeButton: {
    padding: 5,
  },

  modalBody: {
    padding: 20,
  },

  filterSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },

  optionButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  optionText: {
    fontSize: 14,
    color: "#666",
  },

  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  clearButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },

  applyButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  applyButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },

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

  allProductsHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 16,
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