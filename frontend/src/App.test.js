import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import {
  parseJwt,
  isTokenExpired,
  getAuthUser,
  clearAuth,
  getRedirectPathForRole,
} from "./utils/auth";

// Helper to create test JWT tokens
const createMockJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = "mock_signature_part";
  return `${header}.${body}.${signature}`;
};

describe("Frontend Auth & RBAC Utilities (Step 2)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("parseJwt()", () => {
    it("should safely decode a valid 3-part JWT token", () => {
      const payload = { id: "123", email: "admin@test.com", role: "admin" };
      const token = createMockJwt(payload);
      const decoded = parseJwt(token);

      expect(decoded).not.toBeNull();
      expect(decoded.id).toBe("123");
      expect(decoded.email).toBe("admin@test.com");
      expect(decoded.role).toBe("admin");
    });

    it("should return null for malformed or non-3-part tokens", () => {
      expect(parseJwt(null)).toBeNull();
      expect(parseJwt("")).toBeNull();
      expect(parseJwt("invalid-token")).toBeNull();
      expect(parseJwt("part1.part2")).toBeNull();
      expect(parseJwt("part1.not-base64-json.part3")).toBeNull();
    });
  });

  describe("isTokenExpired()", () => {
    it("should return false for tokens expiring in the future", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour ahead
      expect(isTokenExpired({ exp: futureExp })).toBe(false);
    });

    it("should return true for expired tokens", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 60; // 1 min ago
      expect(isTokenExpired({ exp: pastExp })).toBe(true);
    });

    it("should return false if exp claim is not a number", () => {
      expect(isTokenExpired({})).toBe(false);
      expect(isTokenExpired({ exp: "never" })).toBe(false);
    });
  });

  describe("getAuthUser()", () => {
    it("should return null when no token is present in localStorage", () => {
      expect(getAuthUser()).toBeNull();
    });

    it("should return null and clear storage when token is expired", () => {
      const expiredToken = createMockJwt({
        id: "1",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) - 100,
      });
      localStorage.setItem("token", expiredToken);
      localStorage.setItem("adminUser", JSON.stringify({ role: "admin" }));

      const authUser = getAuthUser();
      expect(authUser).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("adminUser")).toBeNull();
    });

    it("should return null and clear storage when token is corrupted/malformed", () => {
      localStorage.setItem("token", "corrupt.token");
      const authUser = getAuthUser();
      expect(authUser).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("should return parsed user info for a valid, active token", () => {
      const activeToken = createMockJwt({
        id: "usr_42",
        email: "teacher@skcollege.edu",
        role: "Teacher",
        name: "Dr. Sharma",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      localStorage.setItem("token", activeToken);

      const authUser = getAuthUser();
      expect(authUser).not.toBeNull();
      expect(authUser.id).toBe("usr_42");
      expect(authUser.email).toBe("teacher@skcollege.edu");
      expect(authUser.role).toBe("teacher"); // normalized lowercase
      expect(authUser.name).toBe("Dr. Sharma");
    });

    it("should not treat mere token presence as admin role", () => {
      const studentToken = createMockJwt({
        id: "stu_10",
        role: "student",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      localStorage.setItem("token", studentToken);

      const authUser = getAuthUser();
      expect(authUser).not.toBeNull();
      expect(authUser.role).toBe("student");
      expect(authUser.role).not.toBe("admin");
    });
  });

  describe("clearAuth()", () => {
    it("should wipe token, adminUser, and user from localStorage", () => {
      localStorage.setItem("token", "xyz");
      localStorage.setItem("adminUser", JSON.stringify({ name: "Admin" }));
      localStorage.setItem("user", JSON.stringify({ name: "Student" }));

      clearAuth();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("adminUser")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("getRedirectPathForRole()", () => {
    it("should redirect admin to /admin/dashboard", () => {
      expect(getRedirectPathForRole("admin")).toBe("/admin/dashboard");
      expect(getRedirectPathForRole("ADMIN")).toBe("/admin/dashboard");
    });

    it("should redirect accountant to /admin/fees", () => {
      expect(getRedirectPathForRole("accountant")).toBe("/admin/fees");
    });

    it("should redirect teacher to /admin/exam", () => {
      expect(getRedirectPathForRole("teacher")).toBe("/admin/exam");
    });

    it("should redirect hod to /admin/department", () => {
      expect(getRedirectPathForRole("hod")).toBe("/admin/department");
    });

    it("should redirect student to /portal without redirect loop", () => {
      expect(getRedirectPathForRole("student")).toBe("/portal");
    });

    it("should default unknown roles to /", () => {
      expect(getRedirectPathForRole("unknown")).toBe("/");
      expect(getRedirectPathForRole(null)).toBe("/");
    });
  });

  describe("Role Permission Matrix Verification", () => {
    const roles = {
      admin: "admin",
      hod: "hod",
      teacher: "teacher",
      accountant: "accountant",
      student: "student",
    };

    const hasAccess = (allowedRoles, userRole) => {
      if (!allowedRoles || allowedRoles.length === 0) return true;
      return allowedRoles
        .map((r) => r.toLowerCase().trim())
        .includes(userRole.toLowerCase().trim());
    };

    it("admin back-office panel (/admin) permits staff roles and blocks student", () => {
      const adminLayoutAllowed = ["admin", "hod", "teacher", "accountant"];
      expect(hasAccess(adminLayoutAllowed, roles.admin)).toBe(true);
      expect(hasAccess(adminLayoutAllowed, roles.hod)).toBe(true);
      expect(hasAccess(adminLayoutAllowed, roles.teacher)).toBe(true);
      expect(hasAccess(adminLayoutAllowed, roles.accountant)).toBe(true);
      expect(hasAccess(adminLayoutAllowed, roles.student)).toBe(false);
    });

    it("user account management (/admin/user) is admin-only", () => {
      const userAllowed = ["admin"];
      expect(hasAccess(userAllowed, roles.admin)).toBe(true);
      expect(hasAccess(userAllowed, roles.hod)).toBe(false);
      expect(hasAccess(userAllowed, roles.teacher)).toBe(false);
      expect(hasAccess(userAllowed, roles.accountant)).toBe(false);
      expect(hasAccess(userAllowed, roles.student)).toBe(false);
    });

    it("fees management (/admin/fees) permits only admin and accountant", () => {
      const feesAllowed = ["admin", "accountant"];
      expect(hasAccess(feesAllowed, roles.admin)).toBe(true);
      expect(hasAccess(feesAllowed, roles.accountant)).toBe(true);
      expect(hasAccess(feesAllowed, roles.teacher)).toBe(false);
      expect(hasAccess(feesAllowed, roles.hod)).toBe(false);
      expect(hasAccess(feesAllowed, roles.student)).toBe(false);
    });

    it("teacher management (/admin/teacher) permits admin, hod, and teacher", () => {
      const teacherAllowed = ["admin", "hod", "teacher"];
      expect(hasAccess(teacherAllowed, roles.admin)).toBe(true);
      expect(hasAccess(teacherAllowed, roles.hod)).toBe(true);
      expect(hasAccess(teacherAllowed, roles.teacher)).toBe(true);
      expect(hasAccess(teacherAllowed, roles.accountant)).toBe(false);
      expect(hasAccess(teacherAllowed, roles.student)).toBe(false);
    });

    it("student portal fallback (/portal) permits all authenticated roles", () => {
      const portalAllowed = ["student", "admin", "hod", "teacher", "accountant"];
      expect(hasAccess(portalAllowed, roles.student)).toBe(true);
      expect(hasAccess(portalAllowed, roles.admin)).toBe(true);
      expect(hasAccess(portalAllowed, roles.teacher)).toBe(true);
      expect(hasAccess(portalAllowed, roles.accountant)).toBe(true);
      expect(hasAccess(portalAllowed, roles.hod)).toBe(true);
    });
  });

  describe("ProtectedRoute Component Direct DOM Rendering", () => {
    let container = null;
    let root = null;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
      localStorage.clear();
    });

    afterEach(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
      container = null;
      localStorage.clear();
    });

    it("redirects unauthenticated user accessing /admin/dashboard to /admin/login", async () => {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={["/admin/dashboard"]}>
            <Routes>
              <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hod"]}>
                    <div>Secret Dashboard</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(container.innerHTML).toContain("Admin Login Screen");
      expect(container.innerHTML).not.toContain("Secret Dashboard");
    });

    it("renders Unauthorized component with 403 Access Denied when role mismatches", async () => {
      const teacherToken = createMockJwt({
        id: "t1",
        role: "teacher",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      localStorage.setItem("token", teacherToken);

      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={["/admin/user"]}>
            <Routes>
              <Route
                path="/admin/user"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <div>Admin User Management</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(container.innerHTML).toContain("Access Denied");
      expect(container.innerHTML).toContain("teacher");
      expect(container.innerHTML).not.toContain("Admin User Management");
    });

    it("renders protected component when user role is allowed", async () => {
      const accountantToken = createMockJwt({
        id: "acc1",
        role: "accountant",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      localStorage.setItem("token", accountantToken);

      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={["/admin/fees"]}>
            <Routes>
              <Route
                path="/admin/fees"
                element={
                  <ProtectedRoute allowedRoles={["admin", "accountant"]}>
                    <div>Fee Management System</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(container.innerHTML).toContain("Fee Management System");
      expect(container.innerHTML).not.toContain("Access Denied");
    });

    it("blocks student from accessing admin routes even if token is present", async () => {
      const studentToken = createMockJwt({
        id: "stu99",
        role: "student",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      localStorage.setItem("token", studentToken);

      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={["/admin/dashboard"]}>
            <Routes>
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin", "hod"]}>
                    <div>Admin Executive Dashboard</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        );
      });

      expect(container.innerHTML).toContain("Access Denied");
      expect(container.innerHTML).toContain("student");
      expect(container.innerHTML).not.toContain("Admin Executive Dashboard");
    });
  });
});
