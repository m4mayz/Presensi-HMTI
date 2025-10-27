import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const LoginPage: React.FC = () => {
    const [nim, setNim] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!nim || !password) {
            Alert.alert("Error", "Silakan isi NIM dan password");
            return;
        }

        try {
            setLoading(true);
            await signIn(nim, password);
            router.replace("/(tabs)/home");
        } catch (error: any) {
            Alert.alert("Login Gagal", error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            "Lupa Password",
            "Silakan hubungi admin untuk mereset password Anda",
            [
                {
                    text: "Batal",
                    style: "cancel",
                },
                {
                    text: "Hubungi Admin",
                    onPress: () => {
                        const adminWhatsApp =
                            process.env.EXPO_PUBLIC_ADMIN_WHATSAPP ||
                            "6282111856806";
                        const message = encodeURIComponent(
                            "Halo Admin, saya lupa password untuk NIM: " + nim
                        );
                        const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${message}`;

                        Linking.canOpenURL(whatsappUrl)
                            .then((supported) => {
                                if (supported) {
                                    Linking.openURL(whatsappUrl);
                                } else {
                                    Alert.alert(
                                        "Error",
                                        "WhatsApp tidak tersedia di perangkat ini"
                                    );
                                }
                            })
                            .catch((err) => {
                                Alert.alert("Error", "Gagal membuka WhatsApp");
                                console.error("Error opening WhatsApp:", err);
                            });
                    },
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>Presensi Rapat</Text>
                <Text style={styles.subtitle}>
                    Silakan login dengan NIM Anda
                </Text>

                {/* Login Form */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>NIM</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan NIM"
                            placeholderTextColor="#9CA3AF"
                            value={nim}
                            onChangeText={setNim}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            loading && styles.loginButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? "Loading..." : "Login"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotPassword}>
                            Lupa password?{" "}
                            <Text style={styles.adminLink}>Hubungi admin</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    logoContainer: {
        marginBottom: 24,
        alignItems: "center",
        borderRadius: 40,
        elevation: 15,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 32,
    },
    formContainer: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F3F4F6",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.bgLight.textColor,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    loginButton: {
        backgroundColor: Colors.button.enable,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonDisabled: {
        backgroundColor: Colors.button.disable,
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    forgotPassword: {
        textAlign: "center",
        fontSize: 14,
        color: "#6B7280",
    },
    adminLink: {
        color: Colors.blue,
        fontWeight: "600",
    },
});

export default LoginPage;
