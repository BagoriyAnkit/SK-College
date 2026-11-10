import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    User,
    Mail,
    Phone,
    GraduationCap,
    Award,
    CheckCircle2,
    ShieldCheck,
    FileText,
    ArrowRight,
    MapPin,
    Upload,
    AlertCircle,
    X,
    FileCheck
} from "lucide-react";
import { ApplyAdmissionApi } from "../../Service/frontend/Auth";
import { ViewAllCourse } from "../../Service/frontend/Course";
import Swal from "sweetalert2";

export default function ApplyNow() {
    const [formData, setFormData] = useState({
        studentName: "",
        DOB: "",
        gender: "",
        mobile: "",
        email: "",
        fatherName: "",
        motherName: "",
        parentMobile: "",
        qualification: "",
        board: "",
        passingYear: "",
        percentage: "",
        courseName: "",
        session: "2026-27",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [files, setFiles] = useState({
        photo: null,
        signature: null,
        marksheet: null,
    });

    const [fileErrors, setFileErrors] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [declaration, setDeclaration] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await ViewAllCourse();
                let list = [];
                if (Array.isArray(res?.data)) list = res.data;
                else if (Array.isArray(res?.data?.data)) list = res.data.data;
                else if (Array.isArray(res)) list = res;
                setCourses(list);
            } catch (err) {
                console.error("Could not fetch course options:", err);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear field error on edit
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleNumberInput = (e, maxLength) => {
        const { name, value } = e.target;
        const cleaned = value.replace(/\D/g, "").slice(0, maxLength);
        setFormData((prev) => ({
            ...prev,
            [name]: cleaned,
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handlePercentageInput = (e) => {
        const val = e.target.value;
        if (val === "" || (/^\d*\.?\d*$/.test(val) && parseFloat(val || "0") <= 100)) {
            setFormData((prev) => ({
                ...prev,
                percentage: val,
            }));
            if (fieldErrors.percentage) {
                setFieldErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.percentage;
                    return updated;
                });
            }
        }
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
        const allowedTypes = {
            photo: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
            signature: ["image/jpeg", "image/jpg", "image/png"],
            marksheet: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
        };

        if (file.size > maxSizeBytes) {
            setFileErrors((prev) => ({
                ...prev,
                [fieldName]: "File size exceeds the 5MB limit.",
            }));
            e.target.value = "";
            return;
        }

        const validTypes = allowedTypes[fieldName] || [];
        if (!validTypes.includes(file.type)) {
            const allowedLabels = fieldName === "marksheet" ? "JPG, PNG, or PDF" : "JPG, PNG, or WEBP";
            setFileErrors((prev) => ({
                ...prev,
                [fieldName]: `Invalid format. Please upload ${allowedLabels}.`,
            }));
            e.target.value = "";
            return;
        }

        // Clear error
        setFileErrors((prev) => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
        });

        setFiles((prev) => ({
            ...prev,
            [fieldName]: file,
        }));
    };

    const removeFile = (fieldName) => {
        setFiles((prev) => ({
            ...prev,
            [fieldName]: null,
        }));
        setFileErrors((prev) => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
        });
        const inputElem = document.getElementById(`file-input-${fieldName}`);
        if (inputElem) inputElem.value = "";
    };

    const validateForm = () => {
        const errors = {};

        // 1. Personal Details
        if (!formData.studentName.trim()) {
            errors.studentName = "Full Name is required.";
        } else if (formData.studentName.trim().length < 2) {
            errors.studentName = "Please enter a valid legal name.";
        }

        if (!formData.DOB) {
            errors.DOB = "Date of Birth is required.";
        } else {
            const birthDate = new Date(formData.DOB);
            const today = new Date();
            if (birthDate >= today) {
                errors.DOB = "Date of birth cannot be today or in the future.";
            }
        }

        if (!formData.gender) {
            errors.gender = "Please select your gender.";
        }

        if (!formData.mobile) {
            errors.mobile = "Mobile number is required.";
        } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            errors.mobile = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
        }

        if (!formData.email.trim()) {
            errors.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = "Enter a valid email address (e.g. applicant@example.com).";
        }

        if (!formData.fatherName.trim()) {
            errors.fatherName = "Father's name is required.";
        }

        if (!formData.motherName.trim()) {
            errors.motherName = "Mother's name is required.";
        }

        if (!formData.parentMobile) {
            errors.parentMobile = "Parent/Guardian mobile number is required.";
        } else if (!/^[6-9]\d{9}$/.test(formData.parentMobile)) {
            errors.parentMobile = "Enter a valid 10-digit parent mobile number.";
        }

        // 2. Academic Details
        if (!formData.qualification) {
            errors.qualification = "Please select your qualifying examination.";
        }

        if (!formData.board.trim()) {
            errors.board = "Board or University name is required.";
        }

        if (!formData.passingYear) {
            errors.passingYear = "Passing year is required.";
        } else {
            const yearNum = parseInt(formData.passingYear, 10);
            if (isNaN(yearNum) || yearNum < 1980 || yearNum > 2030) {
                errors.passingYear = "Enter a valid 4-digit passing year.";
            }
        }

        if (formData.percentage === "" || formData.percentage === null || formData.percentage === undefined) {
            errors.percentage = "Percentage is required.";
        } else {
            const pct = parseFloat(formData.percentage);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                errors.percentage = "Percentage must be between 0 and 100.";
            }
        }

        if (!formData.courseName) {
            errors.courseName = "Please select the applying degree program / course.";
        }

        if (!formData.session) {
            errors.session = "Academic session is required.";
        }

        // 3. Additional Details
        if (!formData.address.trim()) {
            errors.address = "Complete residential address is required.";
        }

        if (!formData.city.trim()) {
            errors.city = "City is required.";
        }

        if (!formData.state.trim()) {
            errors.state = "State is required.";
        }

        if (!formData.pincode) {
            errors.pincode = "PIN Code is required.";
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            errors.pincode = "PIN Code must be a 6-digit postal code.";
        }

        if (!declaration) {
            errors.declaration = "You must accept the institutional declaration to proceed.";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            Swal.fire({
                icon: "warning",
                title: "Incomplete or Invalid Details",
                text: errors[firstErrorKey],
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        if (Object.keys(fileErrors).length > 0) {
            Swal.fire({
                icon: "warning",
                title: "File Attachment Error",
                text: "Please resolve the upload errors before submitting.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append("studentName", formData.studentName.trim());
            payload.append("full_name", formData.studentName.trim());
            payload.append("DOB", formData.DOB);
            payload.append("gender", formData.gender);
            payload.append("mobile", formData.mobile.trim());
            payload.append("mobile_no", formData.mobile.trim());
            payload.append("email", formData.email.trim().toLowerCase());
            payload.append("fatherName", formData.fatherName.trim());
            payload.append("motherName", formData.motherName.trim());
            payload.append("parentMobile", formData.parentMobile.trim());
            payload.append("qualification", formData.qualification);
            payload.append("board", formData.board.trim());
            payload.append("passingYear", formData.passingYear);
            payload.append("percentage", formData.percentage);
            payload.append("courseName", formData.courseName);
            payload.append("course", formData.courseName);
            payload.append("session", formData.session);
            payload.append("address", formData.address.trim());
            payload.append("city", formData.city.trim());
            payload.append("state", formData.state.trim());
            payload.append("pincode", formData.pincode.trim());

            if (files.photo) {
                payload.append("photo", files.photo);
            }
            if (files.signature) {
                payload.append("signature", files.signature);
            }
            if (files.marksheet) {
                payload.append("marksheet", files.marksheet);
            }

            const res = await ApplyAdmissionApi(payload);

            if (res.data?.status !== false) {
                await Swal.fire({
                    icon: "success",
                    title: "Application Submitted Successfully!",
                    html: `
                        <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #334155;">
                            <p style="margin-bottom: 8px;">Dear <strong>${formData.studentName.trim()}</strong>,</p>
                            <p style="margin-bottom: 8px;">Your admission application for <strong>${formData.courseName}</strong> (Academic Session <strong>${formData.session}</strong>) has been registered successfully.</p>
                            <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin: 12px 0; border: 1px solid #e2e8f0;">
                                <p style="margin: 2px 0;"><strong>Registered Email:</strong> ${formData.email.trim().toLowerCase()}</p>
                                <p style="margin: 2px 0;"><strong>Mobile:</strong> +91 ${formData.mobile.trim()}</p>
                                <p style="margin: 2px 0;"><strong>Application Status:</strong> Under Review</p>
                            </div>
                            <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Our admissions committee will verify your credentials and qualifying examination details. You will receive updates via email and SMS.</p>
                        </div>
                    `,
                    confirmButtonText: "Done",
                    confirmButtonColor: "#0f172a",
                });

                // Reset form
                setFormData({
                    studentName: "",
                    DOB: "",
                    gender: "",
                    mobile: "",
                    email: "",
                    fatherName: "",
                    motherName: "",
                    parentMobile: "",
                    qualification: "",
                    board: "",
                    passingYear: "",
                    percentage: "",
                    courseName: "",
                    session: "2026-27",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                });
                setFiles({
                    photo: null,
                    signature: null,
                    marksheet: null,
                });
                setFieldErrors({});
                setFileErrors({});
                ["photo", "signature", "marksheet"].forEach((f) => {
                    const elem = document.getElementById(`file-input-${f}`);
                    if (elem) elem.value = "";
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Submission Failed",
                    text: res.data?.message || "Unable to submit application.",
                    confirmButtonColor: "#0f172a",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Submission Error",
                text: error.response?.data?.message || "Something went wrong while submitting. Please try again later.",
                confirmButtonColor: "#0f172a",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
            {/* 1. Header */}
            <Header />

            {/* Spacer for Fixed Header */}
            <div className="pt-20 md:pt-28 flex-1">

                {/* 2. Institutional Banner */}
                <section className="relative bg-slate-950 text-white overflow-hidden py-12 sm:py-16 border-b border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                            <span>/</span>
                            <span className="text-slate-200">Admissions</span>
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold mb-3">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Admissions Open 2026-27 &bull; College Code: SKC-104</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
                            Online Admission Application
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Submit your formal application for academic enrollment. Please provide accurate personal, academic, and contact details as per your official secondary school certificates.
                        </p>
                    </div>
                </section>

                {/* 3. Main Form & Institutional Information */}
                <section className="py-10 sm:py-14">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Left Column: Guidelines & Prerequisites */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Admission Highlights */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Admission Procedure</span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 mb-3">
                                        Four-Step Admission Flow
                                    </h3>

                                    <ol className="space-y-3.5 text-xs text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                1
                                            </span>
                                            <div>
                                                <strong className="text-slate-900 block font-semibold">Online Application:</strong>
                                                Fill personal, academic, residential, and upload necessary proofs.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                2
                                            </span>
                                            <div>
                                                <strong className="text-slate-900 block font-semibold">Eligibility Verification:</strong>
                                                Admissions committee reviews qualifying marks and percentage.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                3
                                            </span>
                                            <div>
                                                <strong className="text-slate-900 block font-semibold">Seat Allotment:</strong>
                                                Admission approval confirmation issued along with enrollment details.
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                4
                                            </span>
                                            <div>
                                                <strong className="text-slate-900 block font-semibold">Student Portal Setup:</strong>
                                                Receive student portal credentials to access classes, fees, and exams.
                                            </div>
                                        </li>
                                    </ol>
                                </div>

                                {/* Checklist of Documents */}
                                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xs">
                                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Document Guidelines</span>
                                    </h3>
                                    <ul className="space-y-2.5 text-xs text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span><strong>Photograph:</strong> Clear passport style photo in JPG or PNG format (&le; 5MB).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span><strong>Signature:</strong> Clear specimen on white paper in JPG or PNG (&le; 5MB).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span><strong>Marksheet:</strong> Latest marksheet (10th/12th/Graduation) in JPG, PNG, or PDF (&le; 5MB).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>Valid 10-digit Indian mobile number for SMS OTP &amp; verification updates.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Admissions Contact Helpline */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-xs text-slate-600">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                                        Admissions Helpdesk
                                    </h4>
                                    <p className="mb-3 text-slate-500">
                                        Have questions regarding eligibility or choice of program? Reach out to our counselors:
                                    </p>
                                    <div className="space-y-1.5 text-slate-800 font-medium">
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Helpline: <strong className="text-slate-900">+91 98765 43210</strong></span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Email: <strong className="text-slate-900">admissions@skcollege.edu</strong></span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Application Form */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-9 shadow-xs">
                                    <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                                Application Form
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Fill in all required fields accurately. Documents will be scrutinized during enrollment.
                                            </p>
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                                            Fields with <span className="text-rose-500 font-bold">*</span> are mandatory
                                        </span>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* ================= SECTION 1: PERSONAL DETAILS ================= */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                                <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-700" />
                                                    <span>1. Personal Details</span>
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Full Name */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Full Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="studentName"
                                                        value={formData.studentName}
                                                        onChange={handleChange}
                                                        placeholder="Full legal name as per secondary marksheet"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.studentName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.studentName && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.studentName}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Date of Birth */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Date of Birth <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            name="DOB"
                                                            value={formData.DOB}
                                                            onChange={handleChange}
                                                            max={new Date().toISOString().split("T")[0]}
                                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                                fieldErrors.DOB ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                            }`}
                                                        />
                                                    </div>
                                                    {fieldErrors.DOB && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.DOB}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Gender <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer ${
                                                            fieldErrors.gender ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    >
                                                        <option value="">-- Select Gender --</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    {fieldErrors.gender && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.gender}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Mobile Number */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Mobile Number (10 digits) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                            +91
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            name="mobile"
                                                            value={formData.mobile}
                                                            onChange={(e) => handleNumberInput(e, 10)}
                                                            placeholder="9876543210"
                                                            className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                                fieldErrors.mobile ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                            }`}
                                                        />
                                                    </div>
                                                    {fieldErrors.mobile && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.mobile}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Email Address */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Email Address <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="applicant@example.com"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.email ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.email && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.email}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Father's Name */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Father's Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="fatherName"
                                                        value={formData.fatherName}
                                                        onChange={handleChange}
                                                        placeholder="Enter father's full name"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.fatherName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.fatherName && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.fatherName}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Mother's Name */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Mother's Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="motherName"
                                                        value={formData.motherName}
                                                        onChange={handleChange}
                                                        placeholder="Enter mother's full name"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.motherName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.motherName && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.motherName}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Parent/Guardian Mobile Number */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Parent / Guardian Mobile Number (10 digits) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                            +91
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            name="parentMobile"
                                                            value={formData.parentMobile}
                                                            onChange={(e) => handleNumberInput(e, 10)}
                                                            placeholder="Parent / Guardian contact number"
                                                            className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                                fieldErrors.parentMobile ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                            }`}
                                                        />
                                                    </div>
                                                    {fieldErrors.parentMobile && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.parentMobile}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ================= SECTION 2: ACADEMIC DETAILS ================= */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                                <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                                                    <span>2. Academic Details</span>
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Qualification */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Qualifying Examination <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        name="qualification"
                                                        value={formData.qualification}
                                                        onChange={handleChange}
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer ${
                                                            fieldErrors.qualification ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    >
                                                        <option value="">-- Select Highest Qualification --</option>
                                                        <option value="10th">10th / Secondary</option>
                                                        <option value="12th">12th / Senior Secondary (HSC)</option>
                                                        <option value="Diploma">Diploma / Polytechnic</option>
                                                        <option value="Graduation">Graduation / Bachelor's Degree</option>
                                                        <option value="Post Graduation">Post Graduation / Master's Degree</option>
                                                    </select>
                                                    {fieldErrors.qualification && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.qualification}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Board / University */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Board / University <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="board"
                                                        value={formData.board}
                                                        onChange={handleChange}
                                                        placeholder="e.g. CBSE, Rajasthan State Board, RTU"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.board ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.board && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.board}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Passing Year */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Passing Year <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="passingYear"
                                                        value={formData.passingYear}
                                                        onChange={(e) => handleNumberInput(e, 4)}
                                                        placeholder="e.g. 2025"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.passingYear ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.passingYear && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.passingYear}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Qualification Percentage */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Qualification Percentage (%) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="percentage"
                                                            value={formData.percentage}
                                                            onChange={handlePercentageInput}
                                                            placeholder="e.g. 85.50 (0 to 100)"
                                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                                fieldErrors.percentage ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                            }`}
                                                        />
                                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                            %
                                                        </span>
                                                    </div>
                                                    {fieldErrors.percentage && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.percentage}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Applying Course */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Applying Course / Program <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        name="courseName"
                                                        value={formData.courseName}
                                                        onChange={handleChange}
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer ${
                                                            fieldErrors.courseName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    >
                                                        <option value="">-- Select Degree Course --</option>
                                                        {courses.map((c) => (
                                                            <option key={c._id || c.courseName} value={c.courseName}>
                                                                {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {fieldErrors.courseName && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.courseName}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Academic Session */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Academic Session <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        name="session"
                                                        value={formData.session}
                                                        onChange={handleChange}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition cursor-pointer"
                                                    >
                                                        <option value="2026-27">2026-27 (Current Intake)</option>
                                                        <option value="2025-26">2025-26</option>
                                                        <option value="2027-28">2027-28</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ================= SECTION 3: ADDITIONAL / RESIDENTIAL DETAILS ================= */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                                <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-700" />
                                                    <span>3. Additional &amp; Residential Details</span>
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {/* Full Address */}
                                                <div className="sm:col-span-3">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Full Residential Address <span className="text-rose-500">*</span>
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        rows={2}
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="House/Flat number, Street name, Locality, Landmark"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.address ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.address && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.address}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* City */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        City <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Jaipur"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.city ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.city && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.city}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* State */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        State <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Rajasthan"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.state ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.state && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.state}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* PIN Code */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                        PIN Code (6 digits) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={(e) => handleNumberInput(e, 6)}
                                                        placeholder="e.g. 302001"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                                                            fieldErrors.pincode ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-900"
                                                        }`}
                                                    />
                                                    {fieldErrors.pincode && (
                                                        <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{fieldErrors.pincode}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ================= SECTION 4: DOCUMENT UPLOADS ================= */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                                <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Upload className="w-3.5 h-3.5 text-slate-700" />
                                                    <span>4. Document Uploads</span>
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {/* Upload Photograph */}
                                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-900 mb-1">
                                                            Upload Photograph
                                                        </label>
                                                        <p className="text-[11px] text-slate-500 mb-3">
                                                            Recent passport size photograph (JPG, PNG &le; 5MB).
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {files.photo ? (
                                                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                    <span className="truncate font-medium">{files.photo.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile("photo")}
                                                                    className="text-emerald-700 hover:text-emerald-900 ml-1 p-0.5"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                htmlFor="file-input-photo"
                                                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-100/60 text-slate-700 text-xs font-semibold cursor-pointer transition"
                                                            >
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>Choose Photo</span>
                                                            </label>
                                                        )}
                                                        <input
                                                            id="file-input-photo"
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={(e) => handleFileChange(e, "photo")}
                                                            className="hidden"
                                                        />
                                                        {fileErrors.photo && (
                                                            <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                                <span>{fileErrors.photo}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Upload Signature */}
                                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-900 mb-1">
                                                            Upload Signature
                                                        </label>
                                                        <p className="text-[11px] text-slate-500 mb-3">
                                                            Signature specimen on white paper (JPG, PNG &le; 5MB).
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {files.signature ? (
                                                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                    <span className="truncate font-medium">{files.signature.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile("signature")}
                                                                    className="text-emerald-700 hover:text-emerald-900 ml-1 p-0.5"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                htmlFor="file-input-signature"
                                                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-100/60 text-slate-700 text-xs font-semibold cursor-pointer transition"
                                                            >
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>Choose Signature</span>
                                                            </label>
                                                        )}
                                                        <input
                                                            id="file-input-signature"
                                                            type="file"
                                                            accept="image/jpeg,image/png"
                                                            onChange={(e) => handleFileChange(e, "signature")}
                                                            className="hidden"
                                                        />
                                                        {fileErrors.signature && (
                                                            <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                                <span>{fileErrors.signature}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Upload Marksheet */}
                                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-900 mb-1">
                                                            Qualification Marksheet
                                                        </label>
                                                        <p className="text-[11px] text-slate-500 mb-3">
                                                            Previous qualification marksheet (JPG, PNG, PDF &le; 5MB).
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {files.marksheet ? (
                                                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                    <span className="truncate font-medium">{files.marksheet.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile("marksheet")}
                                                                    className="text-emerald-700 hover:text-emerald-900 ml-1 p-0.5"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                htmlFor="file-input-marksheet"
                                                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-100/60 text-slate-700 text-xs font-semibold cursor-pointer transition"
                                                            >
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>Choose Marksheet</span>
                                                            </label>
                                                        )}
                                                        <input
                                                            id="file-input-marksheet"
                                                            type="file"
                                                            accept="image/jpeg,image/png,application/pdf"
                                                            onChange={(e) => handleFileChange(e, "marksheet")}
                                                            className="hidden"
                                                        />
                                                        {fileErrors.marksheet && (
                                                            <p className="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                                <span>{fileErrors.marksheet}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ================= TERMS & DECLARATION ================= */}
                                        <div className="pt-2">
                                            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={declaration}
                                                    onChange={(e) => {
                                                        setDeclaration(e.target.checked);
                                                        if (e.target.checked && fieldErrors.declaration) {
                                                            setFieldErrors((prev) => {
                                                                const updated = { ...prev };
                                                                delete updated.declaration;
                                                                return updated;
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 mt-0.5"
                                                />
                                                <span className="leading-relaxed">
                                                    I hereby declare that all particulars stated in this application are genuine and authentic to the best of my knowledge. I agree to abide by the academic rules, attendance codes, and regulations of SK College of Technology.
                                                </span>
                                            </label>
                                            {fieldErrors.declaration && (
                                                <p className="text-rose-500 text-[11px] font-medium mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span>{fieldErrors.declaration}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* ================= SUBMIT BUTTON ================= */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition active:scale-[0.99] disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                        <span>Submitting Application...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Submit Admission Application</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Student Login Link */}
                                    <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs text-slate-500">
                                        Already registered as an admitted student?{" "}
                                        <Link to="/login" className="text-slate-900 font-bold hover:underline ml-1">
                                            Student Portal Login &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </div>

            {/* 4. Footer */}
            <Footer />
        </div>
    );
}
