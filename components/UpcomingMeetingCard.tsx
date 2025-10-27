import Colors from "@/constants/Colors";
import { Meeting } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UpcomingMeetingCardProps {
    meeting: Meeting;
}

export default function UpcomingMeetingCard({
    meeting,
}: UpcomingMeetingCardProps) {
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

    return (
        <View style={styles.meetingCard}>
            <Text style={styles.meetingTitle}>{meeting.title}</Text>

            <View style={styles.meetingInfoContainer}>
                <View style={styles.meetingInfo}>
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.meetingInfoText}>
                        {formatDate(meeting.date)}
                    </Text>
                </View>

                <View style={styles.meetingInfo}>
                    <Ionicons name="time-outline" size={16} color="#fff" />
                    <Text style={styles.meetingInfoText}>
                        {formatTime(meeting.start_time)} -{" "}
                        {formatTime(meeting.end_time)}
                    </Text>
                </View>

                <View style={styles.meetingInfo}>
                    <Ionicons name="location-outline" size={16} color="#fff" />
                    <Text style={styles.meetingInfoText}>
                        {meeting.location || "Belum ditentukan"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() =>
                        router.push(`/meeting-details/${meeting.id}` as any)
                    }
                >
                    <Text style={styles.detailButtonText}>Detail Rapat</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
