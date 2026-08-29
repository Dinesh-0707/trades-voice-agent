import twilio from "twilio";

export function validateTwilioSignature(
  requestUrl: string,
  params: Record<string, string>,
  signature: string | null
) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    // Voice isn't configured yet — nothing to validate against.
    return true;
  }
  if (!signature) return false;
  return twilio.validateRequest(authToken, signature, requestUrl, params);
}
