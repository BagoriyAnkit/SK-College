/**
 * Authentication and JWT Utility Functions
 * Handles token decoding, expiration checks, role resolution, and storage clearing.
 */

/**
 * Safely decodes a JWT payload without external libraries.
 * Handles URL-safe base64 and UTF-8 encoded characters.
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    if (typeof TextDecoder !== "undefined" && typeof atob !== "undefined") {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const decoder = new TextDecoder("utf-8");
      const jsonStr = decoder.decode(bytes);
      return JSON.parse(jsonStr);
    } else if (typeof Buffer !== "undefined") {
      return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
    } else {
      const binaryStr = atob(base64);
      const jsonStr = decodeURIComponent(
        binaryStr
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonStr);
    }
  } catch (err) {
    return null;
  }
};

/**
 * Checks whether a decoded JWT payload has expired.
 * exp is expected in seconds (standard JWT claim).
 */
export const isTokenExpired = (decoded) => {
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp * 1000 <= Date.now();
};

/**
 * Retrieves the currently authenticated user from localStorage and JWT.
 * Returns null if token is missing, malformed, or expired.
 */
export const getAuthUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded || isTokenExpired(decoded)) {
      clearAuth();
      return null;
    }

    let storedUser = null;
    const rawAdmin = localStorage.getItem("adminUser");
    const rawUser = localStorage.getItem("user");
    if (rawAdmin) {
      try {
        storedUser = JSON.parse(rawAdmin);
      } catch (_) {}
    } else if (rawUser) {
      try {
        storedUser = JSON.parse(rawUser);
      } catch (_) {}
    }

    // Role resolution: prefer verified JWT payload role, fallback to stored record
    const role = String(decoded.role || storedUser?.role || "").toLowerCase().trim();

    return {
      token,
      role,
      id: decoded.id || storedUser?.id || storedUser?._id,
      name: decoded.name || storedUser?.name || "User",
      email: decoded.email || storedUser?.email || "",
      exp: decoded.exp,
    };
  } catch (err) {
    clearAuth();
    return null;
  }
};

/**
 * Clears all authentication-related keys from localStorage.
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("user");
  } catch (_) {}
};

/**
 * Returns the appropriate redirect path for a given user role.
 */
export const getRedirectPathForRole = (role) => {
  const normalized = String(role || "").toLowerCase().trim();
  switch (normalized) {
    case "admin":
    case "hod":
    case "teacher":
    case "accountant":
      return "/admin/dashboard";
    case "student":
      return "/portal";
    default:
      return "/";
  }
};
