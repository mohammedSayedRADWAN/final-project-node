import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";
import { sendEmail } from "./email.service.js";

/**
 * @description Business logic for Authentication
 */
class AuthService {
    /**
     * @description Generate Access and Refresh Tokens
     */
    static async generateAccessAndRefreshTokens(userId) {
        try {
            const user = await User.findById(userId);
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "Something went wrong while generating tokens");
        }
    }

    /**
     * @description Register a new user
     */
    static async registerUser({ fullName, email, username, password, phoneNumber, role }) {
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        const user = await User.create({
            fullName,
            email,
            username,
            password,
            phoneNumber,
            role: role || "Customer",
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        // Send verification email
        try {
            const verificationUrl = `${process.env.APP_URL || 'http://localhost:8000'}/api/v1/auth/verify-email/${verificationToken}`;
            
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Welcome to Our Platform!</h2>
                    <p style="font-size: 16px; color: #555;">Hi ${createdUser.fullName},</p>
                    <p style="font-size: 16px; color: #555;">Thank you for registering. To complete your sign-up, please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                    </div>
                    <p style="font-size: 14px; color: #888;">If the button doesn't work, you can also click the link below or copy and paste it into your browser:</p>
                    <p style="font-size: 14px; color: #007bff; word-break: break-all;">${verificationUrl}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #aaa; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `;

            await sendEmail({
                email: createdUser.email,
                subject: "Verify Your Email Address",
                message: `Hi ${createdUser.fullName}, please verify your email by clicking: ${verificationUrl}`,
                html: htmlContent
            });
        } catch (error) {
            console.error("Email sending failed:", error.message);
            // Don't throw error here to allow registration to proceed even if email fails in dev
        }

        return createdUser;
    }

    /**
     * @description Verify email using token
     */
    static async verifyEmail(token) {
        if (!token) {
            throw new ApiError(400, "Verification token is required");
        }

        // Trim token to avoid issues with copy-pasting whitespace
        const cleanToken = token.trim();
        const hashedToken = crypto.createHash("sha256").update(cleanToken).digest("hex");

        console.log("Searching for user with hashed token:", hashedToken);

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: new Date() }
        });

        if (!user) {
            console.error("No user found with this token or token has expired.");
            throw new ApiError(400, "Invalid or expired verification token");
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;

        await user.save({ validateBeforeSave: false });

        return true;
    }

    /**
     * @description Login user
     */
    static async loginUser({ email, username, phoneNumber, password }) {
        // Find user by email, username, or phone
        const user = await User.findOne({
            $or: [
                { email: email || "" },
                { username: username || "" },
                { phoneNumber: phoneNumber || "" }
            ]
        });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return { user: loggedInUser, accessToken, refreshToken };
    }

    /**
     * @description Logout user
     */
    static async logoutUser(userId) {
        await User.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    refreshToken: 1 // remove refresh token from db
                }
            },
            {
                new: true
            }
        );
    }

    /**
     * @description Refresh Access Token
     */
    static async refreshAccessToken(oldRefreshToken) {
        try {
            const decodedToken = jwt.verify(
                oldRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );

            const user = await User.findById(decodedToken?._id);

            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }

            if (oldRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }

            const { accessToken, refreshToken: newRefreshToken } = await this.generateAccessAndRefreshTokens(user._id);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }
}

export { AuthService };
