import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QRScannerProps {
    onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer} edges={["top"]}>
                <View style={styles.permissionContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="camera-outline"
                            size={80}
                            color={Colors.blue}
                        />
                    </View>
                    <Text style={styles.permissionTitle}>
                        Akses Kamera Diperlukan
                    </Text>
                    <Text style={styles.permissionMessage}>
                        Aplikasi memerlukan izin akses kamera untuk memindai QR
                        Code presensi rapat
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Ionicons
                            name="camera"
                            size={20}
                            color="#FFFFFF"
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.permissionButtonText}>
                            Izinkan Akses Kamera
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;

        setScanned(true);
        onScan(data);

        // Reset after 2 seconds
        setTimeout(() => {
            setScanned(false);
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    permissionContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 12,
        textAlign: "center",
    },
    permissionMessage: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    permissionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.button.enable,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 2,
        shadowColor: Colors.blue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    permissionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    camera: {
        flex: 1,
    },
});
