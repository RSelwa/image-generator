import { type FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { FirebaseError } from "firebase/app"
import z from "zod"

export const globalErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string(),
  source: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  rawError: z.string().optional(),
})

export type GlobalError = z.infer<typeof globalErrorSchema>

const isRTKQueryError = (error: unknown): error is FetchBaseQueryError => {
  const isObject = typeof error === "object" && error !== null

  if (!isObject) return false

  const hasStatus = "status" in error

  if (!hasStatus) return false

  return typeof error.status === "number" || typeof error.status === "string"
}

const maybeLogAndReturn = <T>(data: T, log?: boolean): T => {
  log && console.info("⛔️ Logged error:", data)

  return data
}

export const rtkQueryErrorHandler = (error: FetchBaseQueryError) => {
  const { status, data } = error

  const hastHttpStatusCode = typeof status === "number"

  const hasFetchError = status === "FETCH_ERROR"
  const hasParseError = status === "PARSING_ERROR"
  const hasTimeoutError = status === "TIMEOUT_ERROR"

  if (hasFetchError) {
    return {
      status: 500,
      code: "FETCH_ERROR",
      message: error.error,
    }
  }

  if (hasParseError) {
    return {
      status: error.originalStatus,
      code: "PARSING_ERROR",
      message: error.error,
    }
  }

  if (hastHttpStatusCode) {
    return {
      status,
      code: "HTTP_ERROR",
      message: data ? JSON.stringify(data) : "Internal server error",
      data:
        typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined,
    }
  }

  if (hasTimeoutError) {
    return {
      status: 500,
      code: "TIMEOUT_ERROR",
      message: error.error,
    }
  }

  return {
    status: 500,
    code: "CUSTOM_ERROR",
    message: JSON.stringify(data) || error.error,
  }
}

export const firebaseErrorHandler = (code: string) => {
  if (code === "auth/too-many-requests")
    return "Please wait a few minutes before trying again"
  if (code === "auth/popup-closed-by-user")
    return "Please try again without closing the popup"
  if (code === "auth/weak-password")
    return "Password should be at least 6 characters"
  if (code === "auth/user-not-found")
    return "This user doesn't exist, please sign up first"
  if (code === "functions/internal")
    return "This email is already linked to another Flim account. Please delete that account before using this email here."
  if (code === "auth/email-already-in-use")
    return "This email is already linked to another Flim account. Please delete that account before using this email here."
  if (code === "auth/user-disabled") return "Your account was disabled"
  if (code === "auth/wrong-password")
    return "You have entered an invalid email or password"
  if (code === "auth/requires-recent-login") return "You need a recent login"
  if (code === "auth/user-mismatch")
    return "You need to connect with the right account"

  if (code === "auth/admin-restricted-operation") return "Something went wrong"
  if (code === "auth/argument-error") return "Something went wrong"
  if (code === "auth/app-not-authorized") return "Something went wrong"
  if (code === "auth/app-not-installed") return "Something went wrong"
  if (code === "auth/captcha-check-failed") return "Something went wrong"
  if (code === "auth/code-expired") return "Something went wrong"
  if (code === "auth/cordova-not-ready") return "Something went wrong"
  if (code === "auth/cors-unsupported") return "Something went wrong"
  if (code === "auth/credential-already-in-use") return "Something went wrong"
  if (code === "auth/custom-token-mismatch") return "Something went wrong"
  if (code === "auth/dependent-sdk-initialized-before-auth")
    return "Something went wrong"
  if (code === "auth/dynamic-link-not-activated") return "Something went wrong"
  if (code === "auth/email-change-needs-verification")
    return "Something went wrong"
  if (code === "auth/emulator-config-failed") return "Something went wrong"
  if (code === "auth/expired-action-code") return "Something went wrong"
  if (code === "auth/cancelled-popup-request") return "Something went wrong"
  if (code === "auth/internal-error") return "Something went wrong"
  if (code === "auth/invalid-api-key") return "Something went wrong"
  if (code === "auth/invalid-app-credential") return "Something went wrong"
  if (code === "auth/invalid-app-id") return "Something went wrong"
  if (code === "auth/invalid-user-token") return "Something went wrong"
  if (code === "auth/invalid-auth-event") return "Something went wrong"
  if (code === "auth/invalid-cert-hash") return "Something went wrong"
  if (code === "auth/invalid-verification-code") return "Something went wrong"
  if (code === "auth/invalid-continue-uri") return "Something went wrong"
  if (code === "auth/invalid-cordova-configuration")
    return "Something went wrong"
  if (code === "auth/invalid-custom-token") return "Something went wrong"
  if (code === "auth/invalid-dynamic-link-domain")
    return "Something went wrong"
  if (code === "auth/invalid-email") return "Invalid email format"
  if (code === "auth/invalid-emulator-scheme") return "Something went wrong"
  if (code === "auth/invalid-credential") return "Something went wrong"
  if (code === "auth/invalid-message-payload") return "Something went wrong"
  if (code === "auth/invalid-multi-factor-session")
    return "Something went wrong"
  if (code === "auth/invalid-oauth-client-id") return "Something went wrong"
  if (code === "auth/invalid-oauth-provider") return "Something went wrong"
  if (code === "auth/invalid-action-code") return "Something went wrong"
  if (code === "auth/unauthorized-domain") return "Something went wrong"
  if (code === "auth/invalid-persistence-type") return "Something went wrong"
  if (code === "auth/invalid-phone-number") return "Something went wrong"
  if (code === "auth/invalid-provider-id") return "Something went wrong"
  if (code === "auth/invalid-recipient-email") return "Something went wrong"
  if (code === "auth/invalid-sender") return "Something went wrong"
  if (code === "auth/invalid-verification-id") return "Something went wrong"
  if (code === "auth/invalid-tenant-id") return "Something went wrong"
  if (code === "auth/multi-factor-info-not-found")
    return "Something went wrong"
  if (code === "auth/multi-factor-auth-required") return "Something went wrong"
  if (code === "auth/missing-android-pkg-name") return "Something went wrong"
  if (code === "auth/missing-app-credential") return "Something went wrong"
  if (code === "auth/auth-domain-config-required")
    return "Something went wrong"
  if (code === "auth/missing-verification-code") return "Something went wrong"
  if (code === "auth/missing-continue-uri") return "Something went wrong"
  if (code === "auth/missing-iframe-start") return "Something went wrong"
  if (code === "auth/missing-or-invalid-nonce") return "Something went wrong"
  if (code === "auth/missing-multi-factor-info") return "Something went wrong"
  if (code === "auth/missing-multi-factor-session")
    return "Something went wrong"
  if (code === "auth/missing-phone-number") return "Something went wrong"
  if (code === "auth/missing-verification-id") return "Something went wrong"
  if (code === "auth/app-deleted") return "Something went wrong"
  if (code === "auth/account-exists-with-different-credential")
    return "Something went wrong"
  if (code === "auth/network-request-failed") return "Something went wrong"
  if (code === "auth/null-user") return "Something went wrong"
  if (code === "auth/no-auth-event") return "Something went wrong"
  if (code === "auth/no-such-provider") return "Something went wrong"
  if (code === "auth/operation-not-allowed") return "Something went wrong"
  if (code === "auth/operation-not-supported-in-this-environment")
    return "Something went wrong"
  if (code === "auth/popup-blocked") return "Something went wrong"
  if (code === "auth/provider-already-linked") return "Something went wrong"
  if (code === "auth/quota-exceeded") return "Something went wrong"
  if (code === "auth/redirect-cancelled-by-user") return "Something went wrong"
  if (code === "auth/redirect-operation-pending") return "Something went wrong"
  if (code === "auth/rejected-credential") return "Something went wrong"
  if (code === "auth/second-factor-already-in-use")
    return "Something went wrong"
  if (code === "auth/maximum-second-factor-count-exceeded")
    return "Something went wrong"
  if (code === "auth/tenant-id-mismatch") return "Something went wrong"
  if (code === "auth/timeout") return "Something went wrong"
  if (code === "auth/user-token-expired") return "Something went wrong"
  if (code === "auth/unauthorized-continue-uri") return "Something went wrong"
  if (code === "auth/unsupported-first-factor") return "Something went wrong"
  if (code === "auth/unsupported-persistence-type")
    return "Something went wrong"
  if (code === "auth/unsupported-tenant-operation")
    return "Something went wrong"
  if (code === "auth/unverified-email") return "Something went wrong"
  if (code === "auth/user-cancelled") return "Something went wrong"
  if (code === "auth/user-signed-out") return "Something went wrong"
  if (code === "auth/web-storage-unsupported") return "Something went wrong"
  if (code === "auth/already-initialized") return "Something went wrong"
  if (code === "auth/recaptcha-not-enabled") return "Something went wrong"
  if (code === "auth/missing-recaptcha-token") return "Something went wrong"
  if (code === "auth/invalid-recaptcha-token") return "Something went wrong"
  if (code === "auth/invalid-recaptcha-action") return "Something went wrong"
  if (code === "auth/missing-client-type") return "Something went wrong"
  if (code === "auth/missing-recaptcha-version") return "Something went wrong"
  if (code === "auth/invalid-recaptcha-version") return "Something went wrong"
  if (code === "auth/invalid-req-type") return "Something went wrong"

  // Known error codes with a specific message
  if (code === "unauthenticated")
    return "You need to be authenticated to perform this action"
  if (code === "permission-denied")
    return "You are not authorized to perform this action"
  if (code === "unavailable") return "The service is currently unavailable"
  if (code === "unimplemented") return "This feature is not implemented yet"
  if (code === "internal") return "An internal error has occurred"
  if (code === "cancelled") return "The operation was cancelled"
  if (code === "invalid-argument") return "The argument is invalid"
  if (code === "deadline-exceeded") return "The deadline has been exceeded"
  if (code === "not-found") return "The resource was not found"
  if (code === "already-exists") return "The resource already exists"
  if (code === "resource-exhausted") return "The resource is exhausted"
  if (code === "failed-precondition")
    return "The operation failed because of a precondition"
  if (code === "aborted") return "The operation was aborted"
  if (code === "out-of-range") return "The operation was out of range"
  if (code === "data-loss") return "The operation caused data loss"

  return "Something went wrong"
}

export const globalErrorHandler = (
  error: unknown,
  options: { log?: boolean } = { log: false },
): GlobalError => {
  if (isRTKQueryError(error)) {
    return maybeLogAndReturn(
      {
        ...rtkQueryErrorHandler(error),
        rawError: JSON.stringify(error),
        source: "RTK_QUERY",
      },
      options.log,
    )
  }

  if (error instanceof FirebaseError) {
    return maybeLogAndReturn(
      {
        status: 500,
        code: error.code,
        message: firebaseErrorHandler(error.code),
        rawError: error.toString(),
        source: "FIREBASE",
      },
      options.log,
    )
  }

  if (error instanceof Error) {
    return maybeLogAndReturn(
      {
        status: 500,
        code: error.name,
        message: error.message,
        rawError: error.toString(),
        source: "ERROR",
      },
      options.log,
    )
  }

  return maybeLogAndReturn(
    {
      status: 500,
      code: "INTERNAL/UNKNOWN_ERROR",
      message: "An unknown error occurred",
      rawError: JSON.stringify(error),
      source: "UNKNOWN",
    },
    options.log,
  )
}
