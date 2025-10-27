import Colors from "@/constants/Colors";
import { FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.blue,
                tabBarInactiveTintColor: "#94A3B8",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    height: 75 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F1F5F9",
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 0,
                },
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabItem}>
                            <Octicons
                                name={focused ? "home-fill" : "home"}
                                size={26}
                                color={color}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: "",
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.scanButtonContainer}>
                            <View
                                style={[
                                    styles.scanButton,
                                    focused && styles.scanButtonActive,
                                ]}
                            >
                                <Ionicons
                                    name={focused ? "camera" : "camera-outline"}
                                    size={24}
                                    color="#fff"
                                />
                            </View>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabItem}>
                            <FontAwesome5
                                name={focused ? "history" : "history"}
                                size={26}
                                color={color}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    scanButtonContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    scanButton: {
        width: 56,
        height: 56,
        borderRadius: 32.5,
        backgroundColor: Colors.blue,
        justifyContent: "center",
        alignItems: "center",
        elevation: 12,
        shadowColor: Colors.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        borderColor: "#fff",
        borderWidth: 2,
    },
    scanButtonActive: {
        backgroundColor: "#0D5BD8",
        transform: [{ scale: 0.9 }],
    },
});
