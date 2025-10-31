import PageHeader from "@/components/PageHeader";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import {
    pickImageFromGallery,
    takePhoto,
    updateUserProfilePhoto,
    uploadProfilePhoto,
} from "@/lib/uploadPhoto";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {
    const { user, signOut, refreshUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

    const handleLogout = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    const handleChangePassword = () => {
        router.push("/change-password");
    };

    const handleContactAdmin = () => {
        const whatsappNumber = "6282111856806"; // Nomor admin
        const message = "Halo Admin ganteng, hamba butuh bantuan";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;
        Linking.openURL(url);
    };

    const handlePhotoUpload = async (imageUri: string) => {
        if (!user?.id) return;

        setUploading(true);

        try {
            // Upload to Supabase Storage
            const photoUrl = await uploadProfilePhoto(imageUri, user.id);
            if (!photoUrl) {
                setUploading(false);
                return;
            }

            // Update database
            const success = await updateUserProfilePhoto(user.id, photoUrl);
            if (!success) {
                setUploading(false);
                return;
            }

            // Update local state
            setLocalPhotoUri(photoUrl);

            // Update user in AsyncStorage
            const updatedUser = { ...user, profile_photo: photoUrl };
            await AsyncStorage.setItem(
                "@presensi_hmti_user",
                JSON.stringify(updatedUser)
            );

            // Refresh user context
            await refreshUser();

            Alert.alert("Berhasil", "Foto profil berhasil diperbarui");
        } catch (error) {
            console.error("Error in handlePhotoUpload:", error);
            Alert.alert("Error", "Gagal mengupload foto");
        } finally {
            setUploading(false);
        }
    };

    const showPhotoOptions = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ["Batal", "Ambil Foto", "Pilih dari Galeri"],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        const uri = await takePhoto();
                        if (uri) handlePhotoUpload(uri);
                    } else if (buttonIndex === 2) {
                        const uri = await pickImageFromGallery();
                        if (uri) handlePhotoUpload(uri);
                    }
                }
            );
        } else {
            Alert.alert(
                "Pilih Foto Profil",
                "Pilih sumber foto",
                [
                    {
                        text: "Batal",
                        style: "cancel",
                    },
                    {
                        text: "Ambil Foto",
                        onPress: async () => {
                            const uri = await takePhoto();
                            if (uri) handlePhotoUpload(uri);
                        },
                    },
                    {
                        text: "Pilih dari Galeri",
                        onPress: async () => {
                            const uri = await pickImageFromGallery();
                            if (uri) handlePhotoUpload(uri);
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <PageHeader title="Profil" showBackButton />

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {localPhotoUri || user?.profile_photo ? (
                            <Image
                                source={{
                                    uri: (localPhotoUri ||
                                        user?.profile_photo) as string,
                                }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || "?"}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={showPhotoOptions}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons
                                    name="camera"
                                    size={16}
                                    color="#fff"
                                />
                            )}
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
                        icon="information-circle-outline"
                        iconColor={Colors.blue}
                        title="Tentang Aplikasi"
                        onPress={() => router.push("/about")}
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
            </ScrollView>
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
        marginTop: 50,
    },
    footerText: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 4,
    },
    footerCopyright: {
        fontSize: 12,
        color: "#94A3B8",
    },
});
