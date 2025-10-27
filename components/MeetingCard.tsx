import Colors from "@/constants/Colors";
import { Meeting } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MeetingCardProps {
    meeting: Meeting;
    showAttendanceInfo?: boolean;
    attendanceDate?: string;
    showMissedBadge?: boolean;
    onPress?: () => void;
}

export default function MeetingCard({
    meeting,
    showAttendanceInfo = false,
    attendanceDate,
    showMissedBadge = false,
    onPress,
}: MeetingCardProps) {
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

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/meeting-details/${meeting.id}` as any);
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{meeting.title}</Text>
                {showMissedBadge ? (
                    <View style={styles.missedBadge}>
                        <Text style={styles.statusText}>Terlewat</Text>
                    </View>
                ) : (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Hadir</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>{formatDate(meeting.date)}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>
                    {formatTime(meeting.start_time)} -{" "}
                    {formatTime(meeting.end_time)}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>
                    {meeting.location || "Belum ditentukan"}
                </Text>
            </View>

            {showAttendanceInfo && attendanceDate && (
                <>
                    <View style={styles.separator} />
                    <Text style={styles.attendanceDate}>
                        Absen pada: {attendanceDate}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
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
        backgroundColor: Colors.green,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    missedBadge: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: "white",
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
    separator: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    attendanceDate: {
        fontSize: 12,
        color: "#94A3B8",
        fontStyle: "italic",
    },
});
