import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "dispatch_session";

function getSecret() {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) throw new Error("DASHBOARD_PASSWORD is not set");
  return new TextEncoder().encode(password);
}

export async function createDashboardSessionToken() {
  return new SignJWT({ role: "dispatcher" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyDashboardSessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
