import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace("/(tabs)/home");
            } else {
                router.replace("/(auth)/login");
            }
        }
    }, [user, loading]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#C7D2FE",
    },
});
