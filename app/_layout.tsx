import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Keep the splash screen visible while we prepare app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // Hide splash screen after app is ready
        const prepare = async () => {
            try {
                // Add any initialization logic here
                // For now, just add a small delay for smooth transition
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
            }
        };

        prepare();
    }, []);

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="about" />
                <Stack.Screen name="change-password" />
                <Stack.Screen name="create-meeting" />
                <Stack.Screen name="meeting-details/[id]" />
                <Stack.Screen name="edit-meeting/[id]" />
                <Stack.Screen name="add-participants/[id]" />
                <Stack.Screen name="qr-code/[id]" />
                <Stack.Screen name="scan-qr" />
            </Stack>
        </AuthProvider>
    );
}
