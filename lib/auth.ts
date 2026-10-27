import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { refundCredits } from "./credits";
import { getGoogleAuthProvider } from "./auth/google-auth";
import { createRegistrationBonusHooks, REGISTRATION_BONUS_CREDITS } from "./auth/registration-bonus";

const defaultTrustedOrigins = ["http://localhost:3000"];

const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : defaultTrustedOrigins;

const googleAuthProvider = getGoogleAuthProvider();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },
  ...(googleAuthProvider
    ? {
        socialProviders: {
          google: googleAuthProvider,
        },
      }
    : {}),

  trustedOrigins,

  databaseHooks: createRegistrationBonusHooks(async (userId) => {
    const result = await refundCredits(userId, REGISTRATION_BONUS_CREDITS, "registration_bonus");
    if (!result.success) {
      throw new Error(`Failed to grant registration bonus to user ${userId}`);
    }
  }),
});

export { hashPassword } from "better-auth/crypto";
