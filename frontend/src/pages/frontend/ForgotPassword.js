import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ForgotPasswordApi } from "../../Service/frontend/Auth";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanEmail = email.trim();
        if (!cleanEmail) {
            Swal.fire({
                icon: "warning",
                title: "Email Required",
                text: "Please enter your registered email address.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        setLoading(true);

        try {
            const res = await ForgotPasswordApi({ email: cleanEmail });

            setSubmitted(true);

            Swal.fire({
                icon: "success",
                title: "Request Processed",
                text: res.data?.message || "If an account with that email exists, a password reset link has been sent.",
                confirmButtonColor: "#0f172a",
            });

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Error",
                text: error.response?.data?.message || "Something went wrong. Please check your connection and try again.",
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
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
                    <div className="mb-6">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-4 transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Sign In</span>
                        </Link>

                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                            <KeyRound className="w-6 h-6 text-amber-400" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Reset Account Password
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Enter your registered email address and we will dispatch a password recovery link.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm space-y-2">
                            <div className="flex items-center gap-2 font-bold text-emerald-900">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Recovery Link Sent</span>
                            </div>
                            <p className="text-xs text-emerald-700 leading-relaxed">
                                Please check your inbox for instructions to reset your password. If you don't receive an email within a few minutes, check your spam folder.
                            </p>
                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    className="text-xs font-bold text-emerald-900 underline"
                                >
                                    Return to Sign In
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Registered Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. yourname@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                        <span>Sending Recovery Link...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Password Reset Link</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
