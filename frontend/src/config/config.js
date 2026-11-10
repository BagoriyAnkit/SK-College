import axios from "axios";

const API_url = "http://localhost:4000";
const Image_url = "http://localhost:4000/uploads";

// Attach JWT token to outgoing requests, strictly skipping public auth endpoints
axios.interceptors.request.use(
  (config) => {
    const url = (config.url || "").toLowerCase();
    const isPublicAuthRoute =
      url.includes("/forgot-password") ||
      url.includes("/reset-password") ||
      url.includes("/verify-reset-token") ||
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/admission/apply") ||
      url.includes("/apply");

    const token = localStorage.getItem("token");
    if (token && !isPublicAuthRoute) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to login if token is unauthenticated or expired (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      window.location.pathname !== "/admin/login"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export { API_url, Image_url };
