import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

function Screen({ title }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "ellipse-outline";

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          if (route.name === "Cart") iconName = focused ? "cart" : "cart-outline";
          if (route.name === "Orders") iconName = focused ? "receipt" : "receipt-outline";
          if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" children={() => <Screen title="Home ✅" />} />
      <Tab.Screen name="Cart" children={() => <Screen title="Cart ✅" />} />
      <Tab.Screen name="Orders" children={() => <Screen title="Orders ✅" />} />
      <Tab.Screen name="Profile" children={() => <Screen title="Profile ✅" />} />
    </Tab.Navigator>
  );
}