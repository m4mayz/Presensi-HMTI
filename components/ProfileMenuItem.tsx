import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileMenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    isLogout?: boolean;
}

export default function ProfileMenuItem({
    icon,
    iconColor = Colors.blue,
    title,
    subtitle,
    onPress,
    showChevron = true,
    isLogout = false,
}: ProfileMenuItemProps) {
    return (
        <TouchableOpacity
            style={[styles.menuItem, isLogout && styles.logoutItem]}
            onPress={onPress}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>

            {subtitle ? (
                <View style={styles.menuTextContainer}>
                    <Text
                        style={[styles.menuText, isLogout && styles.logoutText]}
                    >
                        {title}
                    </Text>
                    <Text style={styles.menuSubtext}>{subtitle}</Text>
                </View>
            ) : (
                <Text style={[styles.menuText, isLogout && styles.logoutText]}>
                    {title}
                </Text>
            )}

            {showChevron && (
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.bgLight.textColor,
        flex: 1,
    },
    menuSubtext: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    logoutItem: {
        marginBottom: 0,
    },
    logoutText: {
        color: "#EF4444",
    },
});
