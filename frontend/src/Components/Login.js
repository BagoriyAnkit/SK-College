import React, { useEffect } from 'react';
import './Login.css';
import "animate.css";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { AdminLoginApi } from '../Service/admin/User';
import logo from "../assets/SKcollege logo.png";
import { getAuthUser, getRedirectPathForRole } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      navigate(getRedirectPathForRole(authUser.role), { replace: true });
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      try {
        const body = {
          email: values.email.trim(),
          password: values.password
        };
        const res = await AdminLoginApi(body);

        if (res.data?.status) {
          localStorage.setItem("token", res.data.token);
          if (res.data.admin) {
            localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
          }
          if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }

          const role = res.data.admin?.role || res.data.user?.role || "admin";
          const target = getRedirectPathForRole(role);

          Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: res.data.message || `Welcome back, ${role}.`,
            confirmButtonText: "Continue",
            confirmButtonColor: "#7C3AED",
            background: "#ffffff",
            color: "#1F2937",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate(target, { replace: true });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: res.data?.message || "Invalid credentials",
            confirmButtonColor: "#7C3AED",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.response?.data?.message || "Invalid email or password",
          confirmButtonColor: "#7C3AED",
          background: "#ffffff",
          color: "#1F2937",
        });
      }
    },
  });

  return (
    <div>
      <div className="login-wrapper">
        <div className="card">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="SK College"
              className="w-16 h-16 object-contain"
            />
          </div>

          <h2>Admin & Staff Login</h2>
          <p>Access your console dashboard</p>
          <form onSubmit={formik.handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm" style={{ color: "red" }}>
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm" style={{ color: "red" }}>
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button className="btn" type="submit">
              Login
            </button>
          </form>
          <div className="footer-text">
            © 2026 SK College Console Portal
          </div>
        </div>
      </div>
    </div>
  );
}
