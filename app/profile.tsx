import PageHeader from "@/components/PageHeader";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfilePage() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    const handleChangePassword = () => {
        // Navigate to change password page
        console.log("Change password");
    };

    const handleContactAdmin = () => {
        const whatsappNumber = "6282111856806"; // Nomor admin
        const message = "Halo Admin, saya butuh bantuan";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <PageHeader title="Profil" showBackButton />

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
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
                    <TouchableOpacity style={styles.cameraButton}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.userName}>{user?.name || "User"}</Text>
                <Text style={styles.userInfo}>
                    {user?.nim || "2023001"} -{" "}
                    {user?.divisi || "Divisi Kominfo"}
                </Text>
            </View>

            {/* Menu Section */}
            <View style={styles.menuSection}>
                <ProfileMenuItem
                    icon="key-outline"
                    iconColor={Colors.blue}
                    title="Ganti Password"
                    onPress={handleChangePassword}
                />

                <ProfileMenuItem
                    icon="help-circle-outline"
                    iconColor={Colors.blue}
                    title="Bantuan"
                    subtitle="(Hubungi Admin)"
                    onPress={handleContactAdmin}
                />

                <ProfileMenuItem
                    icon="log-out-outline"
                    iconColor="#EF4444"
                    title="Logout"
                    onPress={handleLogout}
                    showChevron={false}
                    isLogout
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Versi Aplikasi 1.0.0</Text>
                <Text style={styles.footerCopyright}>
                    © 2025 Presensi Rapat
                </Text>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    header: {
        backgroundColor: Colors.blue,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    profileSection: {
        backgroundColor: Colors.blue,
        paddingBottom: 40,
        alignItems: "center",
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#fff",
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#fff",
        borderWidth: 4,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 48,
        fontWeight: "700",
        color: Colors.blue,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.blue,
        borderWidth: 3,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
    },
    userInfo: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
    },
    menuSection: {
        marginTop: -20,
        marginHorizontal: 20,
        backgroundColor: "#E0E7FF",
        borderRadius: 32,
        padding: 16,
    },
    footer: {
        alignItems: "center",
        marginTop: 32,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 4,
    },
    footerCopyright: {
        fontSize: 12,
        color: "#CBD5E1",
    },
});
