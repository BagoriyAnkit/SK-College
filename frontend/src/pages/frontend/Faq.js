import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Search,
    Award,
    MessageCircle,
    ArrowRight
} from "lucide-react";
import { ViewAllFaq } from "../../Service/frontend/Faq";

export default function Faq() {
    const [faqData, setFaqData] = useState([]);
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getFaq();
    }, []);

    const getFaq = async () => {
        try {
            const res = await ViewAllFaq();
            let list = [];
            if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res)) {
                list = res;
            }
            setFaqData(list);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            setFaqData([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFaq = (index) => {
        setActive(active === index ? null : index);
    };

    const filteredFaqs = useMemo(() => {
        return faqData.filter((item) => {
            const q = (item.question || "").toLowerCase();
            const a = (item.answer || "").toLowerCase();
            const query = searchQuery.toLowerCase().trim();
            return !query || q.includes(query) || a.includes(query);
        });
    }, [faqData, searchQuery]);

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
                            <span className="text-slate-200">FAQs</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Help Center &bull; Frequently Asked Questions</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Frequently Asked Questions
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            Find clear, institutional answers regarding admission criteria, degree programs, semester examinations, fee installments, and campus amenities.
                        </p>
                    </div>
                </section>

                {/* 3. Search Bar */}
                <section className="bg-white border-b border-slate-200 py-6 sticky top-20 z-20 shadow-xs">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search frequently asked questions..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. FAQ Accordion List */}
                <section className="py-12 sm:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-2">
                                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredFaqs.length > 0 ? (
                            <div className="space-y-4">
                                {filteredFaqs.map((item, index) => {
                                    const isOpen = active === index;

                                    return (
                                        <div
                                            key={item._id || index}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
                                        >
                                            <button
                                                onClick={() => toggleFaq(index)}
                                                className="w-full flex justify-between items-center p-5 sm:p-6 text-left hover:bg-slate-50 transition cursor-pointer"
                                            >
                                                <span className="font-bold text-sm sm:text-base text-slate-900 pr-4">
                                                    {item.question}
                                                </span>
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                                    <p className="whitespace-pre-line">{item.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <HelpCircle className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    No Questions Found
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    No FAQs match your search query.
                                </p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}

                        {/* Still have questions prompt */}
                        <div className="mt-12 p-8 rounded-2xl bg-slate-900 text-white text-center">
                            <h3 className="text-lg font-bold mb-2">
                                Still Have Unanswered Questions?
                            </h3>
                            <p className="text-xs text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
                                Our academic counselors and admissions helpdesk are available to assist you with specific inquiries about courses or enrollment.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Contact Academic Helpdesk</span>
                            </Link>
                        </div>
                    </div>
                </section>

            </div>

            {/* 5. Footer */}
            <Footer />
        </div>
    );
}
