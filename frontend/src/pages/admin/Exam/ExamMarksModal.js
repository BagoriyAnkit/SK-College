import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
    FaTrash, 
    FaPlus, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaGraduationCap, 
    FaPrint, 
    FaEdit, 
    FaTimes,
    FaClipboardList
} from "react-icons/fa";
import { 
    GetExamMarks, 
    AddStudentMarks, 
    UpdateStudentMarks, 
    DeleteStudentMarks 
} from "../../../Service/admin/Exam";
import { ViewAllStudent } from "../../../Service/admin/Student";
import MarksheetModal from "./MarksheetModal";

export default function ExamMarksModal({ open, onClose, exam }) {
    const [marksList, setMarksList] = useState([]);
    const [summary, setSummary] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [marksheetOpen, setMarksheetOpen] = useState(false);
    const [selectedStudentForMarksheet, setSelectedStudentForMarksheet] = useState(null);

    // Form states
    const [editingMarksId, setEditingMarksId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [marksObtained, setMarksObtained] = useState("");
    const [remarks, setRemarks] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const examId = exam?._id;
    const maxMarks = Number(exam?.maxMarks || exam?.MaxMarks || 100);
    const minMarks = Number(exam?.minMarks !== undefined ? exam.minMarks : (exam?.MinMarks !== undefined ? exam.MinMarks : 33));

    const loadMarksData = async () => {
        if (!examId) return;
        try {
            setLoading(true);
            const [marksRes, studentRes] = await Promise.all([
                GetExamMarks(examId),
                ViewAllStudent(1, 200)
            ]);
            if (marksRes?.data) setMarksList(marksRes.data);
            if (marksRes?.summary) setSummary(marksRes.summary);
            if (studentRes?.data) setStudents(studentRes.data);
        } catch (err) {
            console.error("Failed to load marks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && examId) {
            loadMarksData();
            resetForm();
        }
    }, [open, examId]);

    const resetForm = () => {
        setEditingMarksId(null);
        setSelectedStudent("");
        setMarksObtained("");
        setRemarks("");
        setErrorMsg("");
    };

    if (!open || !exam) return null;

    // Filter students: highlight or separate those already graded
    const alreadyGradedStudentIds = new Set(
        marksList.map((m) => String(m.student?._id || m.student))
    );

    const availableStudents = students.filter(
        (s) => !alreadyGradedStudentIds.has(String(s._id))
    );

    const handleStartEdit = (marksItem) => {
        setEditingMarksId(marksItem._id);
        setSelectedStudent(marksItem.student?._id || marksItem.student);
        setMarksObtained(String(marksItem.marksObtained));
        setRemarks(marksItem.remarks || "");
        setErrorMsg("");
    };

    const handleSaveMarks = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!selectedStudent && !editingMarksId) {
            setErrorMsg("Please select a student");
            return;
        }

        const score = Number(marksObtained);
        if (marksObtained === "" || isNaN(score)) {
            setErrorMsg("Please enter a valid numeric score");
            return;
        }

        if (score < 0) {
            setErrorMsg("Obtained marks cannot be negative");
            return;
        }

        if (score > maxMarks) {
            setErrorMsg(`Obtained marks (${score}) cannot exceed maximum marks (${maxMarks})`);
            return;
        }

        try {
            setSubmitting(true);

            if (editingMarksId) {
                // Update existing marks record
                const res = await UpdateStudentMarks(examId, editingMarksId, {
                    marksObtained: score,
                    maxMarks: maxMarks,
                    remarks: remarks.trim()
                });

                if (res && res.status !== false) {
                    Swal.fire({
                        title: "Updated!",
                        text: "Student marks successfully updated.",
                        icon: "success",
                        timer: 1200,
                        showConfirmButton: false
                    });
                    resetForm();
                    loadMarksData();
                } else {
                    setErrorMsg(res?.message || "Failed to update marks");
                }
            } else {
                // Add new marks record
                const res = await AddStudentMarks(examId, {
                    studentId: selectedStudent,
                    marksObtained: score,
                    maxMarks: maxMarks,
                    remarks: remarks.trim()
                });

                if (res && res.status !== false) {
                    Swal.fire({
                        title: "Recorded!",
                        text: "Student marks saved successfully.",
                        icon: "success",
                        timer: 1200,
                        showConfirmButton: false
                    });
                    resetForm();
                    loadMarksData();
                } else {
                    setErrorMsg(res?.message || "Failed to record marks");
                }
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || "Failed to save marks";
            setErrorMsg(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMarks = async (marksId) => {
        const result = await Swal.fire({
            title: "Delete Marks Entry?",
            text: "Are you sure you want to remove this student's recorded marks?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#dc2626",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await DeleteStudentMarks(examId, marksId);
                Swal.fire({
                    title: "Deleted",
                    text: "Marks record deleted successfully.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
                if (editingMarksId === marksId) {
                    resetForm();
                }
                loadMarksData();
            } catch (err) {
                Swal.fire({
                    title: "Error",
                    text: err?.response?.data?.message || "Failed to delete marks.",
                    icon: "error"
                });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FaClipboardList className="text-slate-300 text-lg" />
                            <h2 className="text-lg font-bold tracking-tight">
                                {exam.examName || exam.ExamName}
                            </h2>
                            <span className="bg-slate-800 text-slate-200 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                                {exam.examType || "Semester"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Subject: <strong className="text-white">{exam.subject}</strong> &bull; Course:{" "}
                            {exam.course?.courseName || exam.courseName || "General"} &bull; Batch:{" "}
                            {exam.batch?.batchName || exam.batchName || exam.ClassId || "N/A"} &bull; Max Marks:{" "}
                            <strong className="text-white font-bold">{maxMarks}</strong> (Passing: {minMarks})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                        title="Close"
                    >
                        <FaTimes className="text-base" />
                    </button>
                </div>

                {/* KPI Summary Strip */}
                {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-center">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Total Graded</span>
                            <span className="text-lg font-bold text-slate-900">{summary.totalStudents}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block">Passed</span>
                            <span className="text-lg font-bold text-emerald-700">{summary.passed}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block">Failed</span>
                            <span className="text-lg font-bold text-red-600">{summary.failed}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 block">Highest Marks</span>
                            <span className="text-lg font-bold text-slate-900">
                                {summary.highestMarks} <span className="text-xs text-slate-400 font-normal">/ {maxMarks}</span>
                            </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Average %</span>
                            <span className="text-lg font-bold text-slate-900">{summary.avgPercentage}%</span>
                        </div>
                    </div>
                )}

                <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                    {/* Enter / Edit Marks Form Card */}
                    <div className={`p-4 rounded-xl border ${editingMarksId ? "bg-amber-50/60 border-amber-300" : "bg-white border-slate-200"} shadow-xs`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                {editingMarksId ? (
                                    <>
                                        <FaEdit className="text-amber-600 text-xs" />
                                        <span>Update Student Marks</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="text-slate-600 text-xs" />
                                        <span>Enter Student Marks</span>
                                    </>
                                )}
                            </h3>

                            {editingMarksId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSaveMarks} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Student Select */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Select Student <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedStudent}
                                        disabled={Boolean(editingMarksId)}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none focus:border-slate-500"
                                    >
                                        <option value="">-- Choose Student --</option>
                                        {editingMarksId ? (
                                            students.map((s) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.StudentName} {s.rollNumber ? `(Roll: ${s.rollNumber})` : ""}
                                                </option>
                                            ))
                                        ) : availableStudents.length > 0 ? (
                                            availableStudents.map((s) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.StudentName} {s.rollNumber ? `(Roll: ${s.rollNumber})` : ""}
                                                </option>
                                            ))
                                        ) : (
                                            students.map((s) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.StudentName} {s.rollNumber ? `(Roll: ${s.rollNumber})` : ""}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* Marks Obtained */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Marks Obtained <span className="text-red-500">*</span> (0 - {maxMarks})
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={`e.g. 85`}
                                        min="0"
                                        max={maxMarks}
                                        value={marksObtained}
                                        onChange={(e) => setMarksObtained(e.target.value)}
                                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                    />
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Remarks (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Good analytical reasoning"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <p className="text-xs text-red-600 font-semibold">
                                    &bull; {errorMsg}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                                {editingMarksId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingMarksId
                                        ? "Update Marks"
                                        : "Record Marks"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Marks List Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Graded Students ({marksList.length})
                            </h3>
                            <span className="text-xs text-slate-500">
                                Pass Threshold: <strong>{minMarks} Marks</strong>
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800"></div>
                                <p className="text-xs text-slate-500 mt-2">Loading marks records...</p>
                            </div>
                        ) : marksList.length === 0 ? (
                            <div className="text-center py-12 p-6">
                                <FaGraduationCap className="mx-auto text-slate-300 text-3xl mb-2" />
                                <p className="text-sm font-semibold text-slate-700">No Marks Recorded Yet</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Select an enrolled student above and enter their marks to record assessment results.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                        <tr className="text-[11px] uppercase tracking-wider">
                                            <th className="py-2.5 px-4">Roll No</th>
                                            <th className="py-2.5 px-4">Student Name</th>
                                            <th className="py-2.5 px-4 text-center">Obtained Marks</th>
                                            <th className="py-2.5 px-4 text-center">Percentage</th>
                                            <th className="py-2.5 px-4 text-center">Grade</th>
                                            <th className="py-2.5 px-4 text-center">Status</th>
                                            <th className="py-2.5 px-4">Remarks</th>
                                            <th className="py-2.5 px-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {marksList.map((m) => {
                                            const isPass = m.status === "Pass" || Number(m.marksObtained) >= minMarks;
                                            return (
                                                <tr key={m._id} className="hover:bg-slate-50/80 transition">
                                                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                                                        {m.rollNumber || m.student?.rollNumber || m.student?.RollNumber || "N/A"}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                                                        {m.studentName || m.student?.StudentName || "Student"}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                                                        {m.marksObtained} <span className="text-slate-400 font-normal">/ {m.maxMarks}</span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center font-semibold text-slate-700">
                                                        {m.percentage}%
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <span
                                                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                                                m.grade === "A+" || m.grade === "A"
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : m.grade === "B+" || m.grade === "B"
                                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                    : m.grade === "C" || m.grade === "D"
                                                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                    : "bg-red-50 text-red-700 border border-red-200"
                                                            }`}
                                                        >
                                                            {m.grade || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        {isPass ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                <FaCheckCircle className="text-[10px]" /> Pass
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                                                <FaTimesCircle className="text-[10px]" /> Fail
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate">
                                                        {m.remarks || "-"}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedStudentForMarksheet(m.student || { _id: m.student, name: m.studentName, rollNumber: m.rollNumber });
                                                                    setMarksheetOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 p-1 text-xs font-semibold hover:underline"
                                                                title="View Student Marksheet"
                                                            >
                                                                <FaPrint className="text-[10px]" /> Marksheet
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartEdit(m)}
                                                                className="p-1 text-slate-500 hover:text-slate-900 rounded transition"
                                                                title="Edit Marks"
                                                            >
                                                                <FaEdit className="text-xs" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMarks(m._id)}
                                                                className="p-1 text-red-500 hover:text-red-700 rounded transition"
                                                                title="Delete Marks"
                                                            >
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-3 flex justify-end border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Marksheet Modal */}
            <MarksheetModal
                open={marksheetOpen}
                onClose={() => setMarksheetOpen(false)}
                studentId={selectedStudentForMarksheet?._id}
                studentData={selectedStudentForMarksheet}
            />
        </div>
    );
}
