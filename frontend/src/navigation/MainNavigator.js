import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/home/HomeScreen";
import ProductDetailsScreen from "../screens/home/ProductDetailsScreen";
import CartScreen from "../screens/cart/CartScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen name="ProductDetails">
         {(props) => <ProductDetailsScreen {...props} token={token} />}
      </Stack.Screen> 
    </Stack.Navigator>
  );
}

export default function MainNavigator({ token, setToken }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // ✅ hides tab header (fixes double header)
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
      <Tab.Screen name="Home">
        {() => <HomeStack token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}