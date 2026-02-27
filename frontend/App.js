import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <NavigationContainer>
      {token ? (
        <MainNavigator token={token} setToken={setToken} />
      ) : (
        <AuthNavigator setToken={setToken} />
      )}
    </NavigationContainer>
  );
}