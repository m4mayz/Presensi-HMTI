import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    subtitle?: string;
}

export default function PageHeader({
    title,
    showBackButton = false,
    subtitle,
}: PageHeaderProps) {
    return (
        <View style={styles.header}>
            {showBackButton && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{title}</Text>
                {subtitle && (
                    <Text style={styles.headerSubtitle}>{subtitle}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: Colors.blue,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
});
