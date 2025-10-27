/**
 * Meeting Participants Helper Functions
 * Utility functions untuk mengelola peserta rapat
 */

import { MeetingParticipant, User } from "@/types/database.types";
import { supabase } from "./supabase";

export interface ParticipantWithUser extends MeetingParticipant {
    user?: User;
}

/**
 * Get all participants for a specific meeting
 */
export const getMeetingParticipants = async (
    meetingId: string
): Promise<ParticipantWithUser[]> => {
    const { data, error } = await supabase
        .from("meeting_participants")
        .select(
            `
            *,
            user:users(*)
        `
        )
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching participants:", error);
        return [];
    }

    return (data || []) as ParticipantWithUser[];
};

/**
 * Check if a user must attend a specific meeting
 */
export const checkMustAttend = async (
    meetingId: string,
    userId: string
): Promise<boolean> => {
    const { data, error } = await supabase
        .from("meeting_participants")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
        .single();

    if (error) {
        return false;
    }

    return !!data;
};

/**
 * Add a single participant to a meeting
 */
export const addParticipant = async (
    meetingId: string,
    userId: string,
    isRequired: boolean = true
): Promise<boolean> => {
    const { error } = await supabase.from("meeting_participants").insert({
        meeting_id: meetingId,
        user_id: userId,
        is_required: isRequired,
    });

    if (error) {
        console.error("Error adding participant:", error);
        return false;
    }

    return true;
};

/**
 * Add multiple participants to a meeting
 */
export const addMultipleParticipants = async (
    meetingId: string,
    userIds: string[],
    isRequired: boolean = true
): Promise<boolean> => {
    const participants = userIds.map((userId) => ({
        meeting_id: meetingId,
        user_id: userId,
        is_required: isRequired,
    }));

    const { error } = await supabase
        .from("meeting_participants")
        .insert(participants);

    if (error) {
        console.error("Error adding participants:", error);
        return false;
    }

    return true;
};

/**
 * Remove a participant from a meeting
 */
export const removeParticipant = async (
    meetingId: string,
    userId: string
): Promise<boolean> => {
    const { error } = await supabase
        .from("meeting_participants")
        .delete()
        .eq("meeting_id", meetingId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error removing participant:", error);
        return false;
    }

    return true;
};

/**
 * Get attendance statistics for a meeting
 */
export const getAttendanceStats = async (
    meetingId: string
): Promise<{
    totalParticipants: number;
    totalAttended: number;
    attendanceRate: number;
    notAttended: ParticipantWithUser[];
}> => {
    // Get all participants
    const participants = await getMeetingParticipants(meetingId);

    // Get attendance records
    const { data: attendance } = await supabase
        .from("attendance")
        .select("user_id")
        .eq("meeting_id", meetingId);

    const attendedUserIds = new Set(attendance?.map((a) => a.user_id) || []);

    const totalParticipants = participants.length;
    const totalAttended = attendedUserIds.size;
    const attendanceRate =
        totalParticipants > 0
            ? Math.round((totalAttended / totalParticipants) * 100)
            : 0;

    const notAttended = participants.filter(
        (p) => p.user_id && !attendedUserIds.has(p.user_id)
    );

    return {
        totalParticipants,
        totalAttended,
        attendanceRate,
        notAttended,
    };
};

/**
 * Get meetings where user is a participant
 */
export const getUserMeetings = async (userId: string) => {
    const { data, error } = await supabase
        .from("meeting_participants")
        .select(
            `
            *,
            meeting:meetings(*)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user meetings:", error);
        return [];
    }

    return data?.map((item: any) => item.meeting) || [];
};

/**
 * Check if user has permission to view meeting
 * (either they're a participant or the creator)
 */
export const canViewMeeting = async (
    meetingId: string,
    userId: string
): Promise<boolean> => {
    // Check if user is the creator
    const { data: meeting } = await supabase
        .from("meetings")
        .select("created_by")
        .eq("id", meetingId)
        .single();

    if (meeting?.created_by === userId) {
        return true;
    }

    // Check if user is a participant
    return await checkMustAttend(meetingId, userId);
};
