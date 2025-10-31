import PageHeader from "@/components/PageHeader";
import QRScanner from "@/components/QRScanner";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanQRPage() {
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);

    const validateQRCode = (
        data: string
    ): {
        valid: boolean;
        meetingId?: string;
        timestamp?: number;
    } => {
        try {
            const parsed = JSON.parse(data);

            // Check if it's our QR code format
            if (
                !parsed.meetingId ||
                !parsed.timestamp ||
                parsed.type !== "attendance"
            ) {
                return { valid: false };
            }

            // Validate timestamp (must be within current minute)
            const currentTimestamp = Math.floor(Date.now() / 60000);
            const qrTimestamp = parsed.timestamp;

            // Allow QR codes from current minute only
            if (qrTimestamp !== currentTimestamp) {
                return { valid: false };
            }

            return {
                valid: true,
                meetingId: parsed.meetingId,
                timestamp: parsed.timestamp,
            };
        } catch {
            return { valid: false };
        }
    };

    const handleScan = async (data: string) => {
        if (processing) return;

        setProcessing(true);

        try {
            // Validate QR code format and timestamp
            const validation = validateQRCode(data);

            if (!validation.valid || !validation.meetingId) {
                Alert.alert(
                    "QR Code Tidak Valid",
                    "QR Code tidak valid atau sudah kadaluarsa. Pastikan Anda scan QR Code terbaru."
                );
                setProcessing(false);
                return;
            }

            const meetingId = validation.meetingId;

            // Check if meeting exists
            const { data: meeting, error: meetingError } = await supabase
                .from("meetings")
                .select("*")
                .eq("id", meetingId)
                .single();

            if (meetingError || !meeting) {
                Alert.alert("Error", "Rapat tidak ditemukan");
                setProcessing(false);
                return;
            }

            // Check if meeting time is valid
            const meetingStartDateTime = new Date(
                `${meeting.date}T${meeting.start_time}`
            );
            const meetingEndDateTime = new Date(
                `${meeting.date}T${meeting.end_time}`
            );
            const now = new Date();

            // Check if meeting hasn't started yet
            if (now < meetingStartDateTime) {
                Alert.alert(
                    "Rapat Belum Dimulai",
                    "Rapat belum dimulai. Silakan scan QR Code saat rapat sudah dimulai."
                );
                setProcessing(false);
                return;
            }

            // Check if meeting has ended
            if (now > meetingEndDateTime) {
                Alert.alert(
                    "Rapat Telah Berakhir",
                    "Waktu rapat sudah terlewat. Presensi tidak dapat dilakukan."
                );
                setProcessing(false);
                return;
            }

            // Check if user is a participant
            const { data: participant, error: participantError } =
                await supabase
                    .from("meeting_participants")
                    .select("*")
                    .eq("meeting_id", meetingId)
                    .eq("user_id", user?.id || "")
                    .single();

            if (participantError || !participant) {
                Alert.alert(
                    "Bukan Peserta",
                    "Anda bukan peserta rapat ini. Hubungi pembuat rapat jika ini adalah kesalahan."
                );
                setProcessing(false);
                return;
            }

            // Check if already marked attendance
            const { data: existingAttendance } = await supabase
                .from("attendance")
                .select("*")
                .eq("meeting_id", meetingId)
                .eq("user_id", user?.id || "")
                .single();

            if (existingAttendance) {
                Alert.alert(
                    "Sudah Presensi",
                    "Anda sudah melakukan presensi untuk rapat ini.",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                router.push(
                                    `/meeting-details/${meetingId}` as any
                                ),
                        },
                    ]
                );
                setProcessing(false);
                return;
            }

            // Mark attendance
            const { error: attendanceError } = await supabase
                .from("attendance")
                .insert({
                    meeting_id: meetingId,
                    user_id: user?.id,
                    status: "hadir",
                    attendance_time: new Date().toISOString(),
                });

            if (attendanceError) {
                console.error("Error marking attendance:", attendanceError);
                Alert.alert("Error", "Gagal mencatat presensi");
                setProcessing(false);
                return;
            }

            // Success
            Alert.alert(
                "Berhasil!",
                `Presensi Anda untuk rapat "${meeting.title}" telah tercatat.`,
                [
                    {
                        text: "Lihat Detail",
                        onPress: () =>
                            router.push(`/meeting-details/${meetingId}` as any),
                    },
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error("Error processing QR code:", error);
            Alert.alert("Error", "Terjadi kesalahan saat memproses QR Code");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <PageHeader title="Scan QR Code" showBackButton />

            <View style={styles.content}>
                <View style={styles.instructionCard}>
                    <Text style={styles.instructionTitle}>
                        Arahkan kamera ke QR Code
                    </Text>
                    <Text style={styles.instructionText}>
                        Pastikan QR Code terlihat jelas dalam frame kamera
                    </Text>
                </View>

                <View style={styles.scannerContainer}>
                    <QRScanner onScan={handleScan} />
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerFrame} />
                    </View>
                </View>

                {processing && (
                    <View style={styles.processingOverlay}>
                        <View style={styles.processingCard}>
                            <ActivityIndicator
                                size="large"
                                color={Colors.blue}
                            />
                            <Text style={styles.processingText}>
                                Memproses presensi...
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    content: {
        flex: 1,
    },
    instructionCard: {
        backgroundColor: "#EFF6FF",
        padding: 24,
        alignItems: "center",
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.blue,
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
    },
    scannerContainer: {
        flex: 1,
        position: "relative",
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: Colors.blue,
        borderRadius: 20,
        backgroundColor: "transparent",
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    processingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
    },
    processingText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginTop: 16,
    },
});
