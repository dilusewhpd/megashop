import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/home/HomeScreen";
import ProductDetailsScreen from "../screens/home/ProductDetailsScreen";
import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/orders/CheckoutScreen"; // ✅ Import
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home stack
function HomeStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Home" }} />
      <Stack.Screen name="ProductDetails">
        {(props) => <ProductDetailsScreen {...props} token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Profile stack
function ProfileStack({ setToken }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" options={{ title: "Profile" }}>
        {(props) => <ProfileScreen {...props} setToken={setToken} />}
      </Stack.Screen>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
    </Stack.Navigator>
  );
}

// Cart stack
function CartStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" options={{ title: "Cart" }}>
        {(props) => <CartScreen {...props} token={token} />}
      </Stack.Screen>
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen} 
        options={{ title: "Checkout" }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
export default function MainNavigator({ token, setToken }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
      <Tab.Screen name="Home">{() => <HomeStack token={token} />}</Tab.Screen>
      <Tab.Screen name="Cart">{() => <CartStack token={token} />}</Tab.Screen>
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileStack {...props} setToken={setToken} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}