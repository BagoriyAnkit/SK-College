import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    Target,
    Eye,
    Award,
    Building2,
    BookOpen,
    GraduationCap,
    CheckCircle2,
    ShieldCheck,
    Compass,
    ArrowRight,
    Users,
    Laptop
} from "lucide-react";
import { ViewAbout } from "../../Service/frontend/About";
import { Image_url, API_url } from "../../config/config";

export default function About() {
    const [about, setAbout] = useState({});
    const [loading, setLoading] = useState(true);

    const resolveCampusImage = (img) => {
        if (!img) return `${Image_url}/1785489209125-about-us.jpg`;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        if (img.startsWith("/")) return `${API_url}${img}`;
        return `${Image_url}/${img}`;
    };

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await ViewAbout();
                if (res?.data?.data) {
                    setAbout(res.data.data);
                } else if (res?.data) {
                    setAbout(res.data);
                }
            } catch (error) {
                console.error("Error fetching about information:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    const coreValues = [
        {
            title: "Academic Rigor",
            desc: "Delivering contemporary curriculum aligned with industry standards and university benchmarks.",
            icon: BookOpen
        },
        {
            title: "Ethical Leadership",
            desc: "Instilling integrity, social responsibility, and accountability in professional practice.",
            icon: ShieldCheck
        },
        {
            title: "Hands-on Innovation",
            desc: "Encouraging experimental learning, project-based inquiry, and problem-solving skills.",
            icon: Laptop
        },
        {
            title: "Student Centricity",
            desc: "Providing dedicated mentorship, career counseling, and holistic student support.",
            icon: Users
        }
    ];

    const campusHighlights = [
        {
            title: "Central Academic Library",
            desc: "Rich repository of standard textbooks, reference volumes, research journals, and quiet study spaces."
        },
        {
            title: "Advanced Computational Labs",
            desc: "High-spec computer laboratories equipped with licensed software and high-speed network connectivity."
        },
        {
            title: "Smart Multimedia Classrooms",
            desc: "Acoustically balanced classrooms with interactive presentation systems for immersive instruction."
        },
        {
            title: "Industry Collaborative Workshops",
            desc: "Dedicated lab spaces designed for seminar sessions, hands-on workshops, and technical presentations."
        }
    ];

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
                            <span className="text-slate-200">About College</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Approved by AICTE &bull; College Code: SKC-104 &bull; Estd. 2010</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            {about.title || "About SK College of Technology"}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                            {about.description ||
                                "Dedicated to cultivating academic excellence, professional integrity, and technical innovation through high standards of instruction, faculty mentorship, and modern campus infrastructure."}
                        </p>
                    </div>
                </section>

                {/* 3. Main Overview Section */}
                <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Left: Campus Image */}
                            <div className="lg:col-span-5">
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                                    <img
                                        src={resolveCampusImage(about.image)}
                                        alt="SK College Campus"
                                        className="w-full h-80 sm:h-96 object-cover group-hover:scale-102 transition duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = `${Image_url}/1785489209125-about-us.jpg`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>Institutional Campus</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-100 mt-1">
                                            SK College of Technology, Jaipur
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Institutional Profile */}
                            <div className="lg:col-span-7 space-y-5">
                                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                                    <span>Institutional Profile</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Empowering Tomorrow's Professionals Through Disciplined Learning
                                </h2>

                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    SK College of Technology was established with the vision of offering high-quality technical and management education that bridges fundamental academic theories with industry requirements. Our structured educational environment encourages students to develop analytical competencies, ethical standards, and leadership capabilities.
                                </p>

                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    With well-equipped laboratory infrastructure, modern digital libraries, seasoned faculty members, and proactive student development programs, the institution provides students with a stable foundation to excel in both higher studies and corporate pursuits.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-700 font-medium">Affiliated &amp; Approved by University Bodies</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-700 font-medium">Outcome-Based Academic Curriculum</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-700 font-medium">Experienced Faculty &amp; Subject Mentors</span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-700 font-medium">Continuous Skill Development &amp; Workshops</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Vision & Mission Section */}
                <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                                Institutional Pillars
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Our Vision &amp; Mission
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                The founding principles that guide our academic programs, faculty development, and student mentorship.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Mission Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6">
                                    <Target className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    Our Mission
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {about.mission ||
                                        "To provide quality technical education through continuous curriculum enhancement, rigorous laboratory exposure, and active industry collaboration, nurturing ethical professionals capable of solving real-world challenges."}
                                </p>
                            </div>

                            {/* Vision Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6">
                                    <Eye className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    Our Vision
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {about.vision ||
                                        "To emerge as a premier center of technical and managerial learning recognized for excellence in academic rigor, student achievements, practical innovation, and community development."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Core Values */}
                <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                                Institutional Ethos
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Core Institutional Values
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                Standards of integrity, excellence, and shared responsibility observed across our campus.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {coreValues.map((val) => {
                                const IconComponent = val.icon;
                                return (
                                    <div
                                        key={val.title}
                                        className="bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 mb-4 shadow-xs">
                                            <IconComponent className="w-5 h-5 text-slate-800" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">
                                            {val.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {val.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 6. Campus Infrastructure & Facilities */}
                <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                                Campus Infrastructure
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Modern Academic Facilities
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                Purpose-built facilities designed to facilitate focused study, technical research, and collaborative engagement.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {campusHighlights.map((fac) => (
                                <div
                                    key={fac.title}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                                        <Building2 className="w-4 h-4 text-slate-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 mb-1">
                                            {fac.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {fac.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Action CTA Section */}
                <section className="py-16 bg-slate-950 text-white border-b border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                            Begin Your Academic Journey at SK College
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
                            Explore our comprehensive degree programs, review eligibility criteria, or reach out to our academic admissions team for guidance.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/program"
                                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-2"
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span>Explore Programs</span>
                            </Link>
                            <Link
                                to="/applyNow"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2"
                            >
                                <span>Apply for Admission</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

            </div>

            {/* 8. Footer */}
            <Footer />
        </div>
    );
}
