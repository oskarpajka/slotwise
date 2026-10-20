// Fake credentials for the throwaway e2e database only.
export const E2E_OWNER = {
  email: "owner@example.test",
  password: "e2e password long enough",
};

export const E2E_DATABASE = "slotwise_e2e";

// Not a real secret: it signs cookies on the local e2e server only.
export const E2E_AUTH_SECRET = "e2e-only-secret-0123456789abcdefghijklmnop";
