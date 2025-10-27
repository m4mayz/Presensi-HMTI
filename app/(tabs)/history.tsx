import EmptyState from "@/components/EmptyState";
import MeetingCard from "@/components/MeetingCard";
import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Meeting } from "@/types/database.types";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

interface AttendanceRecord {
    id: string;
    meeting: Meeting;
    check_in_time: string;
    status: string;
    created_at: string;
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

    const formatAttendanceDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
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
            <PageHeader title="Riwayat Presensi" showBackButton />

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
                    attendanceHistory.map((record) => (
                        <MeetingCard
                            key={record.id}
                            meeting={record.meeting}
                            showAttendanceInfo
                            attendanceDate={formatAttendanceDate(
                                record.created_at
                            )}
                        />
                    ))
                ) : (
                    <EmptyState
                        icon="document-text-outline"
                        title="Belum ada riwayat presensi"
                        subtitle="Presensi Anda akan muncul di sini"
                    />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.blue,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
});
