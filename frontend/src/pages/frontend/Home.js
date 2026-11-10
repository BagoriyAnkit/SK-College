import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";
import Header from "./Header";
import Footer from "./Footer";
import { ViewAllCourse } from "../../Service/frontend/Course";
import { ViewAllNotice } from "../../Service/frontend/Notice";
import { ViewAllEvent } from "../../Service/frontend/Event";
import { AddContact } from "../../Service/frontend/Contact";
import home_img from "../../assets/Home.png";
import {
    GraduationCap,
    BookOpen,
    Calendar,
    MapPin,
    Clock,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Award,
    Building2,
    Users,
    Send,
    ChevronRight,
    Phone,
    Mail,
    Laptop,
    Library,
    Compass,
    FileText,
    ExternalLink
} from "lucide-react";

export default function Home() {
    const navigate = useNavigate();

    // Data states
    const [courses, setCourses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);

    // Loading states
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingNotices, setLoadingNotices] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Contact Inquiry Form State
    const [inquiryForm, setInquiryForm] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submittingInquiry, setSubmittingInquiry] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchNotices();
        fetchEvents();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const res = await ViewAllCourse();
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : (Array.isArray(res?.courses) ? res.courses : []);
            setCourses(list);
        } catch (err) {
            console.error("Failed to load courses on homepage:", err);
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchNotices = async () => {
        try {
            setLoadingNotices(true);
            const res = await ViewAllNotice();
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : (Array.isArray(res?.notices) ? res.notices : []);
            setNotices(list);
        } catch (err) {
            console.error("Failed to load notices on homepage:", err);
            setNotices([]);
        } finally {
            setLoadingNotices(false);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const res = await ViewAllEvent();
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setEvents(list);
        } catch (err) {
            console.error("Failed to load events on homepage:", err);
            setEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleInquiryChange = (e) => {
        setInquiryForm({
            ...inquiryForm,
            [e.target.name]: e.target.value
        });
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();

        if (!inquiryForm.fullName || !inquiryForm.email || !inquiryForm.message) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Details",
                text: "Please provide your name, email, and inquiry message.",
                confirmButtonColor: "#0f172a"
            });
            return;
        }

        try {
            setSubmittingInquiry(true);
            const res = await AddContact(inquiryForm);
            if (res?.data?.status !== false) {
                Swal.fire({
                    icon: "success",
                    title: "Inquiry Submitted!",
                    text: "Thank you for contacting SK College. Our admissions desk will respond to you shortly.",
                    confirmButtonColor: "#0f172a"
                });
                setInquiryForm({
                    fullName: "",
                    email: "",
                    subject: "",
                    message: ""
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed",
                    text: res?.data?.message || "Unable to send message.",
                    confirmButtonColor: "#0f172a"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonColor: "#0f172a"
            });
        } finally {
            setSubmittingInquiry(false);
        }
    };

    // Filter displayed courses (show top 6)
    const featuredCourses = courses.slice(0, 6);

    // Filter displayed notices (show top 4 recent)
    const recentNotices = notices.slice(0, 4);

    // Filter displayed events (show top 3)
    const upcomingEvents = events.slice(0, 3);

    // Genuine Campus Facilities Data
    const campusFacilities = [
        {
            title: "Central Academic Library",
            desc: "Comprehensive physical and digital collection of reference textbooks, national & international journals, and quiet reading areas.",
            image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
            icon: Library
        },
        {
            title: "High-Performance Computing Lab",
            desc: "Advanced computational laboratory equipped with high-speed workstations, AI suites, and software engineering development tools.",
            image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
            icon: Laptop
        },
        {
            title: "Smart Lecture Theatres",
            desc: "Ergonomically designed classrooms equipped with modern audiovisual projection systems, interactive displays, and acoustic treatment.",
            image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
            icon: Building2
        },
        {
            title: "Technical Engineering Laboratories",
            desc: "Practical hands-on laboratories for electronics, hardware diagnostics, robotics, applied mechanics, and scientific experimentation.",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
            icon: Compass
        },
        {
            title: "Auditorium & Seminar Halls",
            desc: "Acoustically engineered conference venue hosting academic symposiums, technical seminars, industry guest lectures, and cultural meets.",
            image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
            icon: Users
        },
        {
            title: "Sports & Athletics Infrastructure",
            desc: "Dedicated outdoor and indoor recreational arenas supporting student physical fitness, team competitions, and athletics.",
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
            icon: Award
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-slate-900 selection:text-white">
            {/* 1. PROFESSIONAL HEADER */}
            <Header />

            {/* Spacer for Fixed Header */}
            <div className="pt-20 md:pt-28">

                {/* 2. HERO SECTION */}
                <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
                    {/* Subtle Background Pattern & Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Left Hero Column */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Institutional Badge */}
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
                                    <Award className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Approved by AICTE &bull; College Code: SKC-104 &bull; Estd. 2010</span>
                                </div>

                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                                    Fostering Innovation, Academic Rigor &amp; <span className="text-slate-300 underline decoration-slate-600 decoration-2 underline-offset-8">Global Leadership</span>
                                </h1>

                                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                                    Welcome to SK College of Technology. We provide comprehensive undergraduate and postgraduate programs designed to empower the next generation of engineers, technologists, and professional managers with industry-aligned skills.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <Link
                                        to="/applyNow"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                        <span>Apply for Admission</span>
                                    </Link>

                                    <Link
                                        to="/program"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                                    >
                                        <BookOpen className="w-4 h-4 text-slate-300" />
                                        <span>Explore Courses</span>
                                    </Link>
                                </div>

                                {/* Key Highlights Strip */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800">
                                    <div className="border-l-2 border-slate-700 pl-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Accreditation</span>
                                        <span className="text-sm font-semibold text-white mt-0.5 block">AICTE Approved</span>
                                    </div>
                                    <div className="border-l-2 border-slate-700 pl-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Faculty</span>
                                        <span className="text-sm font-semibold text-white mt-0.5 block">Expert Mentors</span>
                                    </div>
                                    <div className="border-l-2 border-slate-700 pl-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Curriculum</span>
                                        <span className="text-sm font-semibold text-white mt-0.5 block">Industry Aligned</span>
                                    </div>
                                    <div className="border-l-2 border-slate-700 pl-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Admissions</span>
                                        <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">Session 2026-27</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Campus Hero Media */}
                            <div className="lg:col-span-5 flex justify-center lg:justify-end">
                                <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-3 border border-slate-800 shadow-2xl">
                                    <img
                                        src={home_img}
                                        alt="SK College Campus Education"
                                        className="w-full h-[380px] sm:h-[440px] object-cover rounded-2xl shadow-inner"
                                    />
                                    <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 hidden sm:flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                                            <Award className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <strong className="text-xs font-bold block text-slate-900">SK College of Technology</strong>
                                            <span className="text-[11px] text-slate-500 font-medium">Campus Code: SKC-104</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. COLLEGE INTRODUCTION & VISION */}
                <section className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
                                Institutional Overview
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Welcome to SK College of Technology
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Established with a commitment to academic distinction, SK College of Technology is dedicated to delivering transformative technical and managerial education. Our campus brings together qualified faculty, state-of-the-art laboratory infrastructure, and modern learning amenities.
                            </p>
                        </div>

                        {/* Vision and Mission Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Our Institutional Mission</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    To impart quality education across engineering, computing, and professional management through experiential pedagogy, practical laboratory training, ethical values, and industry collaboration, preparing students for responsible global citizenship.
                                </p>
                                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Interactive, student-centric academic instruction</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Continuous skill enhancement and practical lab training</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Career mentorship and dedicated placement support</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                                    <Award className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Our Institutional Vision</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    To emerge as an institution of technical excellence, recognized for innovation, scholarly rigor, ethical integrity, and producing professionals who positively influence society and modern industry.
                                </p>
                                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Pursuit of academic rigor and continuous curriculum relevance</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Encouraging ethical practices and leadership capabilities</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Holistic personal development through campus life</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center pt-10">
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-slate-700 border-b-2 border-slate-900 pb-1 hover:border-slate-500 transition"
                            >
                                <span>Learn More About Our Institution</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 4. ACADEMIC PROGRAMS SECTION (REAL API DATA) */}
                <section className="py-20 bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                                    Curriculum &amp; Courses
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Academic Programs Offered
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                                    Discover undergraduate and postgraduate degree courses delivered by qualified faculty across specialized engineering, computing, and management disciplines.
                                </p>
                            </div>

                            <Link
                                to="/program"
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-slate-600 transition shrink-0"
                            >
                                <span>Explore All Programs</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loadingCourses ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                                        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                        <div className="h-8 bg-slate-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : featuredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredCourses.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                    {item.courseType || "Degree Program"}
                                                </span>
                                                {item.courseCode && (
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        {item.courseCode}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900">
                                                {item.courseName}
                                            </h3>

                                            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Department:</span>
                                                    <span className="font-semibold text-slate-800">{item.department || "General"}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Duration:</span>
                                                    <span className="font-semibold text-slate-800">{item.duration || "4 Years"}</span>
                                                </div>
                                                {item.eligibility && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Eligibility:</span>
                                                        <span className="font-medium text-slate-700">{item.eligibility}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-4 border-t border-slate-100">
                                            <Link
                                                to={`/program/${item._id}`}
                                                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
                                            >
                                                <span>View Program Curriculum</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-700">Course Catalog Being Updated</p>
                                <p className="text-xs text-slate-400 mt-1">Please visit our programs catalog or contact the admissions desk.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. WHY CHOOSE SK COLLEGE */}
                <section className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
                                Institutional Strengths
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Why Choose SK College
                            </h2>
                            <p className="text-xs text-slate-500">
                                Experience genuine, student-focused technical and professional education built on practical skill acquisition.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Approved Curriculum",
                                    desc: "Programs structured as per regulatory standards, emphasizing fundamental science, modern engineering, and software tools.",
                                    icon: ShieldCheck
                                },
                                {
                                    title: "Experienced Faculty Mentors",
                                    desc: "Faculty with extensive academic teaching credentials and real-world domain expertise dedicated to student mentoring.",
                                    icon: Users
                                },
                                {
                                    title: "Equipped Laboratories",
                                    desc: "Modern computer labs, electronics stations, mechanical design facilities, and licensed educational software.",
                                    icon: Laptop
                                },
                                {
                                    title: "Central Physical & Digital Library",
                                    desc: "Extensive repository of prescribed textbooks, international academic journals, conference papers, and quiet study halls.",
                                    icon: Library
                                },
                                {
                                    title: "Dedicated Training & Placement Cell",
                                    desc: "Proactive guidance on technical interview preparation, aptitude training, career counseling, and campus recruitment drives.",
                                    icon: Award
                                },
                                {
                                    title: "Transparent Academic Governance",
                                    desc: "Systematic continuous assessment, structured semester examinations, and transparent student performance evaluation.",
                                    icon: CheckCircle2
                                }
                            ].map((f, i) => {
                                const IconComponent = f.icon;
                                return (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                                            <IconComponent className="w-5 h-5 text-slate-800" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 6. CAMPUS & FACILITIES */}
                <section className="py-20 bg-white border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
                                Campus Infrastructure
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Campus Facilities &amp; Learning Environment
                            </h2>
                            <p className="text-xs text-slate-500">
                                Explore modern campus facilities purpose-built to nurture learning, research, teamwork, and student recreation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {campusFacilities.map((fac, idx) => {
                                const FacilityIcon = fac.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col"
                                    >
                                        <div className="h-48 overflow-hidden relative bg-slate-100">
                                            <img
                                                src={fac.image}
                                                alt={fac.title}
                                                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg shadow-sm text-slate-800">
                                                <FacilityIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">
                                                    {fac.title}
                                                </h3>
                                                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                                    {fac.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 7. LATEST NOTICES & 8. UPCOMING EVENTS (SPLIT 2-COLUMN SECTION) */}
                <section className="py-20 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* LEFT: LATEST NOTICES */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Announcements
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Latest Circulars &amp; Notices
                                        </h2>
                                    </div>
                                    <Link
                                        to="/notice"
                                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                                    >
                                        <span>View All</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {loadingNotices ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((n) => (
                                            <div key={n} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse h-20"></div>
                                        ))}
                                    </div>
                                ) : recentNotices.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentNotices.map((item) => (
                                            <div
                                                key={item._id}
                                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-bold text-slate-900 hover:text-slate-700 transition">
                                                            {item.notice_title}
                                                        </h3>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                                {item.publish_date ? moment(item.publish_date).format("DD MMM YYYY") : "Recent"}
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span>Dept: {item.department || "General"}</span>
                                                        </div>
                                                    </div>

                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                                        {item.for_whom || "All"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="font-semibold text-slate-700">No active circulars at this time.</p>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: UPCOMING EVENTS */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Campus Calendar
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Upcoming Campus Events
                                        </h2>
                                    </div>
                                    <Link
                                        to="/events"
                                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                                    >
                                        <span>View Calendar</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {loadingEvents ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((n) => (
                                            <div key={n} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse h-20"></div>
                                        ))}
                                    </div>
                                ) : upcomingEvents.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingEvents.map((item) => (
                                            <div
                                                key={item._id}
                                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Event Date Block */}
                                                    <div className="bg-slate-900 text-white rounded-lg p-2.5 text-center shrink-0 w-14">
                                                        <span className="text-base font-extrabold block leading-none">
                                                            {item.event_date ? moment(item.event_date).format("DD") : "15"}
                                                        </span>
                                                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300 block mt-1">
                                                            {item.event_date ? moment(item.event_date).format("MMM") : "OCT"}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 flex-1">
                                                        <h3 className="text-xs font-bold text-slate-900">
                                                            {item.event_title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                {item.start_time || "10:00 AM"} {item.end_time ? `- ${item.end_time}` : ""}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                                {item.location || "Auditorium"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="font-semibold text-slate-700">No events scheduled at this moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. ADMISSION CTA BANNER */}
                <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl space-y-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold border border-slate-700">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Admissions Open for Session 2026-27</span>
                                </span>

                                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    Start Your Professional Journey at SK College
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Admissions are currently underway for engineering, technology, and management degree programs. Review eligibility criteria, submit your online application, or consult with our academic counseling team.
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-4">
                                    <Link
                                        to="/applyNow"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                        <span>Apply Online Now</span>
                                    </Link>

                                    <a
                                        href="tel:+919876543210"
                                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Admissions Helpline</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. CAMPUS CONTACT & INQUIRY SECTION */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            {/* Left Contact Details */}
                            <div className="lg:col-span-5 space-y-6">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                                        Campus Communications
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Connect With Our Admissions &amp; Campus Office
                                    </h2>
                                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                        Have inquiries regarding academic eligibility, tuition fees, campus visits, or batch schedules? Get in touch with our administrative desk.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <MapPin className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-xs font-bold text-slate-900 block">Campus Address</strong>
                                            <span className="text-xs text-slate-600">
                                                SK College Campus, Education City, Jaipur, Rajasthan - 302001
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <Phone className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-xs font-bold text-slate-900 block">Telephone &amp; Helpline</strong>
                                            <a href="tel:+919876543210" className="text-xs text-slate-700 font-semibold hover:underline">
                                                +91 98765 43210
                                            </a>
                                            <span className="text-[11px] text-slate-500 block">Office Hours: Mon - Sat, 9:00 AM - 5:00 PM</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <Mail className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-xs font-bold text-slate-900 block">Email Inquiries</strong>
                                            <a href="mailto:info@skcollege.edu" className="text-xs text-slate-700 font-semibold hover:underline block">
                                                info@skcollege.edu
                                            </a>
                                            <a href="mailto:admissions@skcollege.edu" className="text-xs text-slate-700 font-semibold hover:underline block">
                                                admissions@skcollege.edu
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Working Inquiry Form */}
                            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    Send an Academic Inquiry
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    Fill out the form below and an admissions counselor will reach out to you directly.
                                </p>

                                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="e.g. Rahul Sharma"
                                                value={inquiryForm.fullName}
                                                onChange={handleInquiryChange}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="e.g. rahul@example.com"
                                                value={inquiryForm.email}
                                                onChange={handleInquiryChange}
                                                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Subject / Program of Interest
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            placeholder="e.g. B.Tech Computer Science Admission Inquiry"
                                            value={inquiryForm.subject}
                                            onChange={handleInquiryChange}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Message / Query <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            name="message"
                                            placeholder="Please describe your query regarding programs, fee structures, or eligibility..."
                                            value={inquiryForm.message}
                                            onChange={handleInquiryChange}
                                            className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500 leading-relaxed"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingInquiry}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{submittingInquiry ? "Sending..." : "Submit Inquiry"}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 11. PROFESSIONAL FOOTER */}
                <Footer />
            </div>
        </div>
    );
}
