import PageHeader from "@/components/PageHeader";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface UserWithSelection extends User {
    isSelected: boolean;
    isAlreadyParticipant: boolean;
}

export default function AddParticipantsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserWithSelection[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithSelection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [creatorId, setCreatorId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDivisi, setSelectedDivisi] = useState<string>("all");
    const [divisiList, setDivisiList] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadData = async () => {
        try {
            // Fetch meeting info
            const { data: meeting, error: meetingError } = await supabase
                .from("meetings")
                .select("title, created_by")
                .eq("id", id)
                .single();

            if (meetingError) {
                console.error("Error fetching meeting:", meetingError);
                Alert.alert("Error", "Gagal memuat data rapat");
                return;
            }

            // Check if current user is creator
            if (meeting.created_by !== currentUser?.id) {
                Alert.alert(
                    "Akses Ditolak",
                    "Hanya pembuat rapat yang dapat menambah peserta",
                    [{ text: "OK", onPress: () => router.back() }]
                );
                return;
            }

            setMeetingTitle(meeting.title);
            setCreatorId(meeting.created_by);

            // Fetch all users
            const { data: allUsers, error: usersError } = await supabase
                .from("users")
                .select("*")
                .order("name", { ascending: true });

            if (usersError) {
                console.error("Error fetching users:", usersError);
                Alert.alert("Error", "Gagal memuat daftar user");
                return;
            }

            // Fetch current participants
            const { data: participants, error: participantsError } =
                await supabase
                    .from("meeting_participants")
                    .select("user_id")
                    .eq("meeting_id", id);

            if (participantsError) {
                console.error(
                    "Error fetching participants:",
                    participantsError
                );
            }

            const participantIds = new Set(
                participants?.map((p) => p.user_id) || []
            );

            // Map users with selection status
            const usersWithSelection: UserWithSelection[] =
                allUsers?.map((user) => ({
                    ...user,
                    isSelected: participantIds.has(user.id),
                    isAlreadyParticipant: participantIds.has(user.id),
                })) || [];

            setUsers(usersWithSelection);

            // Extract unique divisi
            const uniqueDivisi = Array.from(
                new Set(allUsers?.map((u) => u.divisi).filter(Boolean))
            ).sort();
            setDivisiList(uniqueDivisi as string[]);

            // Initial filter
            filterUsers(usersWithSelection, "", "all");
        } catch (error) {
            console.error("Error loading data:", error);
            Alert.alert("Error", "Terjadi kesalahan saat memuat data");
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = (
        userList: UserWithSelection[],
        search: string,
        divisi: string
    ) => {
        let filtered = userList;

        // Filter by search query (name or NIM)
        if (search.trim()) {
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(search.toLowerCase()) ||
                    user.nim?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by divisi
        if (divisi !== "all") {
            filtered = filtered.filter((user) => user.divisi === divisi);
        }

        // Sort: selected users first, then by name
        filtered.sort((a, b) => {
            // First, sort by selection status (selected first)
            if (a.isSelected && !b.isSelected) return -1;
            if (!a.isSelected && b.isSelected) return 1;

            // If same selection status, sort by name
            return (a.name || "").localeCompare(b.name || "");
        });

        setFilteredUsers(filtered);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        filterUsers(users, text, selectedDivisi);
    };

    const handleDivisiFilter = (divisi: string) => {
        setSelectedDivisi(divisi);
        filterUsers(users, searchQuery, divisi);
    };

    const toggleUserSelection = (userId: string) => {
        // Prevent deselecting the meeting creator
        if (userId === creatorId) {
            Alert.alert(
                "Tidak Dapat Dihapus",
                "Pembuat rapat tidak dapat dihapus dari daftar peserta"
            );
            return;
        }

        const updatedUsers = users.map((user) =>
            user.id === userId
                ? { ...user, isSelected: !user.isSelected }
                : user
        );
        setUsers(updatedUsers);
        filterUsers(updatedUsers, searchQuery, selectedDivisi);
    };

    const handleSave = async () => {
        const usersToAdd = users.filter(
            (user) => user.isSelected && !user.isAlreadyParticipant
        );
        const usersToRemove = users.filter(
            (user) => !user.isSelected && user.isAlreadyParticipant
        );

        if (usersToAdd.length === 0 && usersToRemove.length === 0) {
            Alert.alert("Info", "Tidak ada perubahan yang perlu disimpan");
            return;
        }

        let message = "";
        if (usersToAdd.length > 0 && usersToRemove.length > 0) {
            message = `Tambahkan ${usersToAdd.length} peserta dan hapus ${usersToRemove.length} peserta?`;
        } else if (usersToAdd.length > 0) {
            message = `Tambahkan ${usersToAdd.length} peserta ke rapat ini?`;
        } else {
            message = `Hapus ${usersToRemove.length} peserta dari rapat ini?`;
        }

        Alert.alert("Konfirmasi", message, [
            { text: "Batal", style: "cancel" },
            {
                text: "Simpan",
                onPress: async () => {
                    setSaving(true);
                    try {
                        // Add new participants
                        if (usersToAdd.length > 0) {
                            const participantsToAdd = usersToAdd.map(
                                (user) => ({
                                    meeting_id: id,
                                    user_id: user.id,
                                })
                            );

                            const { error: addError } = await supabase
                                .from("meeting_participants")
                                .insert(participantsToAdd);

                            if (addError) {
                                console.error(
                                    "Error adding participants:",
                                    addError
                                );
                                Alert.alert(
                                    "Error",
                                    "Gagal menambahkan peserta: " +
                                        addError.message
                                );
                                setSaving(false);
                                return;
                            }
                        }

                        // Remove participants
                        if (usersToRemove.length > 0) {
                            const userIdsToRemove = usersToRemove.map(
                                (user) => user.id
                            );

                            const { error: removeError } = await supabase
                                .from("meeting_participants")
                                .delete()
                                .eq("meeting_id", id)
                                .in("user_id", userIdsToRemove);

                            if (removeError) {
                                console.error(
                                    "Error removing participants:",
                                    removeError
                                );
                                Alert.alert(
                                    "Error",
                                    "Gagal menghapus peserta: " +
                                        removeError.message
                                );
                                setSaving(false);
                                return;
                            }

                            // Also remove their attendance records
                            const { error: attendanceError } = await supabase
                                .from("attendance")
                                .delete()
                                .eq("meeting_id", id)
                                .in("user_id", userIdsToRemove);

                            if (attendanceError) {
                                console.error(
                                    "Error removing attendance:",
                                    attendanceError
                                );
                                // Don't show error to user, participants are already removed
                            }
                        }

                        let successMessage = "Perubahan berhasil disimpan!";
                        if (usersToAdd.length > 0 && usersToRemove.length > 0) {
                            successMessage = `${usersToAdd.length} peserta ditambahkan dan ${usersToRemove.length} peserta dihapus!`;
                        } else if (usersToAdd.length > 0) {
                            successMessage = `${usersToAdd.length} peserta berhasil ditambahkan!`;
                        } else {
                            successMessage = `${usersToRemove.length} peserta berhasil dihapus!`;
                        }

                        Alert.alert("Berhasil", successMessage, [
                            {
                                text: "OK",
                                onPress: () => router.back(),
                            },
                        ]);
                    } catch (error) {
                        console.error("Error saving changes:", error);
                        Alert.alert(
                            "Error",
                            "Terjadi kesalahan saat menyimpan data"
                        );
                    } finally {
                        setSaving(false);
                    }
                },
            },
        ]);
    };

    const getChangesCount = () => {
        const toAdd = users.filter(
            (user) => user.isSelected && !user.isAlreadyParticipant
        ).length;
        const toRemove = users.filter(
            (user) => !user.isSelected && user.isAlreadyParticipant
        ).length;
        return toAdd + toRemove;
    };

    const handleSelectAll = () => {
        // Select all users in current filtered list
        const filteredUserIds = new Set(filteredUsers.map((u) => u.id));
        const updatedUsers = users.map((user) =>
            filteredUserIds.has(user.id) ? { ...user, isSelected: true } : user
        );
        setUsers(updatedUsers);
        filterUsers(updatedUsers, searchQuery, selectedDivisi);
    };

    const handleDeselectAll = () => {
        // Deselect all users in current filtered list except the creator
        const filteredUserIds = new Set(filteredUsers.map((u) => u.id));
        const updatedUsers = users.map((user) =>
            filteredUserIds.has(user.id) && user.id !== creatorId
                ? { ...user, isSelected: false }
                : user
        );
        setUsers(updatedUsers);
        filterUsers(updatedUsers, searchQuery, selectedDivisi);
    };

    const areAllFilteredSelected = () => {
        return (
            filteredUsers.length > 0 &&
            filteredUsers.every((user) => user.isSelected)
        );
    };

    const renderUserItem = ({ item }: { item: UserWithSelection }) => {
        const isCreator = item.id === creatorId;

        return (
            <TouchableOpacity
                style={[styles.userItem, isCreator && styles.userItemDisabled]}
                onPress={() => toggleUserSelection(item.id)}
                disabled={isCreator}
            >
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        {item.profile_photo ? (
                            <View style={styles.avatar}>
                                {/* Could use Image here if needed */}
                                <Text style={styles.avatarText}>
                                    {item.name?.charAt(0).toUpperCase() || "?"}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.name?.charAt(0).toUpperCase() || "?"}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.userDetails}>
                        <View style={styles.userNameRow}>
                            <Text style={styles.userName}>{item.name}</Text>
                            {isCreator && (
                                <View style={styles.creatorBadge}>
                                    <Text style={styles.creatorBadgeText}>
                                        Pembuat
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNim}>NIM: {item.nim}</Text>
                        {item.divisi && (
                            <Text style={styles.userDivisi}>{item.divisi}</Text>
                        )}
                    </View>
                </View>

                <View
                    style={[
                        styles.checkbox,
                        item.isSelected && styles.checkboxChecked,
                        isCreator && styles.checkboxDisabled,
                    ]}
                >
                    {item.isSelected && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <PageHeader title="Kelola Peserta" showBackButton />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.blue} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PageHeader title="Kelola Peserta" showBackButton />

            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#64748B"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama atau NIM..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Divisi Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedDivisi === "all" && styles.filterChipActive,
                        ]}
                        onPress={() => handleDivisiFilter("all")}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedDivisi === "all" &&
                                    styles.filterChipTextActive,
                            ]}
                        >
                            Semua
                        </Text>
                    </TouchableOpacity>
                    {divisiList.map((divisi) => (
                        <TouchableOpacity
                            key={divisi}
                            style={[
                                styles.filterChip,
                                selectedDivisi === divisi &&
                                    styles.filterChipActive,
                            ]}
                            onPress={() => handleDivisiFilter(divisi)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedDivisi === divisi &&
                                        styles.filterChipTextActive,
                                ]}
                            >
                                {divisi}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* User List */}
                <View style={styles.listHeader}>
                    <Text style={styles.listHeaderText}>
                        {filteredUsers.length} dari {users.length} user
                    </Text>
                    {filteredUsers.length > 0 && (
                        <TouchableOpacity
                            style={styles.selectAllButton}
                            onPress={
                                areAllFilteredSelected()
                                    ? handleDeselectAll
                                    : handleSelectAll
                            }
                        >
                            <Ionicons
                                name={
                                    areAllFilteredSelected()
                                        ? "checkbox"
                                        : "checkbox-outline"
                                }
                                size={16}
                                color={Colors.blue}
                            />
                            <Text style={styles.selectAllText}>
                                {areAllFilteredSelected()
                                    ? "Batal Pilih Semua"
                                    : "Pilih Semua"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Save Button */}
            {getChangesCount() > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            saving && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.saveButtonText}>
                                    Simpan Perubahan
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLight.backgroundColor,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: "center",
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: "#64748B",
        marginBottom: 2,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E40AF",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 15,
        color: Colors.bgLight.textColor,
    },
    filterContainer: {
        height: 40,
        marginBottom: 16,
        flexGrow: 0,
        flexShrink: 0,
    },
    filterContent: {
        flexDirection: "row",
        paddingRight: 20,
        alignItems: "center",
    },
    filterChip: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        height: 36,
        justifyContent: "center",
    },
    filterChipActive: {
        backgroundColor: Colors.blue,
        borderColor: Colors.blue,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748B",
    },
    filterChipTextActive: {
        color: "#fff",
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    listHeaderText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
    },
    selectAllButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: "#EFF6FF",
    },
    selectAllText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.blue,
    },
    listContent: {
        paddingBottom: 100,
    },
    userItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    userItemDisabled: {
        opacity: 0.6,
        backgroundColor: "#F8FAFC",
    },
    userInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
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
    userDetails: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.bgLight.textColor,
    },
    creatorBadge: {
        backgroundColor: Colors.blue,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    creatorBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#fff",
    },
    userNim: {
        fontSize: 13,
        color: "#64748B",
    },
    userDivisi: {
        fontSize: 12,
        color: Colors.blue,
        fontWeight: "500",
        marginTop: 2,
    },
    participantLabel: {
        fontSize: 11,
        color: Colors.green,
        fontWeight: "500",
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    checkboxDisabled: {
        backgroundColor: "#E2E8F0",
        borderColor: "#CBD5E1",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        paddingBottom: 30,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    saveButton: {
        backgroundColor: Colors.green,
        borderRadius: 12,
        height: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    saveButtonDisabled: {
        backgroundColor: "#94A3B8",
        elevation: 0,
        shadowOpacity: 0,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 8,
    },
});
