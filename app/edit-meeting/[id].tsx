import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function EditMeetingPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        loadMeetingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadMeetingData = async () => {
        if (!id || Array.isArray(id)) return;

        try {
            const { data: meeting, error } = await supabase
                .from("meetings")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching meeting:", error);
                Alert.alert("Error", "Gagal memuat data rapat");
                router.back();
                return;
            }

            // Check if user is creator
            if (meeting.created_by !== user?.id) {
                Alert.alert(
                    "Akses Ditolak",
                    "Hanya pembuat rapat yang dapat mengedit rapat",
                    [{ text: "OK", onPress: () => router.back() }]
                );
                return;
            }

            // Set form values
            setTitle(meeting.title);
            setDescription(meeting.description || "");
            setLocation(meeting.location || "");

            // Parse date and time
            const meetingDate = new Date(meeting.date);
            setSelectedDate(meetingDate);

            const [startHours, startMinutes] = meeting.start_time.split(":");
            const startDateTime = new Date();
            startDateTime.setHours(
                parseInt(startHours),
                parseInt(startMinutes)
            );
            setStartTime(startDateTime);

            const [endHours, endMinutes] = meeting.end_time.split(":");
            const endDateTime = new Date();
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));
            setEndTime(endDateTime);

            setLoading(false);
        } catch (error) {
            console.error("Error loading meeting:", error);
            Alert.alert("Error", "Terjadi kesalahan saat memuat data");
            router.back();
        }
    };

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

    const handleUpdateMeeting = async () => {
        if (!validateForm()) return;
        if (!id || Array.isArray(id)) return;

        setSaving(true);

        try {
            const { error } = await supabase
                .from("meetings")
                .update({
                    title: title.trim(),
                    description: description.trim() || null,
                    date: formatDate(selectedDate),
                    start_time: formatTime(startTime),
                    end_time: formatTime(endTime),
                    location: location.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) {
                console.error("Error updating meeting:", error);
                Alert.alert(
                    "Error",
                    "Gagal mengupdate rapat: " + error.message
                );
                return;
            }

            Alert.alert("Berhasil", "Rapat berhasil diupdate!", [
                {
                    text: "OK",
                    onPress: () => {
                        router.back();
                    },
                },
            ]);
        } catch (error) {
            console.error("Error updating meeting:", error);
            Alert.alert("Error", "Terjadi kesalahan saat mengupdate rapat");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.blue} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <PageHeader title="Edit Rapat" showBackButton />

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
                                Edit informasi rapat di bawah ini. Perubahan
                                akan tersimpan setelah Anda menekan tombol
                                Simpan.
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
                                        editable={!saving}
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
                                        editable={!saving}
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
                                    disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        editable={!saving}
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    saving && styles.submitButtonDisabled,
                                ]}
                                onPress={handleUpdateMeeting}
                                disabled={saving}
                            >
                                {saving ? (
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
                                            Simpan Perubahan
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.bgLight.backgroundColor,
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
        shadowColor: Colors.blue,
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
