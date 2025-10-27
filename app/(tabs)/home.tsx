import EmptyState from "@/components/EmptyState";
import MeetingCard from "@/components/MeetingCard";
import UpcomingMeetingCard from "@/components/UpcomingMeetingCard";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Attendance, Meeting } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
    const { user, refreshUser } = useAuth();
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [missedMeetings, setMissedMeetings] = useState<Meeting[]>([]);
    const [attendanceHistory, setAttendanceHistory] = useState<
        MeetingWithAttendance[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUpcomingMeetings = useCallback(async () => {
        if (!user?.id) return;

        const now = new Date();

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
            setMissedMeetings([]);
            return;
        }

        // Fetch all meetings where user is a participant
        const { data: allMeetings, error } = await supabase
            .from("meetings")
            .select("*")
            .in("id", meetingIds)
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

        if (error) {
            console.error("Error fetching meetings:", error);
            return;
        }

        // Get attendance records for these meetings
        const { data: attendanceData } = await supabase
            .from("attendance")
            .select("meeting_id, user_id")
            .eq("user_id", user.id)
            .in("meeting_id", meetingIds);

        const attendedMeetingIds = new Set(
            attendanceData?.map((a) => a.meeting_id) || []
        );

        // Separate upcoming and missed meetings
        const upcoming: Meeting[] = [];
        const missed: Meeting[] = [];

        allMeetings?.forEach((meeting) => {
            // Create full datetime objects for accurate comparison
            const meetingEndDateTime = new Date(
                `${meeting.date}T${meeting.end_time}`
            );
            const isPast = meetingEndDateTime < now;

            const hasAttended = attendedMeetingIds.has(meeting.id);

            if (isPast && !hasAttended) {
                // Meeting has passed and user didn't attend
                missed.push(meeting);
            } else if (!isPast) {
                // Meeting is upcoming or today but not yet ended
                upcoming.push(meeting);
            }
        });

        setUpcomingMeetings(upcoming.slice(0, 5)); // Limit to 5
        setMissedMeetings(missed);
    }, [user?.id]);

    const fetchAttendanceHistory = useCallback(async () => {
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
            .limit(3);

        if (error) {
            console.error("Error fetching attendance:", error);
        } else {
            setAttendanceHistory((data as any) || []);
        }
    }, [user?.id]);

    const loadData = useCallback(async () => {
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
    }, [fetchUpcomingMeetings, fetchAttendanceHistory]);

    // Initial load
    useEffect(() => {
        if (user) {
            // Refresh user data from database to get latest permissions
            refreshUser();
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Refresh when screen is focused (after creating meeting)
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadData();
            }
        }, [user, loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
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
        <View style={styles.wrapper}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>{getGreeting()}!</Text>
                        <Text style={styles.userName}>
                            {user?.name || "User"}
                        </Text>
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
                        Rapat Yang Harus Diikuti{" "}
                        {upcomingMeetings.length > 0
                            ? `(${upcomingMeetings.length})`
                            : ""}
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

                {/* Missed Meetings Section */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Rapat Yang Anda Lewatkan
                    </Text>
                    {missedMeetings.length > 0 ? (
                        missedMeetings.map((meeting) => (
                            <MeetingCard
                                key={meeting.id}
                                meeting={meeting}
                                showMissedBadge
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="checkmark-circle-outline"
                            title="Tidak ada rapat yang terlewat"
                        />
                    )}
                </View>
            </ScrollView>

            {/* FAB - Floating Action Button */}
            {user?.can_create_meeting && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push("/create-meeting")}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                    <Text style={styles.fabText}>Buat Rapat</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
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
    fab: {
        position: "absolute",
        right: 20,
        bottom: 40,
        backgroundColor: Colors.green,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 28,
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    fabText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 8,
    },
});
