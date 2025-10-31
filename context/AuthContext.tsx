import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (nim: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

const AUTH_STORAGE_KEY = "@presensi_hmti_user";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        loadUserSession();
    }, []);

    const loadUserSession = async () => {
        try {
            const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Error loading session:", error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (nim: string, password: string) => {
        try {
            // Query user from database
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("nim", nim)
                .single();

            if (error || !data) {
                throw new Error("NIM atau password salah");
            }

            // Verify password (plain text comparison for now)
            // TODO: Implement proper password hashing with bcrypt
            if (data.password !== password) {
                throw new Error("NIM atau password salah");
            }

            // Save user session
            const userWithoutPassword = {
                ...data,
                password: undefined, // Don't store password in session
            };

            await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify(userWithoutPassword)
            );

            setUser(data);

            // Request notification permissions after successful login
            try {
                await registerForPushNotificationsAsync();
            } catch (notifError) {
                console.error(
                    "Error requesting notification permission:",
                    notifError
                );
                // Don't throw error, let user continue using app
            }
        } catch (error: any) {
            throw new Error(error.message || "Login gagal");
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
        } catch (error: any) {
            throw new Error(error.message || "Logout gagal");
        }
    };

    const refreshUser = async () => {
        try {
            const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (savedUser) {
                const userData = JSON.parse(savedUser);

                // Fetch latest user data from database
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userData.id)
                    .single();

                if (error || !data) {
                    console.error("Error fetching user data:", error);
                    // Fallback to saved user if query fails
                    setUser(userData);
                    return;
                }

                // Update session with fresh data (without password)
                const userWithoutPassword = {
                    ...data,
                    password: undefined,
                };

                await AsyncStorage.setItem(
                    AUTH_STORAGE_KEY,
                    JSON.stringify(userWithoutPassword)
                );

                setUser(data);
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
