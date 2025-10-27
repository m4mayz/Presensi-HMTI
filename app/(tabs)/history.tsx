import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Meeting } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface AttendanceRecord {
    meeting: Meeting;
    check_in_time: string;
    status: string;
}

export default function HistoryPage() {
    const { user } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState<
        AttendanceRecord[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from("attendance")
                .select(
                    `
                    *,
                    meeting:meetings(*)
                `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setAttendanceHistory((data as any) || []);
            }
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.blue} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Riwayat Presensi</Text>
                <Text style={styles.headerSubtitle}>
                    Total {attendanceHistory.length} rapat
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>
                                    {record.meeting?.title}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        {record.status === "present"
                                            ? "Hadir"
                                            : "Tidak Hadir"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={16}
                                    color="#64748B"
                                />
                                <Text style={styles.infoText}>
                                    {record.meeting?.date
                                        ? formatDate(record.meeting.date)
                                        : ""}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="location-outline"
                                    size={16}
                                    color="#64748B"
                                />
                                <Text style={styles.infoText}>
                                    {record.meeting?.location ||
                                        "Belum ditentukan"}
                                </Text>
                            </View>

                            <View style={styles.checkInRow}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={Colors.green}
                                />
                                <Text style={styles.checkInText}>
                                    Check-in: {formatTime(record.check_in_time)}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="document-text-outline"
                            size={64}
                            color="#CBD5E1"
                        />
                        <Text style={styles.emptyText}>
                            Belum ada riwayat presensi
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Presensi Anda akan muncul di sini
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
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
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.bgLight.textColor,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748B",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: Colors.green,
        fontWeight: "600",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#64748B",
        marginLeft: 8,
        flex: 1,
    },
    checkInRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    checkInText: {
        fontSize: 13,
        color: Colors.green,
        marginLeft: 8,
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#94A3B8",
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#CBD5E1",
    },
});
