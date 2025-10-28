import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRCodePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [meetingTitle, setMeetingTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Calculate seconds remaining until next minute
    const getSecondsToNextMinute = () => {
        const now = new Date();
        return 60 - now.getSeconds();
    };

    // Generate QR data with current minute timestamp
    const generateQRData = useCallback(() => {
        const timestamp = Math.floor(Date.now() / 60000); // Current minute
        const data = JSON.stringify({
            meetingId: id,
            timestamp: timestamp,
            type: "attendance",
        });
        setQrData(data);
        setTimeRemaining(getSecondsToNextMinute());
    }, [id]);

    useEffect(() => {
        loadMeetingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        // Generate initial QR code immediately
        generateQRData();

        // Update timer every second
        const timerInterval = setInterval(() => {
            const secondsLeft = getSecondsToNextMinute();
            setTimeRemaining(secondsLeft);

            // Regenerate QR code when minute changes (when secondsLeft is 60)
            if (secondsLeft === 60) {
                const timestamp = Math.floor(Date.now() / 60000);
                const data = JSON.stringify({
                    meetingId: id,
                    timestamp: timestamp,
                    type: "attendance",
                });
                setQrData(data);
            }
        }, 1000); // Update every second

        return () => clearInterval(timerInterval);
    }, [generateQRData, id]);

    const loadMeetingData = async () => {
        try {
            const { data: meeting, error } = await supabase
                .from("meetings")
                .select("title, created_by")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching meeting:", error);
                Alert.alert("Error", "Gagal memuat data rapat");
                return;
            }

            // Verify user is the creator
            if (meeting.created_by !== user?.id) {
                Alert.alert(
                    "Akses Ditolak",
                    "Hanya pembuat rapat yang dapat menampilkan QR Code",
                    [{ text: "OK" }]
                );
                return;
            }

            setMeetingTitle(meeting.title);
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Terjadi kesalahan saat memuat data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <PageHeader title="QR Code Presensi" showBackButton />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.blue} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader title="QR Code Presensi" showBackButton />

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons
                        name="information-circle"
                        size={24}
                        color={Colors.blue}
                    />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>{meetingTitle}</Text>
                        <Text style={styles.infoDescription}>
                            QR Code ini akan berubah setiap 1 menit untuk
                            keamanan
                        </Text>
                    </View>
                </View>

                <View style={styles.qrContainer}>
                    <View style={styles.qrWrapper}>
                        {qrData && (
                            <QRCode
                                value={qrData}
                                size={280}
                                backgroundColor="white"
                                color={Colors.blue}
                            />
                        )}
                    </View>

                    <View style={styles.timerContainer}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color="#64748B"
                        />
                        <Text style={styles.timerText}>
                            Kode berubah dalam {timeRemaining} detik
                        </Text>
                    </View>
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.instructionTitle}>
                        Cara Menggunakan:
                    </Text>
                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>1</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Peserta membuka aplikasi dan masuk ke halaman rapat
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>2</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Klik tombol &#39;Scan QR Code&#39;
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>3</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Arahkan kamera ke QR Code ini
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>4</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Presensi otomatis tercatat jika berhasil
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: "flex-start",
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.blue,
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
    },
    qrContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    qrWrapper: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 8,
    },
    timerText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748B",
    },
    instructionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.bgLight.textColor,
        marginBottom: 16,
    },
    instructionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    instructionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.blue,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    instructionNumberText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff",
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: "#64748B",
        lineHeight: 20,
    },
});
