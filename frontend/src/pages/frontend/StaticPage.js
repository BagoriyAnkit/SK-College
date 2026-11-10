import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { ViewStaticPageBySlug } from "../../Service/frontend/StaticPage";
import { Image_url } from "../../config/config";
import { FileText, ArrowLeft, Award } from "lucide-react";

const Static = () => {
    const { slug } = useParams();
    const [staticData, setStaticData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getStaticPage = async () => {
        try {
            const res = await ViewStaticPageBySlug(slug);
            if (res?.status === true || res?.data) {
                setStaticData(res.data || res);
            }
        } catch (error) {
            console.error("Error fetching static page:", error);
            setStaticData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStaticPage();
    }, [slug]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            {/* 1. Header */}
            <Header />

            {/* Spacer for Fixed Header */}
            <div className="pt-20 md:pt-28 flex-1">

                {/* 2. Institutional Banner */}
                <section className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                            <span>/</span>
                            <span className="text-slate-200">{staticData?.title || "Information"}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Institutional Policy &amp; Information</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                            {staticData?.title || (loading ? "Loading Page..." : "Page Not Found")}
                        </h1>
                    </div>
                </section>

                {/* 3. Main Content Section */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-4">
                                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                            </div>
                        ) : staticData ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
                                {staticData.image && (
                                    <img
                                        src={`${Image_url}/${staticData.image}`}
                                        alt={staticData.title}
                                        className="w-full h-80 object-cover rounded-xl mb-8 border border-slate-200"
                                    />
                                )}

                                <div
                                    className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4"
                                    dangerouslySetInnerHTML={{
                                        __html: staticData.description,
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 mb-2">
                                    Page Not Found
                                </h2>
                                <p className="text-xs text-slate-500 mb-6">
                                    The requested informational page could not be found.
                                </p>
                                <Link
                                    to="/"
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition inline-flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Return to Homepage</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* 4. Footer */}
            <Footer />
        </div>
    );
};

export default Static;
