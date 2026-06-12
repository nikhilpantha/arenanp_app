/**
 * Holds the most recent dev OTP returned by the backend (`devCode`, only present
 * when SMS_PROVIDER=stub). Lets the verify screen show / auto-fill the code during
 * development so you can sign in without a real SMS. No-op in production builds.
 */
let lastDevOtp: string | null = null;

export function setDevOtp(code: string | null): void {
  lastDevOtp = code;
}

export function getDevOtp(): string | null {
  return lastDevOtp;
}
