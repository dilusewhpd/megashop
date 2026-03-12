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
      headerRight: () => (
        <Ionicons
          name="refresh"
          size={22}
          color="#111"
          style={{ marginRight: 12 }}
          onPress={load}
        />
      ),
    });
  }, [navigation]);

  // Filter products based on search and price
  const filteredProducts = products
    .filter((p) =>
      (p?.name || "").toLowerCase().includes(query.trim().toLowerCase())
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
            source={productImages[imageName] || productImages["placeholder.jpeg"]}
            style={styles.productImageLeft}
          />

          <View style={styles.cardInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Show discount if exists */}
            {discount > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.priceFinal}>Rs. {finalPrice.toFixed(2)}</Text>
                <Text style={styles.priceOriginal}>Rs. {originalPrice.toFixed(2)}</Text>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            ) : (
              <Text style={styles.priceFinal}>Rs. {originalPrice.toFixed(2)}</Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.pill}>
                <Ionicons name="star" size={14} color="#111" />
                <Text style={styles.pillText}>
                  {item.rating ?? "-"} ({item.review_count ?? 0})
                </Text>
              </View>

              <View style={styles.pill}>
                <Ionicons name="cube" size={14} color="#111" />
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
        <Ionicons name="search" size={18} color="#777" style={{ marginRight: 8 }} />
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
          <Chip label="All" active={priceFilter === "ALL"} onPress={() => setPriceFilter("ALL")} />
          <Chip label="Under 2000" active={priceFilter === "LT2000"} onPress={() => setPriceFilter("LT2000")} />
          <Chip label="2000 - 5000" active={priceFilter === "BTW2000_5000"} onPress={() => setPriceFilter("BTW2000_5000")} />
          <Chip label="Above 5000" active={priceFilter === "GT5000"} onPress={() => setPriceFilter("GT5000")} />
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
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// CHIP COMPONENT
function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fafafa",
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginTop: 12, marginBottom: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  productImageLeft: { width: 80, height: 80, resizeMode: "contain", borderRadius: 8 },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800" },
  priceOriginal: { fontSize: 12, fontWeight: "600", color: "#999", textDecorationLine: "line-through" },
  priceFinal: { fontSize: 14, fontWeight: "700", color: "#111" },
  discountText: { fontSize: 12, fontWeight: "700", color: "red" },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "#eee" },
  pillText: { fontWeight: "700", color: "#333", fontSize: 12 },
  chip: { paddingHorizontal: 14, height: 34, justifyContent: "center", borderRadius: 18, borderWidth: 1, borderColor: "#e5e5e5", marginRight: 10, backgroundColor: "#f5f5f5" },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { fontSize: 12, fontWeight: "600", color: "#555" },
  chipTextActive: { color: "#fff" },
  status: { textAlign: "center", marginTop: 20, color: "#555" },
});