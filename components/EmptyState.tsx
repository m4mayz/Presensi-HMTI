import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name={icon} size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>{title}</Text>
            {subtitle && <Text style={styles.emptySubtext}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#94A3B8",
        marginTop: 16,
        marginBottom: 4,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#CBD5E1",
        textAlign: "center",
    },
});
