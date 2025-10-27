export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    profile_photo: string | null;
                    nim: string;
                    name: string;
                    divisi: string | null;
                    password: string;
                    can_create_meeting: boolean | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_photo?: string | null;
                    nim: string;
                    name: string;
                    divisi?: string | null;
                    password: string;
                    can_create_meeting?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_photo?: string | null;
                    nim?: string;
                    name?: string;
                    divisi?: string | null;
                    password?: string;
                    can_create_meeting?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            meetings: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    date: string;
                    start_time: string;
                    end_time: string;
                    location: string | null;
                    qr_code: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    date: string;
                    start_time: string;
                    end_time: string;
                    location?: string | null;
                    qr_code?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    date?: string;
                    start_time?: string;
                    end_time?: string;
                    location?: string | null;
                    qr_code?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "meetings_created_by_fkey";
                        columns: ["created_by"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            attendance: {
                Row: {
                    id: string;
                    meeting_id: string | null;
                    user_id: string | null;
                    check_in_time: string;
                    status: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    meeting_id?: string | null;
                    user_id?: string | null;
                    check_in_time?: string;
                    status?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    meeting_id?: string | null;
                    user_id?: string | null;
                    check_in_time?: string;
                    status?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "attendance_meeting_id_fkey";
                        columns: ["meeting_id"];
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "attendance_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            meeting_participants: {
                Row: {
                    id: string;
                    meeting_id: string | null;
                    user_id: string | null;
                    is_required: boolean | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    meeting_id?: string | null;
                    user_id?: string | null;
                    is_required?: boolean | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    meeting_id?: string | null;
                    user_id?: string | null;
                    is_required?: boolean | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "meeting_participants_meeting_id_fkey";
                        columns: ["meeting_id"];
                        referencedRelation: "meetings";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "meeting_participants_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T];

// Type aliases for each table
export type User = Tables<"users">;
export type Meeting = Tables<"meetings">;
export type Attendance = Tables<"attendance">;
export type MeetingParticipant = Tables<"meeting_participants">;

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
export type AttendanceInsert =
    Database["public"]["Tables"]["attendance"]["Insert"];
export type MeetingParticipantInsert =
    Database["public"]["Tables"]["meeting_participants"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type MeetingUpdate = Database["public"]["Tables"]["meetings"]["Update"];
export type AttendanceUpdate =
    Database["public"]["Tables"]["attendance"]["Update"];
export type MeetingParticipantUpdate =
    Database["public"]["Tables"]["meeting_participants"]["Update"];
