import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function CreateMeetingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    // Date & Time pickers
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());

    // Picker visibility (for Android)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Check permission
    if (!user?.can_create_meeting) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <PageHeader title="Buat Rapat" showBackButton />
                <View style={styles.noPermissionContainer}>
                    <Ionicons name="lock-closed" size={64} color="#CBD5E1" />
                    <Text style={styles.noPermissionTitle}>Akses Ditolak</Text>
                    <Text style={styles.noPermissionText}>
                        Anda tidak memiliki izin untuk membuat rapat.
                    </Text>
                    <Text style={styles.noPermissionText}>
                        Hubungi admin untuk mendapatkan akses.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        );
    }

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatDisplayTime = (date: Date) => {
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    const onStartTimeChange = (event: any, selectedTime?: Date) => {
        setShowStartTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            setStartTime(selectedTime);
        }
    };

    const onEndTimeChange = (event: any, selectedTime?: Date) => {
        setShowEndTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            setEndTime(selectedTime);
        }
    };

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Judul rapat harus diisi");
            return false;
        }

        // Check if end time is after start time
        if (endTime <= startTime) {
            Alert.alert(
                "Error",
                "Waktu selesai harus lebih besar dari waktu mulai"
            );
            return false;
        }

        if (!location.trim()) {
            Alert.alert("Error", "Lokasi rapat harus diisi");
            return false;
        }

        return true;
    };

    const handleCreateMeeting = async () => {
        if (!validateForm()) return;
        if (!user?.id) return;

        setLoading(true);

        try {
            // Create meeting
            const { data: meeting, error: meetingError } = await supabase
                .from("meetings")
                .insert({
                    title: title.trim(),
                    description: description.trim() || null,
                    date: formatDate(selectedDate),
                    start_time: formatTime(startTime),
                    end_time: formatTime(endTime),
                    location: location.trim(),
                    created_by: user.id,
                })
                .select()
                .single();

            if (meetingError) {
                console.error("Error creating meeting:", meetingError);
                Alert.alert(
                    "Error",
                    "Gagal membuat rapat: " + meetingError.message
                );
                return;
            }

            // Auto-add creator as participant
            const { error: participantError } = await supabase
                .from("meeting_participants")
                .insert({
                    meeting_id: meeting.id,
                    user_id: user.id,
                });

            if (participantError) {
                console.error(
                    "Error adding creator as participant:",
                    participantError
                );
                // Don't show error to user, meeting is already created
            }

            // Auto-add creator attendance with status "Hadir"
            const { error: attendanceError } = await supabase
                .from("attendance")
                .insert({
                    meeting_id: meeting.id,
                    user_id: user.id,
                    status: "hadir",
                });

            if (attendanceError) {
                console.error(
                    "Error adding creator attendance:",
                    attendanceError
                );
                // Don't show error to user, meeting is already created
            }

            Alert.alert("Berhasil", "Rapat berhasil dibuat!", [
                {
                    text: "OK",
                    onPress: () => {
                        router.replace("/(tabs)/home");
                    },
                },
            ]);
        } catch (error) {
            console.error("Error creating meeting:", error);
            Alert.alert("Error", "Terjadi kesalahan saat membuat rapat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <PageHeader title="Buat Rapat" showBackButton />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.scrollWrapper}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Info Card */}
                        <View style={styles.infoCard}>
                            <Ionicons
                                name="information-circle"
                                size={24}
                                color={Colors.blue}
                            />
                            <Text style={styles.infoText}>
                                Isi form di bawah untuk membuat rapat baru.
                                Setelah rapat dibuat, Anda dapat menambahkan
                                peserta di halaman detail rapat.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.formSection}>
                            {/* Title */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Judul Rapat{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={20}
                                        color="#64748B"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Rapat Koordinasi Bulanan"
                                        value={title}
                                        onChangeText={setTitle}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Deskripsi (Opsional)
                                </Text>
                                <View style={styles.textAreaContainer}>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Deskripsi atau agenda rapat..."
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Date */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Tanggal{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={styles.inputContainer}
                                    onPress={() => setShowDatePicker(true)}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color="#64748B"
                                        style={styles.inputIcon}
                                    />
                                    <Text style={styles.pickerText}>
                                        {formatDisplayDate(selectedDate)}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={
                                            Platform.OS === "ios"
                                                ? "spinner"
                                                : "default"
                                        }
                                        onChange={onDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>

                            {/* Time */}
                            <View style={styles.timeRow}>
                                <View style={styles.timeInputGroup}>
                                    <Text style={styles.label}>
                                        Waktu Mulai{" "}
                                        <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.inputContainer}
                                        onPress={() =>
                                            setShowStartTimePicker(true)
                                        }
                                        disabled={loading}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={20}
                                            color="#64748B"
                                            style={styles.inputIcon}
                                        />
                                        <Text style={styles.pickerText}>
                                            {formatDisplayTime(startTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    {showStartTimePicker && (
                                        <DateTimePicker
                                            value={startTime}
                                            mode="time"
                                            display={
                                                Platform.OS === "ios"
                                                    ? "spinner"
                                                    : "default"
                                            }
                                            onChange={onStartTimeChange}
                                            is24Hour={true}
                                        />
                                    )}
                                </View>

                                <View style={styles.timeInputGroup}>
                                    <Text style={styles.label}>
                                        Waktu Selesai{" "}
                                        <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.inputContainer}
                                        onPress={() =>
                                            setShowEndTimePicker(true)
                                        }
                                        disabled={loading}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={20}
                                            color="#64748B"
                                            style={styles.inputIcon}
                                        />
                                        <Text style={styles.pickerText}>
                                            {formatDisplayTime(endTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    {showEndTimePicker && (
                                        <DateTimePicker
                                            value={endTime}
                                            mode="time"
                                            display={
                                                Platform.OS === "ios"
                                                    ? "spinner"
                                                    : "default"
                                            }
                                            onChange={onEndTimeChange}
                                            is24Hour={true}
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Location */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Lokasi{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="location-outline"
                                        size={20}
                                        color="#64748B"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contoh: Ruang Rapat Lantai 2"
                                        value={location}
                                        onChangeText={setLocation}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    loading && styles.submitButtonDisabled,
                                ]}
                                onPress={handleCreateMeeting}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#fff"
                                            style={styles.buttonIcon}
                                        />
                                        <Text style={styles.submitButtonText}>
                                            Buat Rapat
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.blue,
    },
    scrollWrapper: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    noPermissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    noPermissionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginTop: 16,
        marginBottom: 8,
    },
    noPermissionText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 4,
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: "flex-start",
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#1E40AF",
        marginLeft: 12,
        lineHeight: 18,
    },
    formSection: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: Colors.bgLight.textColor,
    },
    pickerText: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: Colors.bgLight.textColor,
        textAlignVertical: "center",
        lineHeight: Platform.OS === "ios" ? 48 : undefined,
    },
    textAreaContainer: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
    },
    textArea: {
        fontSize: 15,
        color: Colors.bgLight.textColor,
        minHeight: 100,
    },
    helperText: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
        marginLeft: 4,
    },
    timeRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 8,
    },
    timeInputGroup: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: Colors.green,
        borderRadius: 12,
        height: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        elevation: 2,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#94A3B8",
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});
