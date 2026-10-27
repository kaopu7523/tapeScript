import { loginSchema, signupSchema } from "@/features/auth/schemas";

describe("form schemas", () => {
  it("prefers the required email error when auth email fields are blank", () => {
    const loginResult = loginSchema.safeParse({
      email: "   ",
      password: "secret",
    });
    const signupResult = signupSchema.safeParse({
      name: "Alice",
      email: "   ",
      password: "secret",
    });

    expect(loginResult.success).toBe(false);
    expect(signupResult.success).toBe(false);
    expect(loginResult.error.issues[0]?.message).toBe("Please enter email");
    expect(signupResult.error.issues[0]?.message).toBe("Please enter email");
  });
});
