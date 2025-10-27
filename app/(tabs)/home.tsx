import EmptyState from "@/components/EmptyState";
import MeetingCard from "@/components/MeetingCard";
import UpcomingMeetingCard from "@/components/UpcomingMeetingCard";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Attendance, Meeting } from "@/types/database.types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface MeetingWithAttendance extends Meeting {
    attendance?: Attendance[];
}

export default function HomePage() {
    const { user } = useAuth();
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [attendanceHistory, setAttendanceHistory] = useState<
        MeetingWithAttendance[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            await Promise.all([
                fetchUpcomingMeetings(),
                fetchAttendanceHistory(),
            ]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const fetchUpcomingMeetings = async () => {
        if (!user?.id) return;

        const today = new Date().toISOString().split("T")[0];

        // First, get meeting IDs where user is a participant
        const { data: participantData, error: participantError } =
            await supabase
                .from("meeting_participants")
                .select("meeting_id")
                .eq("user_id", user.id);

        if (participantError) {
            console.error("Error fetching participants:", participantError);
            return;
        }

        // Extract meeting IDs
        const meetingIds =
            participantData
                ?.map((item) => item.meeting_id)
                .filter((id): id is string => id !== null) || [];

        if (meetingIds.length === 0) {
            setUpcomingMeetings([]);
            return;
        }

        // Fetch meetings where user is a participant
        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .in("id", meetingIds)
            .gte("date", today)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true })
            .limit(3);

        if (error) {
            console.error("Error fetching meetings:", error);
        } else {
            setUpcomingMeetings(data || []);
        }
    };

    const fetchAttendanceHistory = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from("attendance")
            .select(
                `
                *,
                meeting:meetings(*)
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (error) {
            console.error("Error fetching attendance:", error);
        } else {
            setAttendanceHistory((data as any) || []);
        }
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 10) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.blue} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>{getGreeting()}!</Text>
                    <Text style={styles.userName}>{user?.name || "User"}</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileImage}
                    onPress={() => router.push("/profile")}
                >
                    {user?.profile_photo ? (
                        <Image
                            source={{ uri: user.profile_photo }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || "?"}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Upcoming Meetings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Rapat Yang Harus Diikuti
                </Text>

                {upcomingMeetings.length > 0 ? (
                    upcomingMeetings.map((meeting) => (
                        <UpcomingMeetingCard
                            key={meeting.id}
                            meeting={meeting}
                        />
                    ))
                ) : (
                    <EmptyState
                        icon="calendar-outline"
                        title="Tidak ada rapat yang akan datang"
                    />
                )}
            </View>

            {/* Attendance History Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Riwayat Presensi</Text>
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/history")}
                    >
                        <Text style={styles.seeAllText}>Selengkapnya →</Text>
                    </TouchableOpacity>
                </View>

                {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record: any, index: number) => (
                        <MeetingCard
                            key={record?.id || index}
                            meeting={record.meeting}
                            showAttendanceInfo
                            attendanceDate={formatAttendanceDate(
                                record.created_at
                            )}
                        />
                    ))
                ) : (
                    <EmptyState
                        icon="checkmark-circle-outline"
                        title="Belum ada riwayat presensi"
                    />
                )}
            </View>
        </ScrollView>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: Colors.blue,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    separator: {
        height: 1,
        backgroundColor: "#0000003b",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.blue,
        fontWeight: "500",
    },
});
