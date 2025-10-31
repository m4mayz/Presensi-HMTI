import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordPage() {
    const { user, signOut } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!currentPassword) {
            Alert.alert("Error", "Password lama harus diisi");
            return false;
        }

        if (!newPassword) {
            Alert.alert("Error", "Password baru harus diisi");
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password baru minimal 6 karakter");
            return false;
        }

        if (newPassword === currentPassword) {
            Alert.alert(
                "Error",
                "Password baru harus berbeda dengan password lama"
            );
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Konfirmasi password tidak cocok");
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;
        if (!user?.id) return;

        setLoading(true);

        try {
            // Verify current password
            const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("password")
                .eq("id", user.id)
                .single();

            if (fetchError || !userData) {
                Alert.alert("Error", "Gagal memverifikasi password");
                return;
            }

            // TODO: Use bcrypt.compare when password hashing is implemented
            if (userData.password !== currentPassword) {
                Alert.alert("Error", "Password lama tidak sesuai");
                return;
            }

            // Update password
            const { error: updateError } = await supabase
                .from("users")
                .update({
                    password: newPassword, // TODO: Hash with bcrypt before saving
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (updateError) {
                Alert.alert("Error", "Gagal mengubah password");
                return;
            }

            Alert.alert(
                "Berhasil",
                "Password berhasil diubah. Silakan login kembali dengan password baru.",
                [
                    {
                        text: "OK",
                        onPress: async () => {
                            await signOut();
                            router.replace("/(auth)/login");
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error changing password:", error);
            Alert.alert("Error", "Terjadi kesalahan saat mengubah password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>
                <PageHeader title="Ganti Password" showBackButton />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons
                            name="information-circle"
                            size={24}
                            color={Colors.blue}
                        />
                        <Text style={styles.infoText}>
                            Password minimal 6 karakter. Setelah berhasil
                            mengubah password, Anda akan diminta login kembali.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formSection}>
                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password Lama</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#64748B"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan password lama"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={
                                            showCurrentPassword
                                                ? "eye-outline"
                                                : "eye-off-outline"
                                        }
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password Baru</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#64748B"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan password baru"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={
                                            showNewPassword
                                                ? "eye-outline"
                                                : "eye-off-outline"
                                        }
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Konfirmasi Password Baru
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#64748B"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan ulang password baru"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={
                                            showConfirmPassword
                                                ? "eye-outline"
                                                : "eye-off-outline"
                                        }
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                loading && styles.submitButtonDisabled,
                            ]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Simpan Password Baru
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Security Tips */}
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>
                            Tips Keamanan Password
                        </Text>
                        <View style={styles.tipItem}>
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={Colors.green}
                            />
                            <Text style={styles.tipText}>
                                Gunakan kombinasi huruf, angka, dan simbol
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={Colors.green}
                            />
                            <Text style={styles.tipText}>
                                Minimal 6 karakter (lebih panjang lebih baik)
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={Colors.green}
                            />
                            <Text style={styles.tipText}>
                                Jangan gunakan password yang mudah ditebak
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={Colors.green}
                            />
                            <Text style={styles.tipText}>
                                Jangan bagikan password kepada siapapun
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: Colors.blue,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
        marginBottom: -20,
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
        borderRadius: 32,
        padding: 20,
        marginBottom: 24,
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
    eyeIcon: {
        padding: 8,
    },
    submitButton: {
        backgroundColor: Colors.blue,
        borderRadius: 12,
        height: 52,
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
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    tipsCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: "#64748B",
        marginLeft: 8,
        lineHeight: 18,
    },
});
