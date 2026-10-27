export const REGISTRATION_BONUS_CREDITS = 20;

// Runs after any user row is created, so email sign-up and Google OAuth both get the bonus.
export function createRegistrationBonusHooks(grantBonus: (userId: string) => Promise<void>) {
  return {
    user: {
      create: {
        after: async (user: { id: string }) => {
          await grantBonus(user.id);
        },
      },
    },
  };
}
