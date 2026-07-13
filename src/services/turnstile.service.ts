export interface TurnstileVerificationResult {
  success: boolean;
  errorCodes?: string[];
  message?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  action?: string
): Promise<TurnstileVerificationResult> {
  // Use mocked provider specific to the test scope
  if (process.env.QA_MODE === "true") {
    if (!token) {
      return { success: false, message: "Security verification token is missing.", errorCodes: ["missing-input-response"] };
    }
    if (token === "VALID_MOCK_TOKEN") {
      return { success: true };
    }
    return { success: false, message: "Mock verification failed", errorCodes: ["invalid-mock-token"] };
  }

  // If Turnstile is explicitly disabled via env, we pass.
  // We strictly check the environment variable.
  if (process.env.TURNSTILE_ENABLED === "false") {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      message: "Security verification token is missing. Please refresh and try again.",
      errorCodes: ["missing-input-response"],
    };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // Fail open or fail closed? The spec says:
    // "Do not silently skip Turnstile when production protection is expected."
    // If it's not configured but TURNSTILE_ENABLED is not "false", we must fail closed.
    console.error("CRITICAL: TURNSTILE_SECRET_KEY is missing but Turnstile is enabled.");
    return {
      success: false,
      message: "Security configuration error. Please contact support.",
      errorCodes: ["missing-secret-key"],
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    
    // IP validation is optional but good practice if available, we'll skip for now to simplify

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: "Security verification failed. Are you a bot?",
        errorCodes: data["error-codes"],
      };
    }

    // Action validation (optional but highly recommended to prevent token reuse across contexts)
    if (action && data.action && action !== data.action) {
      return {
        success: false,
        message: "Security verification context mismatch.",
        errorCodes: ["action-mismatch"],
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return {
      success: false,
      message: "Security verification service is temporarily unavailable.",
      errorCodes: ["internal-error"],
    };
  }
}
