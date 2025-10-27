import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { supabase } from "./supabase";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
        Alert.alert(
            "Permission Required",
            "Camera permission is required to take photos"
        );
        return false;
    }
    return true;
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert(
            "Permission Required",
            "Photo library permission is required to select photos"
        );
        return false;
    }
    return true;
};

/**
 * Compress image if size exceeds max file size
 */
const compressImage = async (uri: string): Promise<string> => {
    let quality = 0.8;
    let compressedUri = uri;

    // Get initial file size using FileSystem
    const fileInfo = await FileSystem.getInfoAsync(uri);
    let fileSize = fileInfo.exists ? (fileInfo as any).size : 0;

    // Compress until file size is under MAX_FILE_SIZE
    while (fileSize > MAX_FILE_SIZE && quality > 0.1) {
        const result = await ImageManipulator.manipulateAsync(
            compressedUri,
            [{ resize: { width: 1000 } }], // Resize to max width 1000px
            {
                compress: quality,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );

        const compressedInfo = await FileSystem.getInfoAsync(result.uri);
        fileSize = compressedInfo.exists ? (compressedInfo as any).size : 0;
        compressedUri = result.uri;

        quality -= 0.1;
    }

    return compressedUri;
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
    try {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return null;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images" as any,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to pick image");
        return null;
    }
};

/**
 * Take photo from camera
 */
export const takePhoto = async (): Promise<string | null> => {
    try {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return null;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo");
        return null;
    }
};

/**
 * Delete old profile photo from storage
 */
const deleteOldPhoto = async (userId: string): Promise<void> => {
    try {
        // Fixed filename for user
        const fileName = `${userId}.jpg`;

        // Try to delete if exists (will fail silently if doesn't exist)
        const { error } = await supabase.storage
            .from("profile-photos")
            .remove([fileName]);

        if (error && error.message !== "Object not found") {
            console.log("Error deleting old photo:", error);
        }
    } catch (error) {
        console.log("Could not delete old photo:", error);
        // Don't throw error, continue with upload
    }
};

/**
 * Upload image to Supabase Storage
 */
export const uploadProfilePhoto = async (
    uri: string,
    userId: string
): Promise<string | null> => {
    try {
        // Compress image if needed
        const compressedUri = await compressImage(uri);

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(compressedUri);
        const fileSize = fileInfo.exists ? (fileInfo as any).size : 0;

        // Check final file size
        if (fileSize > MAX_FILE_SIZE) {
            Alert.alert(
                "File Too Large",
                "Image file is too large even after compression. Please try a different image."
            );
            return null;
        }

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(compressedUri, {
            encoding: "base64" as any,
        });

        // Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64);

        // Delete old photo first
        await deleteOldPhoto(userId);

        // Fixed filename for user (no timestamp, always same name)
        const fileExt = "jpg";
        const fileName = `${userId}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from("profile-photos")
            .upload(filePath, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: true,
            });

        if (error) {
            console.error("Upload error:", error);
            Alert.alert("Upload Failed", error.message);
            return null;
        }

        // Get public URL with cache busting parameter
        const timestamp = Date.now();
        const {
            data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

        // Add timestamp to URL to bust cache
        const urlWithTimestamp = `${publicUrl}?t=${timestamp}`;

        return urlWithTimestamp;
    } catch (error) {
        console.error("Error uploading photo:", error);
        Alert.alert("Error", "Failed to upload photo");
        return null;
    }
};

/**
 * Update user profile photo in database
 */
export const updateUserProfilePhoto = async (
    userId: string,
    photoUrl: string
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("users")
            .update({
                profile_photo: photoUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            console.error("Database update error:", error);
            Alert.alert("Update Failed", error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error updating profile photo:", error);
        Alert.alert("Error", "Failed to update profile photo");
        return false;
    }
};
