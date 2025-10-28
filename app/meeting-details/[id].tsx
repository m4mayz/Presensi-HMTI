import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Meeting } from "@/types/database.types";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ParticipantWithUser {
    id: string;
    user_id: string;
    meeting_id: string;
    is_required: boolean;
    user?: {
        id: string;
        name: string;
        nim: string;
        divisi: string;
        profile_photo?: string;
    };
    attendance?: {
        status: string;
    }[];
}

export default function MeetingDetailPage() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [participants, setParticipants] = useState<ParticipantWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMeetingDetails = useCallback(async () => {
        if (!id || Array.isArray(id)) return;

        try {
            // Fetch meeting details
            const { data: meetingData, error: meetingError } = await supabase
                .from("meetings")
                .select("*")
                .eq("id", id)
                .single();

            if (meetingError) {
                console.error("Error fetching meeting:", meetingError);
                return;
            }

            setMeeting(meetingData);

            // Check if meeting has passed and update status to "terlewat" for non-attendees
            const meetingEndDateTime = new Date(
                `${meetingData.date}T${meetingData.end_time}`
            );
            const now = new Date();
            const hasPassed = meetingEndDateTime < now;

            // Fetch participants with user info
            const { data: participantsData, error: participantsError } =
                await supabase
                    .from("meeting_participants")
                    .select(
                        `
                        *,
                        user:users(*)
                    `
                    )
                    .eq("meeting_id", id);

            if (participantsError) {
                console.error(
                    "Error fetching participants:",
                    participantsError
                );
                return;
            }

            // Fetch attendance records for this meeting
            let { data: attendanceData, error: attendanceError } =
                await supabase
                    .from("attendance")
                    .select("user_id, status")
                    .eq("meeting_id", id);

            if (attendanceError) {
                console.error("Error fetching attendance:", attendanceError);
            }

            // If meeting has passed, create "terlewat" records for non-attendees
            if (hasPassed && participantsData) {
                const attendedUserIds = new Set(
                    attendanceData?.map((a) => a.user_id) || []
                );

                const missedParticipants = participantsData.filter(
                    (p) => !attendedUserIds.has(p.user_id)
                );

                if (missedParticipants.length > 0) {
                    const missedRecords = missedParticipants.map((p) => ({
                        meeting_id: id,
                        user_id: p.user_id,
                        status: "terlewat",
                        attendance_time: new Date().toISOString(),
                    }));

                    // Insert "terlewat" records for those who didn't attend
                    const { error: insertError } = await supabase
                        .from("attendance")
                        .upsert(missedRecords, {
                            onConflict: "meeting_id,user_id",
                            ignoreDuplicates: false,
                        });

                    if (insertError) {
                        console.error(
                            "Error inserting missed attendance:",
                            insertError
                        );
                    } else {
                        // Refresh attendance data after successful insert
                        const { data: updatedAttendanceData } = await supabase
                            .from("attendance")
                            .select("user_id, status")
                            .eq("meeting_id", id);

                        // Replace with fresh data, not append
                        if (updatedAttendanceData) {
                            attendanceData = updatedAttendanceData;
                        }
                    }
                }
            }

            // Merge attendance data with participants
            const participantsWithAttendance = (participantsData as any[]).map(
                (participant) => {
                    const attendance = attendanceData?.find(
                        (att) => att.user_id === participant.user_id
                    );
                    return {
                        ...participant,
                        attendance: attendance
                            ? [{ status: attendance.status }]
                            : [],
                    };
                }
            );

            setParticipants(participantsWithAttendance || []);
        } catch (error) {
            console.error("Error loading meeting details:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadMeetingDetails();
    }, [loadMeetingDetails]);

    // Refresh when screen is focused (after adding/removing participants)
    useFocusEffect(
        useCallback(() => {
            loadMeetingDetails();
        }, [loadMeetingDetails])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMeetingDetails();
        setRefreshing(false);
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
        const date = new Date(dateString);
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const monthNames = [
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
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} ${month} ${year}`;
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5) + " WIB";
    };

    const getAttendedCount = () => {
        return participants.filter(
            (p) =>
                p.attendance &&
                p.attendance.length > 0 &&
                p.attendance[0].status === "hadir"
        ).length;
    };

    const isUserAttended = (participant: ParticipantWithUser) => {
        return (
            participant.attendance &&
            participant.attendance.length > 0 &&
            participant.attendance[0].status === "hadir"
        );
    };

    const isUserMissed = (participant: ParticipantWithUser) => {
        return (
            participant.attendance &&
            participant.attendance.length > 0 &&
            participant.attendance[0].status === "terlewat"
        );
    };

    const isMeetingPassed = () => {
        if (!meeting) return false;
        const now = new Date();
        const meetingEndDateTime = new Date(
            `${meeting.date}T${meeting.end_time}`
        );
        return meetingEndDateTime < now;
    };

    const isCreator = () => {
        return meeting?.created_by === user?.id;
    };

    const handleShowQRCode = () => {
        router.push(`/qr-code/${id}` as any);
    };

    const handleAddParticipant = () => {
        router.push(`/add-participants/${id}` as any);
    };

    const handleEditMeeting = () => {
        router.push(`/edit-meeting/${id}` as any);
    };

    const handleScanQR = () => {
        router.push("/scan-qr" as any);
    };

    const handleDeleteMeeting = () => {
        if (!id || Array.isArray(id)) return;

        Alert.alert(
            "Hapus Rapat",
            "Apakah Anda yakin ingin menghapus rapat ini? Semua data peserta dan presensi akan ikut terhapus.",
            [
                {
                    text: "Batal",
                    style: "cancel",
                },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Delete attendance records first
                            const { error: attendanceError } = await supabase
                                .from("attendance")
                                .delete()
                                .eq("meeting_id", id);

                            if (attendanceError) {
                                console.error(
                                    "Error deleting attendance:",
                                    attendanceError
                                );
                            }

                            // Delete participants
                            const { error: participantsError } = await supabase
                                .from("meeting_participants")
                                .delete()
                                .eq("meeting_id", id);

                            if (participantsError) {
                                console.error(
                                    "Error deleting participants:",
                                    participantsError
                                );
                            }

                            // Delete meeting
                            const { error: meetingError } = await supabase
                                .from("meetings")
                                .delete()
                                .eq("id", id);

                            if (meetingError) {
                                console.error(
                                    "Error deleting meeting:",
                                    meetingError
                                );
                                Alert.alert(
                                    "Error",
                                    "Gagal menghapus rapat: " +
                                        meetingError.message
                                );
                                return;
                            }

                            Alert.alert("Berhasil", "Rapat berhasil dihapus!", [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        router.replace("/(tabs)/home");
                                    },
                                },
                            ]);
                        } catch (error) {
                            console.error("Error deleting meeting:", error);
                            Alert.alert(
                                "Error",
                                "Terjadi kesalahan saat menghapus rapat"
                            );
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.blue} />
            </View>
        );
    }

    if (!meeting) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Rapat tidak ditemukan</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader title="Detail Rapat" showBackButton />

            {/* Meeting Info Card - Fixed */}
            <View style={styles.meetingInfoCard}>
                {/* Edit & Delete Buttons - Top Right (Only for Creator) */}
                {isCreator() && (
                    <View style={styles.topActionButtons}>
                        {/* Edit button - hidden when meeting passed */}
                        {!isMeetingPassed() && (
                            <TouchableOpacity
                                style={styles.editButtonTopRight}
                                onPress={handleEditMeeting}
                            >
                                <Octicons
                                    name="pencil"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        )}
                        {/* Delete button - always visible for creator */}
                        <TouchableOpacity
                            style={styles.deleteButtonTopRight}
                            onPress={handleDeleteMeeting}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.meetingTitle}>{meeting.title}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#fff"
                        />
                    </View>
                    <Text style={styles.infoText}>
                        {formatDate(meeting.date)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="time-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.infoText}>
                        {formatTime(meeting.start_time)} -{" "}
                        {formatTime(meeting.end_time)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#fff"
                        />
                    </View>
                    <Text style={styles.infoText}>
                        {meeting.location || "Belum ditentukan"}
                    </Text>
                </View>

                {/* Action Buttons - Only for Creator and only before meeting ends */}
                {isCreator() && !isMeetingPassed() && (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.qrButton]}
                            onPress={handleShowQRCode}
                        >
                            <Ionicons
                                name="qr-code-outline"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>QR Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.addButton]}
                            onPress={handleAddParticipant}
                        >
                            <Ionicons
                                name="person-add-outline"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>
                                Tambah Peserta
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan QR Button - For participants who haven't attended */}
                {!isCreator() &&
                    !isMeetingPassed() &&
                    !isUserAttended(
                        participants.find((p) => p.user_id === user?.id) || {
                            id: "",
                            user_id: "",
                            meeting_id: "",
                            is_required: false,
                        }
                    ) && (
                        <TouchableOpacity
                            style={styles.scanQRButton}
                            onPress={handleScanQR}
                        >
                            <Ionicons
                                name="scan-outline"
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.scanQRButtonText}>
                                Scan QR Code untuk Presensi
                            </Text>
                        </TouchableOpacity>
                    )}
            </View>

            {/* Attendance List - Scrollable */}
            <View style={styles.attendanceSection}>
                <View style={styles.attendanceHeader}>
                    <Text style={styles.sectionTitle}>Daftar Kehadiran</Text>
                    <View style={styles.attendanceBadge}>
                        <Text style={styles.attendanceBadgeText}>
                            {getAttendedCount()}/{participants.length} hadir
                        </Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.participantScrollView}
                    contentContainerStyle={styles.participantScrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    showsVerticalScrollIndicator={true}
                >
                    {participants.map((participant, index) => (
                        <View
                            key={participant.id}
                            style={[styles.participantCard]}
                        >
                            <View style={styles.participantAvatar}>
                                {participant.user?.profile_photo ? (
                                    <Image
                                        source={{
                                            uri: participant.user.profile_photo,
                                        }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {participant.user?.name
                                                ?.charAt(0)
                                                .toUpperCase() || "?"}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.participantInfo}>
                                <Text style={styles.participantName}>
                                    {participant.user?.name || "Unknown"}
                                </Text>
                                <Text style={styles.participantNim}>
                                    {participant.user?.nim || ""}
                                </Text>
                                <Text style={styles.participantDivision}>
                                    {participant.user?.divisi || ""}
                                </Text>
                            </View>

                            {isUserAttended(participant) ? (
                                <View
                                    style={[
                                        styles.statusBadge,
                                        styles.statusAttended,
                                    ]}
                                >
                                    <Text style={styles.statusTextAttended}>
                                        Hadir
                                    </Text>
                                </View>
                            ) : isUserMissed(participant) ? (
                                <View
                                    style={[
                                        styles.statusBadge,
                                        styles.statusMissed,
                                    ]}
                                >
                                    <Text style={styles.statusTextMissed}>
                                        Terlewat
                                    </Text>
                                </View>
                            ) : isMeetingPassed() ? (
                                <View
                                    style={[
                                        styles.statusBadge,
                                        styles.statusMissed,
                                    ]}
                                >
                                    <Text style={styles.statusTextMissed}>
                                        Terlewat
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={[
                                        styles.statusBadge,
                                        styles.statusNotAttended,
                                    ]}
                                >
                                    <Text style={styles.statusTextNotAttended}>
                                        Belum hadir
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {participants.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="people-outline"
                                size={48}
                                color="#CBD5E1"
                            />
                            <Text style={styles.emptyText}>
                                Belum ada peserta terdaftar
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
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
    errorText: {
        fontSize: 16,
        color: "#64748B",
    },
    meetingInfoCard: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 24,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 0,
    },
    meetingTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    infoText: {
        fontSize: 14,
        color: "#fff",
        flex: 1,
    },
    attendanceSection: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: 20,
        overflow: "hidden",
    },
    attendanceHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingBottom: 12,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
    },
    attendanceBadge: {
        backgroundColor: Colors.blue,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    attendanceBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    participantScrollView: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
        marginBottom: 40,
    },
    participantScrollContent: {
        paddingHorizontal: 20,
    },
    participantCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    participantAvatar: {
        width: 48,
        height: 48,
        marginRight: 12,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.blue,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    participantInfo: {
        flex: 1,
    },
    participantName: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 4,
    },
    participantNim: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 2,
    },
    participantDivision: {
        fontSize: 12,
        color: "#94A3B8",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusAttended: {
        backgroundColor: Colors.green,
    },
    statusNotAttended: {
        backgroundColor: "#F1F5F9",
    },
    statusMissed: {
        backgroundColor: "#EF4444",
    },
    statusTextAttended: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    statusTextNotAttended: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    statusTextMissed: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
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
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    qrButton: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    addButton: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    scanQRButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.green,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
        elevation: 2,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    scanQRButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
    },
    topActionButtons: {
        position: "absolute",
        top: 16,
        right: 16,
        flexDirection: "row",
        gap: 8,
        zIndex: 10,
    },
    editButtonTopRight: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonTopRight: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
});
