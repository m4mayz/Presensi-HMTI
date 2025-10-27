import { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "Supabase URL or Anon Key is missing. Please check your .env file."
    );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
