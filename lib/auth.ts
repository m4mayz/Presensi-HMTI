/**
 * Authentication utilities
 *
 * Note: For production, implement proper password hashing with bcrypt
 * Currently using plain text for development purposes
 */

/**
 * Hash password using bcrypt (TODO: Implement)
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    // TODO: Implement bcrypt hashing
    // const bcrypt = require('bcryptjs');
    // const salt = await bcrypt.genSalt(10);
    // return await bcrypt.hash(password, salt);

    // For now, return plain text (NOT SECURE FOR PRODUCTION)
    return password;
};

/**
 * Compare password with hash (TODO: Implement)
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if passwords match
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    // TODO: Implement bcrypt comparison
    // const bcrypt = require('bcryptjs');
    // return await bcrypt.compare(password, hash);

    // For now, compare plain text (NOT SECURE FOR PRODUCTION)
    return password === hash;
};
