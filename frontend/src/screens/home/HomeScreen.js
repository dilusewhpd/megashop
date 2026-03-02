import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductsApi } from "../../api/productApi";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("ALL");

  const load = async () => {
    try {
      setStatus("Loading...");
      const res = await getProductsApi();
      setProducts(res.data.products || []);
      setStatus("");
    } catch (e) {
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

  // 🔎 Filter Logic
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

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() =>
        navigation.navigate("ProductDetails", { id: item.id })
      }
    >
      <View style={styles.cardTop}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </View>

      <Text style={styles.price}>Rs. {item.price}</Text>

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
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* 🔎 SEARCH BAR */}
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

      {/* 🎯 FILTER CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
      >
        <View style={styles.chipContainer}>
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
        </View>
      </ScrollView>

      {/* 📦 PRODUCT LIST */}
      {status ? (
        <Text style={styles.status}>{status}</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// 🔘 Chip Component
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  // 🔎 Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  // 🎯 Chips
  chipContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },

  chipActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },

  chipTextActive: {
    color: "#fff",
  },

  // 📦 Cards
  card: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    paddingRight: 8,
  },

  price: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

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

  pillText: {
    fontWeight: "700",
    color: "#333",
  },

  status: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
});