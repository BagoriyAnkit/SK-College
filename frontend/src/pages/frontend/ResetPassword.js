import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { VerifyResetTokenApi, ResetPasswordApi } from "../../Service/frontend/Auth";
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [isVerifying, setIsVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(null);
    const [tokenError, setTokenError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsTokenValid(false);
                setTokenError("No reset token provided.");
                setIsVerifying(false);
                return;
            }

            try {
                const res = await VerifyResetTokenApi(token);
                if (res.data?.status) {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                    setTokenError(res.data?.message || "Password reset link is invalid or has expired.");
                }
            } catch (err) {
                setIsTokenValid(false);
                setTokenError(
                    err.response?.data?.message || "This password reset link is invalid or has expired."
                );
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            Swal.fire({
                icon: "warning",
                title: "Password Required",
                text: "Please enter a new password.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Password Too Short",
                text: "Password must be at least 6 characters in length.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Passwords Do Not Match",
                text: "The passwords you entered do not match. Please re-enter them.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        setSubmitting(true);

        try {
            const res = await ResetPasswordApi(token, { password });

            if (res.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Password Reset Successful",
                    text: res.data?.message || "Your password has been changed. You may now sign in.",
                    confirmButtonColor: "#0f172a",
                }).then(() => {
                    navigate("/login", { replace: true });
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Reset Failed",
                    text: res.data?.message || "Unable to reset password. The link may have expired.",
                    confirmButtonColor: "#0f172a",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Reset Error",
                text: error.response?.data?.message || "Something went wrong. Please request a new reset link.",
                confirmButtonColor: "#0f172a",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            <Header />

            <div className="pt-20 md:pt-28 flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
                    {isVerifying ? (
                        <div className="text-center py-8">
                            <span className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block mb-3"></span>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Verifying Token Authenticity...
                            </p>
                        </div>
                    ) : !isTokenValid ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">
                                Invalid or Expired Token
                            </h2>
                            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                                {tokenError || "This password reset link is invalid or has expired for security reasons."}
                            </p>
                            <Link
                                to="/forgot-password"
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Request New Link</span>
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                                    <KeyRound className="w-6 h-6 text-amber-400" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Set New Password
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Enter your new account password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        New Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            required
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Confirm Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter your password"
                                            required
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                <span>Updating Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm &amp; Update Password</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
