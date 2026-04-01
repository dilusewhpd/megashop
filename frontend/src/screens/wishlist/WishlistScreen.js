import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WishlistScreen() {
  const wishlist = []; // later connect backend

  if (!wishlist.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={70} color="#ccc" />
        <Text style={styles.title}>Your Wishlist is Empty</Text>
        <Text style={styles.subtitle}>
          Items you love will appear here 💚
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 5,
    color: "#777",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
  },
});