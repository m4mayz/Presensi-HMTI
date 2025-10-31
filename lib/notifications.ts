import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync(): Promise<
    string | null
> {
    let token: string | null = null;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#3B82F6",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Failed to get push token for push notification!");
            return null;
        }

        // Store permission status
        await AsyncStorage.setItem(
            "notificationPermission",
            finalStatus === "granted" ? "true" : "false"
        );

        // For local notifications, we don't need push token
        // but if you want to use Expo Push Notifications, uncomment:
        // token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        console.log("Must use physical device for Push Notifications");
    }

    return token;
}

/**
 * Schedule notification when user is added to meeting
 */
export async function scheduleParticipantAddedNotification(
    meetingTitle: string,
    meetingDate: string,
    meetingTime: string
) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Anda Ditambahkan ke Rapat 📅",
                body: `${meetingTitle}\n${meetingDate} pukul ${meetingTime}`,
                data: { type: "participant_added", meetingTitle },
                sound: true,
            },
            trigger: null, // Send immediately
        });
    } catch (error) {
        console.error("Error scheduling participant notification:", error);
    }
}

/**
 * Schedule reminder 10 minutes before meeting ends (if not attended)
 */
export async function schedule10MinuteReminderNotification(
    meetingId: string,
    meetingTitle: string,
    endDateTime: Date
) {
    try {
        // Calculate 10 minutes before end time
        const reminderTime = new Date(endDateTime.getTime() - 10 * 60 * 1000);

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⚠️ Rapat Akan Segera Berakhir!",
                    body: `${meetingTitle}\nAnda belum presensi! Segera scan QR Code.`,
                    data: {
                        type: "10_minute_reminder",
                        meetingId,
                        meetingTitle,
                    },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminderTime,
                },
            });

            // Store notification identifier to cancel later if needed
            await AsyncStorage.setItem(`reminder_${meetingId}`, identifier);

            return identifier;
        }
    } catch (error) {
        console.error("Error scheduling 10-minute reminder:", error);
    }
    return null;
}

/**
 * Schedule notification when user misses a meeting
 */
export async function scheduleMissedMeetingNotification(
    meetingId: string,
    meetingTitle: string,
    endDateTime: Date
) {
    try {
        // Schedule notification for when meeting ends
        if (endDateTime > new Date()) {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🔴 Rapat Terlewat",
                    body: `${meetingTitle}\nAnda tidak hadir di rapat ini.`,
                    data: {
                        type: "missed_meeting",
                        meetingId,
                        meetingTitle,
                    },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: endDateTime,
                },
            });

            // Store notification identifier
            await AsyncStorage.setItem(`missed_${meetingId}`, identifier);

            return identifier;
        }
    } catch (error) {
        console.error("Error scheduling missed meeting notification:", error);
    }
    return null;
}

/**
 * Cancel scheduled notifications for a meeting (when user attends)
 */
export async function cancelMeetingNotifications(meetingId: string) {
    try {
        // Cancel 10-minute reminder
        const reminderIdentifier = await AsyncStorage.getItem(
            `reminder_${meetingId}`
        );
        if (reminderIdentifier) {
            await Notifications.cancelScheduledNotificationAsync(
                reminderIdentifier
            );
            await AsyncStorage.removeItem(`reminder_${meetingId}`);
        }

        // Cancel missed meeting notification
        const missedIdentifier = await AsyncStorage.getItem(
            `missed_${meetingId}`
        );
        if (missedIdentifier) {
            await Notifications.cancelScheduledNotificationAsync(
                missedIdentifier
            );
            await AsyncStorage.removeItem(`missed_${meetingId}`);
        }
    } catch (error) {
        console.error("Error canceling meeting notifications:", error);
    }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications() {
    try {
        const notifications =
            await Notifications.getAllScheduledNotificationsAsync();
        return notifications;
    } catch (error) {
        console.error("Error getting scheduled notifications:", error);
        return [];
    }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error("Error canceling all notifications:", error);
    }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status === "granted";
    } catch (error) {
        console.error("Error checking notification permissions:", error);
        return false;
    }
}
