import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Attendance, Meeting } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
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
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
            .from("meetings")
            .select("*")
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
            const formattedData = data?.map((item: any) => item.meeting) || [];
            setAttendanceHistory(formattedData);
        }
    };

    const formatDate = (dateString: string) => {
        const days = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
        ];
        const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];

        const date = new Date(dateString);
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} ${month} ${year}`;
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5) + " WIB";
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
                <TouchableOpacity style={styles.profileImage}>
                    {user?.profile_photo ? (
                        <Image
                            source={{ uri: user.profile_photo }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Image
                            source={require("@/assets/images/icon.png")}
                            style={styles.avatar}
                        />
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
                        <View key={meeting.id} style={styles.meetingCard}>
                            <Text style={styles.meetingTitle}>
                                {meeting.title}
                            </Text>

                            <View style={styles.meetingInfoContainer}>
                                <View style={styles.meetingInfo}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color="#fff"
                                    />
                                    <Text style={styles.meetingInfoText}>
                                        {formatDate(meeting.date)}
                                    </Text>
                                </View>

                                <View style={styles.meetingInfo}>
                                    <Ionicons
                                        name="time-outline"
                                        size={16}
                                        color="#fff"
                                    />
                                    <Text style={styles.meetingInfoText}>
                                        {formatTime(meeting.start_time)} -{" "}
                                        {formatTime(meeting.end_time)}
                                    </Text>
                                </View>

                                <View style={styles.meetingInfo}>
                                    <Ionicons
                                        name="location-outline"
                                        size={16}
                                        color="#fff"
                                    />
                                    <Text style={styles.meetingInfoText}>
                                        {meeting.location || "Belum ditentukan"}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() =>
                                        router.push(
                                            `/meeting-details/${meeting.id}` as any
                                        )
                                    }
                                >
                                    <Text style={styles.detailButtonText}>
                                        Detail Rapat
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="calendar-outline"
                            size={48}
                            color="#94A3B8"
                        />
                        <Text style={styles.emptyText}>
                            Tidak ada rapat yang akan datang
                        </Text>
                    </View>
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
                    attendanceHistory.map((meeting, index) => (
                        <TouchableOpacity
                            key={meeting?.id || index}
                            style={styles.historyCard}
                            onPress={() =>
                                router.push(
                                    `/meeting-details/${meeting?.id}` as any
                                )
                            }
                        >
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyTitle}>
                                    {meeting?.title}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Hadir</Text>
                                </View>
                            </View>

                            <View style={styles.historyInfo}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={14}
                                    color="#64748B"
                                />
                                <Text style={styles.historyInfoText}>
                                    {meeting?.date
                                        ? formatDate(meeting.date)
                                        : ""}
                                </Text>
                            </View>

                            <View style={styles.historyInfo}>
                                <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color="#64748B"
                                />
                                <Text style={styles.historyInfoText}>
                                    {meeting?.start_time &&
                                    meeting?.end_time ? (
                                        <>
                                            {formatTime(meeting.start_time)} -{" "}
                                            {formatTime(meeting.end_time)}
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </Text>
                            </View>

                            <View style={styles.historyInfo}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color="#64748B"
                                />
                                <Text style={styles.historyInfoText}>
                                    {meeting?.location || "Belum ditentukan"}
                                </Text>
                            </View>

                            <View style={styles.separator2} />

                            <Text style={styles.historyDate}>
                                Absen pada:{" "}
                                {new Date().toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={48}
                            color="#94A3B8"
                        />
                        <Text style={styles.emptyText}>
                            Belum ada riwayat presensi
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ height: 40 }} />
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
    separator: {
        height: 1,
        backgroundColor: "#0000003b",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    separator2: {
        height: 1,
        backgroundColor: "#0000003b",
        marginVertical: 10,
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
    meetingCard: {
        backgroundColor: Colors.blue,
        borderRadius: 32,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    meetingTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 12,
    },
    meetingInfoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 20,
        padding: 16,
    },
    meetingInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    meetingInfoText: {
        fontSize: 14,
        color: "#fff",
        marginLeft: 8,
        flex: 1,
    },
    detailButton: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 28,
        alignItems: "center",
        marginTop: 4,
    },
    detailButtonText: {
        color: Colors.blue,
        fontSize: 14,
        fontWeight: "500",
    },
    historyCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: Colors.green,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
    },
    historyInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    historyInfoText: {
        fontSize: 13,
        color: "#64748B",
        marginLeft: 8,
    },
    historyDate: {
        fontSize: 12,
        color: "#94A3B8",
        fontStyle: "italic",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 12,
    },
});
