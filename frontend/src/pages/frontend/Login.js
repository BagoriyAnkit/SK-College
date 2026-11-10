import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { LoginApi } from "../../Service/frontend/Auth";
import { Mail, Lock, GraduationCap, ShieldCheck, ArrowRight, Award } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { getAuthUser, getRedirectPathForRole } from "../../utils/auth";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const authUser = getAuthUser();
        if (authUser) {
            navigate(getRedirectPathForRole(authUser.role), { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await LoginApi(formData);

            if (res.data?.status) {
                // Token Save
                localStorage.setItem("token", res.data.token);
                if (res.data.user) {
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }

                const role = res.data.user?.role || "student";
                const target = getRedirectPathForRole(role);

                Swal.fire({
                    icon: "success",
                    title: "Authentication Successful",
                    text: res.data.message || "Welcome to SK College Student Portal",
                    confirmButtonColor: "#0f172a",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setFormData({
                    email: "",
                    password: "",
                });

                navigate(target, { replace: true });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: res.data?.message || "Invalid email or password",
                    confirmButtonColor: "#0f172a",
                });
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text:
                    error.response?.data?.message ||
                    "Invalid credentials. Please verify your email and password.",
                confirmButtonColor: "#0f172a",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            <Header />

            <div className="pt-20 md:pt-28 flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid lg:grid-cols-12">
                    {/* Left Column: Institutional Brand & Security */}
                    <div className="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-6">
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>SK College Portal</span>
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6">
                                <GraduationCap className="w-6 h-6 text-amber-400" />
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                                Student &amp; Staff Access
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                                Sign in to access your student dashboard, view verified examination results, marksheet records, notices, and payment receipts.
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-800 text-xs text-slate-400">
                            <div className="flex items-center gap-2.5 text-slate-300">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Encrypted Session &amp; Protected Data</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-slate-300">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Role-Based Access Control</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Login Form */}
                    <div className="lg:col-span-7 p-8 sm:p-10">
                        <div className="mb-6">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                Portal Sign In
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Enter your institutional credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. student@skcollege.edu"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your account password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                    <span>Remember credentials</span>
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-slate-900 font-semibold hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Portal</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs text-slate-500">
                            New applicant seeking admission?{" "}
                            <Link to="/applyNow" className="text-slate-900 font-bold hover:underline ml-1">
                                Apply for Admission &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
