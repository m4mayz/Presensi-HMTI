import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

interface TeamMember {
    name: string;
    role: string;
    description: string;
    photo: any; // require() image
    instagram?: string;
    github?: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Faizal Rahman",
        role: "UI/UX Designer",
        description:
            "Merancang antarmuka yang intuitif dan user-friendly untuk memastikan pengalaman pengguna yang optimal dalam sistem presensi HMTI.",
        photo: require("@/assets/images/faizal.jpg"),
        instagram: "fzlrmn",
    },
    {
        name: "Akmal Zaidan Hibatullah",
        role: "Full Stack Mobile Developer",
        description:
            "Mengembangkan aplikasi mobile dengan React Native dan TypeScript, mengimplementasikan sistem QR Code attendance, dan integrasi database Supabase.",
        photo: require("@/assets/images/akmal.jpg"),
        instagram: "m4mayz",
        github: "m4mayz",
    },
];

export default function AboutPage() {
    const handleSocialPress = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error("Failed to open URL:", err)
        );
    };

    const renderTeamMember = (member: TeamMember, index: number) => (
        <View key={index} style={styles.memberCard}>
            {/* Photo */}
            <View style={styles.photoContainer}>
                <Image source={member.photo} style={styles.photo} />
            </View>

            {/* Info */}
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{member.role}</Text>
                </View>
                <Text style={styles.memberDescription}>
                    {member.description}
                </Text>

                {/* Social Media */}
                <View style={styles.socialContainer}>
                    {member.instagram && (
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() =>
                                handleSocialPress(
                                    `https://instagram.com/${member.instagram}`
                                )
                            }
                        >
                            <Ionicons
                                name="logo-instagram"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.socialText}>Instagram</Text>
                        </TouchableOpacity>
                    )}

                    {member.github && (
                        <TouchableOpacity
                            style={[styles.socialButton, styles.githubButton]}
                            onPress={() =>
                                handleSocialPress(
                                    `https://github.com/${member.github}`
                                )
                            }
                        >
                            <Ionicons
                                name="logo-github"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.socialText}>GitHub</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>
                <PageHeader title="Tentang Aplikasi" showBackButton />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* App Info Card */}
                    <View style={styles.appInfoCard}>
                        <View style={styles.appIconContainer}>
                            <Image
                                source={require("@/assets/images/icon.png")}
                                style={styles.appIcon}
                            />
                        </View>
                        <Text style={styles.appName}>Presensi HMTI</Text>
                        <Text style={styles.appVersion}>Version 1.0.0</Text>
                        <Text style={styles.appDescription}>
                            Aplikasi presensi berbasis QR Code untuk HMTI
                            (Himpunan Mahasiswa Teknik Informatika). Memudahkan
                            pencatatan kehadiran rapat dengan sistem QR Code
                            yang aman dan real-time.
                        </Text>
                    </View>

                    {/* Team Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tim Pengembang</Text>
                        {teamMembers.map((member, index) =>
                            renderTeamMember(member, index)
                        )}
                    </View>

                    {/* Tech Stack Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Teknologi</Text>
                        <View style={styles.techStack}>
                            <View style={styles.techItem}>
                                <Text style={styles.techName}>
                                    React Native
                                </Text>
                            </View>
                            <View style={styles.techItem}>
                                <Text style={styles.techName}>Expo</Text>
                            </View>
                            <View style={styles.techItem}>
                                <Text style={styles.techName}>TypeScript</Text>
                            </View>
                            <View style={styles.techItem}>
                                <Text style={styles.techName}>Supabase</Text>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © 2025 KOMINFO HMTI. Seluruh hak cipta.
                        </Text>
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
    appInfoCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    appIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    appName: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.bgLight.textColor,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 16,
    },
    appDescription: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.bgLight.textColor,
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    featureText: {
        fontSize: 14,
        color: Colors.bgLight.textColor,
        marginLeft: 12,
        flex: 1,
    },
    memberCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    photoContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    memberInfo: {
        alignItems: "center",
    },
    memberName: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.bgLight.textColor,
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: Colors.blue,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    roleText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#fff",
    },
    memberDescription: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 16,
    },
    socialContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E1306C", // Instagram pink
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    githubButton: {
        backgroundColor: "#24292E", // GitHub dark
    },
    socialText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    techStack: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    techItem: {
        backgroundColor: Colors.blue,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    techName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#fff",
    },
    footer: {
        alignItems: "center",
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        marginTop: 16,
    },
    footerText: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: "#94A3B8",
    },
});
