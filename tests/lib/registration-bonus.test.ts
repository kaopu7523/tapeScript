// @vitest-environment node
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createRegistrationBonusHooks } from "@/lib/auth/registration-bonus";

function createTestAuth(grantBonus: (userId: string) => Promise<void>) {
  return betterAuth({
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    secret: "test-secret-that-is-at-least-32-characters-long",
    baseURL: "http://localhost:3000",
    emailAndPassword: { enabled: true },
    databaseHooks: createRegistrationBonusHooks(grantBonus),
  });
}

describe("registration bonus", () => {
  it("grants the bonus to users created through Google OAuth", async () => {
    const grantBonus = vi.fn(async () => {});
    const auth = createTestAuth(grantBonus);
    const ctx = await auth.$context;

    const { user } = await ctx.internalAdapter.createOAuthUser(
      { email: "google-user@example.com", name: "Google User", emailVerified: true },
      { providerId: "google", accountId: "google-account-1" },
    );

    expect(grantBonus).toHaveBeenCalledTimes(1);
    expect(grantBonus).toHaveBeenCalledWith(user.id);
  });

  it("grants the bonus to users created through email sign-up", async () => {
    const grantBonus = vi.fn(async () => {});
    const auth = createTestAuth(grantBonus);

    const result = await auth.api.signUpEmail({
      body: { email: "email-user@example.com", password: "password-123456", name: "Email User" },
    });

    expect(grantBonus).toHaveBeenCalledTimes(1);
    expect(grantBonus).toHaveBeenCalledWith(result.user.id);
  });
});
