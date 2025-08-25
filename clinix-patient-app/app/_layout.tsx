import React, { useEffect } from "react";
import { Slot, SplashScreen } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { Text, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
