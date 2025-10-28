import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="profile" />
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
