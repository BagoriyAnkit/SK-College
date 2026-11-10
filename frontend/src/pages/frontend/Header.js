import React, { useState } from 'react';
import logo from "../../assets/SKcollege logo.png";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuthUser, getRedirectPathForRole } from '../../utils/auth';
import { 
    Menu, 
    X, 
    Phone, 
    Mail, 
    GraduationCap, 
    User, 
    Search,
    ChevronRight
} from "lucide-react";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const authUser = getAuthUser();
    const portalPath = authUser ? getRedirectPathForRole(authUser.role) : "/login";

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Programs", path: "/program" },
        { name: "Departments", path: "/department" },
        { name: "Admissions", path: "/applyNow" },
        { name: "Events", path: "/events" },
        { name: "Contact", path: "/contact" },
    ];

    const isActive = (path) => {
        if (path === "/" && location.pathname !== "/") return false;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-200">
            {/* Top Institutional Notification Strip */}
            <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 hidden md:block border-b border-slate-800">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Admissions Open for Session 2026-27
                        </span>
                        <span className="text-slate-600">|</span>
                        <span>AICTE Approved &bull; College Code: SKC-104</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-white transition">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 98765 43210</span>
                        </a>
                        <a href="mailto:info@skcollege.edu" className="flex items-center gap-1.5 hover:text-white transition">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>info@skcollege.edu</span>
                        </a>
                        <Link 
                            to="/applyNow" 
                            className="text-amber-400 hover:text-amber-300 font-semibold transition"
                        >
                            Online Application
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo & Name */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={logo}
                            alt="SK College Logo"
                            className="w-14 h-14 object-contain group-hover:scale-102 transition"
                        />
                        <div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                                SK College of Technology
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wider">
                                Excellence in Technical Education
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`text-xs font-semibold tracking-wide transition py-1 border-b-2 ${
                                    isActive(item.path)
                                        ? "text-slate-900 border-slate-900"
                                        : "text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/search")}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Search Courses and Notices"
                            aria-label="Search"
                        >
                            <Search className="w-4 h-4" />
                        </button>

                        <Link
                            to={portalPath}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-xs transition"
                        >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{authUser ? "My Portal" : "Student Login"}</span>
                        </Link>

                        <Link
                            to="/applyNow"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-sm transition"
                        >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Apply Now</span>
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link
                            to="/applyNow"
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold text-xs sm:hidden"
                        >
                            Apply
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            aria-label="Toggle Navigation Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                                    isActive(item.path)
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <span>{item.name}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                            </Link>
                        ))}
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <Link
                            to={portalPath}
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
                        >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>{authUser ? "Access My Portal" : "Student & Staff Login"}</span>
                        </Link>

                        <Link
                            to="/applyNow"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-2.5 px-4 text-center text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span>Apply for Admission (2026-27)</span>
                        </Link>
                    </div>

                    <div className="pt-2 text-center text-[11px] text-slate-400">
                        Helpline: +91 98765 43210 &bull; info@skcollege.edu
                    </div>
                </div>
            )}
        </header>
    );
}
