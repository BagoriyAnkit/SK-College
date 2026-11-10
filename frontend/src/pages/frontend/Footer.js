import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/SKcollege logo.png";
import { 
    MapPin, 
    Phone, 
    Mail, 
    ExternalLink, 
    ShieldCheck, 
    Award,
    Clock
} from "lucide-react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    };

    return (
        <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
                    {/* Column 1: College Brand & Overview */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="SK College Logo"
                                className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                            />
                            <div>
                                <span className="text-lg font-bold text-white block tracking-tight">
                                    SK College of Technology
                                </span>
                                <span className="text-[11px] text-slate-400 block font-medium">
                                    Approved by AICTE &bull; Estd. 2010
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            Dedicated to excellence in engineering, technology, and management education. Empowering future leaders through practical learning, research orientation, and ethical values.
                        </p>

                        <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>College Code: <strong>SKC-104</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>AICTE Approved Institution</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Institutional Links
                        </h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/about" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>About the Institution</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/program" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Academic Programs &amp; Courses</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/department" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Academic Departments</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/applyNow" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Online Admission Portal</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Faculty &amp; Research Mentors</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/notice" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Official Notices &amp; Circulars</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Campus Events &amp; Seminars</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Student Portals & Academics */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Student &amp; Campus Services
                        </h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/login" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Student &amp; Staff Login</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/exam" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Examination &amp; Assessment Cell</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/placements" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Training &amp; Placement Cell</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/batch" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Active Academic Batches</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Frequently Asked Questions</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1.5">
                                    <span>Campus Grievance &amp; Helpdesk</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Campus Contact Info */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Campus Contact
                        </h3>
                        <div className="space-y-3 text-xs text-slate-400">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>SK College Campus, Education City, Jaipur, Rajasthan - 302001</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                <a href="tel:+919876543210" className="hover:text-white transition">
                                    +91 98765 43210
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <a href="mailto:info@skcollege.edu" className="hover:text-white transition">
                                    info@skcollege.edu
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>Mon - Sat: 9:00 AM - 5:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Accreditation */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>
                        &copy; {new Date().getFullYear()} SK College of Technology &amp; Management. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/about" onClick={scrollToTop} className="hover:text-slate-300 transition">About Institution</Link>
                        <Link to="/contact" onClick={scrollToTop} className="hover:text-slate-300 transition">Contact Us</Link>
                        <Link to="/login" onClick={scrollToTop} className="hover:text-slate-300 transition">Portal Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
