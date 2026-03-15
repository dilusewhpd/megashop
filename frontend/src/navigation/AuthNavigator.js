import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();
const PRIMARY = "#2e7d32"; // green header
const HEADER_TEXT = "#fff"; // white text

export default function AuthNavigator({ setToken }) {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: PRIMARY },
        headerTintColor: HEADER_TEXT,
        headerTitleStyle: { fontWeight: "bold" },
      }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} setToken={setToken} />}
      </Stack.Screen>

      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}