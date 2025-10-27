import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ScanPage() {
    return (
        <View style={styles.container}>
            <Ionicons name="qr-code-outline" size={80} color={Colors.blue} />
            <Text style={styles.title}>Scan QR Code</Text>
            <Text style={styles.subtitle}>
                Halaman scan QR code untuk presensi rapat
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
    },
});
