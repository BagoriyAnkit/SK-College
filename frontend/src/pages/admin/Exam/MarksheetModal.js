import React, { useEffect, useState } from "react";
import { 
    FaPrint, 
    FaTimes, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaExclamationTriangle, 
    FaGraduationCap 
} from "react-icons/fa";
import { GetStudentMarksheet } from "../../../Service/admin/Exam";

/**
 * MarksheetModal Component
 * Displays and prints the official institutional student marksheet with subject breakdown,
 * aggregate scores, percentage, pass/fail result, and missing marks audit.
 */
export default function MarksheetModal({ open, onClose, studentId, studentData }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const targetStudentId = studentId || studentData?._id || studentData?.studentId;

    useEffect(() => {
        if (open && targetStudentId) {
            loadMarksheet();
        }
    }, [open, targetStudentId]);

    const loadMarksheet = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await GetStudentMarksheet(targetStudentId);
            if (res && res.status) {
                setData(res);
            } else {
                setError(res?.message || "Failed to load marksheet data");
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load marksheet");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const handlePrint = () => {
        window.print();
    };

    const student = data?.student || studentData || {};
    const marksheet = data?.marksheet || {};
    const subjects = marksheet.subjects || [];
    const missingExams = marksheet.missingExams || [];

    const isPass = marksheet.result === "Pass";
    const isFail = marksheet.result === "Fail";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Scoped Print CSS */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-marksheet-card, #printable-marksheet-card * {
                        visibility: visible !important;
                    }
                    #printable-marksheet-card {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 24px !important;
                        box-shadow: none !important;
                        border: 2px solid #0f172a !important;
                        background: white !important;
                        z-index: 999999 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto border border-slate-200">
                {/* Modal Top Bar (Screen Only) */}
                <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                        <FaGraduationCap className="text-slate-300 text-xl" />
                        <h2 className="text-sm font-bold tracking-wide">
                            Official Student Marksheet
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition"
                            title="Print Marksheet"
                        >
                            <FaPrint className="text-xs text-slate-700" />
                            <span>Print Marksheet</span>
                        </button>
                        <button
                            onClick={onClose}
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-white text-base transition leading-none rounded-lg"
                            title="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Generating official marksheet...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-red-200 p-6">
                            <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-2" />
                            <p className="text-sm font-bold text-red-700">{error}</p>
                            <button
                                onClick={loadMarksheet}
                                className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div
                            id="printable-marksheet-card"
                            className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 sm:p-8 text-slate-800"
                        >
                            {/* College Official Institutional Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                                <div className="inline-block bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded uppercase tracking-wider mb-1.5">
                                    College Code: SKC-104 &bull; Established 2010
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    SK COLLEGE OF TECHNOLOGY &amp; MANAGEMENT
                                </h1>
                                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                    Approved by AICTE, Affiliated to State Technological University
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    College Campus, Education City &bull; Contact: info@skcollege.edu &bull; Web: www.skcollege.edu
                                </p>

                                <div className="mt-3 pt-2 border-t border-slate-200">
                                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                                        Official Grade Sheet / Student Marksheet
                                    </h2>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Academic Year: {marksheet.academicYear || "2026-27"}
                                    </span>
                                </div>
                            </div>

                            {/* Student Metadata Card */}
                            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-5 text-xs">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Student Name</span>
                                        <strong className="text-slate-900 text-sm font-bold">{student.name || student.StudentName || "Student"}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Roll Number</span>
                                        <strong className="text-slate-900 text-sm font-mono font-bold">{student.rollNumber || student.RollNumber || "N/A"}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Course / Program</span>
                                        <strong className="text-slate-800 font-medium">{student.course || "General"}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Batch / Class</span>
                                        <strong className="text-slate-800 font-medium">{student.batch || "N/A"}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Semester</span>
                                        <span className="text-slate-800 font-semibold">Semester {student.semester || 1}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Department</span>
                                        <span className="text-slate-800 font-medium">{student.department || "General"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Issue Date</span>
                                        <span className="text-slate-800 font-medium">
                                            {new Date(marksheet.generatedAt || Date.now()).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status</span>
                                        <span
                                            className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                                                isPass
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                    : isFail
                                                    ? "bg-red-100 text-red-800 border border-red-300"
                                                    : "bg-amber-100 text-amber-800 border border-amber-300"
                                            }`}
                                        >
                                            {marksheet.result || "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Subject-Wise Marks Table */}
                            <div className="mb-5 overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                                        <tr>
                                            <th className="py-2.5 px-3 border border-slate-300 w-10 text-center">#</th>
                                            <th className="py-2.5 px-3 border border-slate-300">Subject Name</th>
                                            <th className="py-2.5 px-3 border border-slate-300">Exam Type</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">Max Marks</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">Passing Marks</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">Marks Obtained</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">%</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">Grade</th>
                                            <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {subjects.length > 0 ? (
                                            subjects.map((sub, idx) => (
                                                <tr key={sub.marksId || idx} className="hover:bg-slate-50">
                                                    <td className="py-2 px-3 border border-slate-300 text-center font-mono text-slate-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                                                        {sub.subject}
                                                        <span className="block text-[10px] text-slate-500 font-normal">
                                                            {sub.examName}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-slate-600">
                                                        {sub.examType || "Semester"}
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-800">
                                                        {sub.maxMarks}
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center text-slate-600">
                                                        {sub.minMarks}
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-900">
                                                        {sub.marksObtained}
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center font-semibold text-slate-700">
                                                        {sub.percentage}%
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded text-[11px] ${
                                                                sub.grade === "A+" || sub.grade === "A"
                                                                    ? "text-emerald-700 font-bold"
                                                                    : sub.grade === "B+" || sub.grade === "B"
                                                                    ? "text-blue-700 font-bold"
                                                                    : sub.grade === "C" || sub.grade === "D"
                                                                    ? "text-amber-700 font-bold"
                                                                    : "text-red-700 font-bold"
                                                            }`}
                                                        >
                                                            {sub.grade || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 border border-slate-300 text-center">
                                                        {sub.status === "Pass" ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                                                <FaCheckCircle className="text-[10px] no-print" /> PASS
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[11px]">
                                                                <FaTimesCircle className="text-[10px] no-print" /> FAIL
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="py-6 text-center text-slate-500 italic">
                                                    No marks recorded yet for this student.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                    {/* Aggregate Summary Footer Row */}
                                    {subjects.length > 0 && (
                                        <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                                            <tr>
                                                <td colSpan="3" className="py-2.5 px-3 border border-slate-300 text-right uppercase">
                                                    Grand Total
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center">
                                                    {marksheet.totalMaxMarks}
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-500">
                                                    -
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-900 text-sm">
                                                    {marksheet.totalObtained}
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-900 text-sm">
                                                    {marksheet.percentage}%
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-900 text-sm">
                                                    {marksheet.grade}
                                                </td>
                                                <td className="py-2.5 px-3 border border-slate-300 text-center">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs uppercase font-extrabold ${
                                                            isPass
                                                                ? "bg-emerald-600 text-white"
                                                                : isFail
                                                                ? "bg-red-600 text-white"
                                                                : "bg-amber-600 text-white"
                                                        }`}
                                                    >
                                                        {marksheet.result}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Missing Marks Audit / Partial Warning */}
                            {missingExams.length > 0 && (
                                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                                        <FaExclamationTriangle className="text-amber-600" />
                                        <span>Incomplete Evaluation Notice: {missingExams.length} Scheduled Exam(s) Pending Marks</span>
                                    </div>
                                    <p className="text-[11px] text-amber-800 mb-2">
                                        Grand total obtained marks and percentage above are calculated strictly based on the {subjects.length} entered subject(s). The following subjects have not had marks recorded yet:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        {missingExams.map((me, i) => (
                                            <div key={me.examId || i} className="bg-white px-2.5 py-1.5 rounded border border-amber-200 flex justify-between">
                                                <span className="font-semibold text-slate-800">{me.subject} ({me.examName})</span>
                                                <span className="text-amber-700 font-bold">Pending</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-center text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Obtained</span>
                                    <strong className="text-base font-bold text-slate-900">
                                        {marksheet.totalObtained} / {marksheet.totalMaxMarks}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Percentage</span>
                                    <strong className="text-base font-bold text-slate-900">
                                        {marksheet.percentage}%
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Overall Grade</span>
                                    <strong className="text-base font-bold text-slate-900">
                                        {marksheet.grade}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Final Result</span>
                                    <strong
                                        className={`text-base font-bold uppercase ${
                                            isPass ? "text-emerald-700" : isFail ? "text-red-700" : "text-amber-700"
                                        }`}
                                    >
                                        {marksheet.result}
                                    </strong>
                                </div>
                            </div>

                            {/* Grading Legend Reference */}
                            <div className="border-t border-slate-200 pt-3 mb-8 text-[10px] text-slate-500">
                                <span className="font-bold text-slate-700 uppercase">Grading Scale: </span>
                                <span>A+ (90-100% Outstanding) &bull; </span>
                                <span>A (80-89% Excellent) &bull; </span>
                                <span>B+ (70-79% Very Good) &bull; </span>
                                <span>B (60-69% Good) &bull; </span>
                                <span>C (50-59% Average) &bull; </span>
                                <span>D (33-49% Pass) &bull; </span>
                                <span>F (&lt;33% or failed any subject: Fail)</span>
                            </div>

                            {/* Official Signatures Section */}
                            <div className="grid grid-cols-2 pt-6 border-t-2 border-slate-300 text-xs text-center">
                                <div>
                                    <div className="w-36 h-10 border-b border-dashed border-slate-400 mx-auto mb-1"></div>
                                    <strong className="block text-slate-800">Controller of Examinations</strong>
                                    <span className="text-[10px] text-slate-500">SK College of Technology</span>
                                </div>
                                <div>
                                    <div className="w-36 h-10 border-b border-dashed border-slate-400 mx-auto mb-1"></div>
                                    <strong className="block text-slate-800">Principal / Dean</strong>
                                    <span className="text-[10px] text-slate-500">SK College of Technology</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer (Screen Only) */}
                <div className="bg-slate-100 px-6 py-3 flex items-center justify-between border-t border-slate-200 no-print">
                    <span className="text-xs text-slate-500">
                        Use the <strong>Print Marksheet</strong> button to generate an official hard copy or PDF.
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            type="button"
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                        >
                            <FaPrint className="text-xs" />
                            <span>Print Marksheet</span>
                        </button>
                        <button
                            onClick={onClose}
                            type="button"
                            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition shadow-2xs"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
