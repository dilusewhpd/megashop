import React, { useEffect, useState, useLayoutEffect } from "react";
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
import { productImages } from "../../utils/imageMapping";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - CARD_MARGIN * 2) / 2;
const PRIMARY = "#2e7d32";
const LIGHT_BLUE = "#e8f5e9";    
const BORDER_BLUE = "#c8e6c9";
const BACKGROUND = "#f4fbf4";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("ALL");

  const load = async () => {
    try {
      setStatus("Loading...");
      const res = await getProductsApi();
      const products = res.data.products || [];

      const parsedProducts = products.map((p) => ({
        ...p,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      }));

      setProducts(parsedProducts);
      setStatus("");
    } catch (e) {
      console.log("LOAD ERROR:", e);
      setStatus("Failed to load products");
    }
  };

  useEffect(() => {
    load();
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

  // Filter products based on search and price
  const filteredProducts = products
    .filter((p) =>
      (p?.name || "").toLowerCase().includes(query.trim().toLowerCase()),
    )
    .filter((p) => {
      const price = Number(p?.price || 0);
      if (priceFilter === "LT2000") return price < 2000;
      if (priceFilter === "BTW2000_5000") return price >= 2000 && price <= 5000;
      if (priceFilter === "GT5000") return price > 5000;
      return true;
    });

  const renderItem = ({ item }) => {
    const imageName = item?.images?.[0] || "placeholder.jpeg";

    const originalPrice = Number(item.original_price || item.price);
    const discount = Number(item.discount || 0);
    const finalPrice = originalPrice - (originalPrice * discount) / 100;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() => navigation.navigate("ProductDetails", { id: item.id })}
      >
        <View style={styles.cardRow}>
          <Image
            source={
              productImages[imageName] || productImages["placeholder.jpeg"]
            }
            style={styles.productImageLeft}
          />

          <View style={styles.cardInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Show discount if exists */}
            {discount > 0 ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.priceFinal}>
                  Rs. {finalPrice.toFixed(2)}
                </Text>
                <Text style={styles.priceOriginal}>
                  Rs. {originalPrice.toFixed(2)}
                </Text>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            ) : (
              <Text style={styles.priceFinal}>
                Rs. {originalPrice.toFixed(2)}
              </Text>
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
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          color="#777"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* FILTER SECTION */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
          style={{ maxHeight: 50 }}
        >
          <Chip
            label="All"
            active={priceFilter === "ALL"}
            onPress={() => setPriceFilter("ALL")}
          />
          <Chip
            label="Under 2000"
            active={priceFilter === "LT2000"}
            onPress={() => setPriceFilter("LT2000")}
          />
          <Chip
            label="2000 - 5000"
            active={priceFilter === "BTW2000_5000"}
            onPress={() => setPriceFilter("BTW2000_5000")}
          />
          <Chip
            label="Above 5000"
            active={priceFilter === "GT5000"}
            onPress={() => setPriceFilter("GT5000")}
          />
        </ScrollView>
      </View>

      {/* PRODUCTS LIST */}
      {status ? (
        <Text style={styles.status}>{status}</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// CHIP COMPONENT
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
  marginHorizontal: 16,
  marginTop: 12,
  backgroundColor:LIGHT_BLUE,

   // SHADOW for iOS
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },

  // SHADOW for Android
  elevation: 3,
},
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginTop: 12, marginBottom: 16 },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
  },
  cardRow: { flexDirection: "row", alignItems: "center" ,gap: 25},
  productImageLeft: {
    width: 90,
    height: 90,
    resizeMode: "cover ",
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: "#222", marginBottom: 4 },
  priceOriginal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textDecorationLine: "line-through",
  },
  priceFinal: { fontSize: 13, fontWeight: "700", color: PRIMARY },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f6f6f6",
  },
  pillText: { fontWeight: "700", color: "#333", fontSize: 12 },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    marginRight: 10,
    backgroundColor: "#f1f8f1",
  },
  chipActive: { backgroundColor: PRIMARY , borderColor: PRIMARY },
  chipText: { fontSize: 12, fontWeight: "600", color: "#555" },
  chipTextActive: { color: "#fff" },
  status: { textAlign: "center", marginTop: 20, color: "#555" },
});
