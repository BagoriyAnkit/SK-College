import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
    FaGraduationCap, 
    FaPrint, 
    FaSearch, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaExclamationTriangle, 
    FaUsers, 
    FaClipboardList,
    FaTimes
} from "react-icons/fa";
import Loader from "../../../Components/Loader";
import { ViewAllBatch } from "../../../Service/admin/Batch";
import { ViewAllExam, GetBatchResults, GetExamMarks } from "../../../Service/admin/Exam";
import MarksheetModal from "./MarksheetModal";

export default function Results() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") === "exam" ? "exam" : "batch";

    const [activeTab, setActiveTab] = useState(initialTab); // "batch" or "exam"
    const [batches, setBatches] = useState([]);
    const [exams, setExams] = useState([]);

    // Batch-wise state
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [batchData, setBatchData] = useState(null);
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchSearch, setBatchSearch] = useState("");
    const [batchStatusFilter, setBatchStatusFilter] = useState("ALL");
    const [batchPage, setBatchPage] = useState(1);
    const [batchLimit, setBatchLimit] = useState(10);

    // Exam-wise state
    const [selectedExamId, setSelectedExamId] = useState("");
    const [examData, setExamData] = useState(null);
    const [examLoading, setExamLoading] = useState(false);
    const [examSearch, setExamSearch] = useState("");
    const [examPage, setExamPage] = useState(1);
    const [examLimit, setExamLimit] = useState(10);

    // Marksheet Modal state
    const [marksheetModalOpen, setMarksheetModalOpen] = useState(false);
    const [selectedStudentForMarksheet, setSelectedStudentForMarksheet] = useState(null);

    // Load initial Batches and Exams dropdown data
    useEffect(() => {
        loadBatchesAndExams();
    }, []);

    const loadBatchesAndExams = async () => {
        try {
            const [batchRes, examRes] = await Promise.all([
                ViewAllBatch(1, 100),
                ViewAllExam(1, 100)
            ]);

            if (batchRes?.data) {
                setBatches(batchRes.data);
                if (batchRes.data.length > 0 && !selectedBatchId) {
                    setSelectedBatchId(batchRes.data[0]._id);
                }
            }

            if (examRes?.data) {
                setExams(examRes.data);
                if (examRes.data.length > 0 && !selectedExamId) {
                    setSelectedExamId(examRes.data[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to load batches or exams for results:", err);
        }
    };

    // Load Batch Results when selectedBatchId changes
    useEffect(() => {
        if (selectedBatchId && activeTab === "batch") {
            fetchBatchResults(selectedBatchId);
            setBatchPage(1);
        }
    }, [selectedBatchId, activeTab]);

    const fetchBatchResults = async (batchId) => {
        try {
            setBatchLoading(true);
            const res = await GetBatchResults(batchId);
            if (res && res.status) {
                setBatchData(res);
            } else {
                setBatchData(null);
            }
        } catch (err) {
            console.error("Error fetching batch results:", err);
            setBatchData(null);
        } finally {
            setBatchLoading(false);
        }
    };

    // Load Exam Marks when selectedExamId changes
    useEffect(() => {
        if (selectedExamId && activeTab === "exam") {
            fetchExamResults(selectedExamId);
            setExamPage(1);
        }
    }, [selectedExamId, activeTab]);

    const fetchExamResults = async (examId) => {
        try {
            setExamLoading(true);
            const res = await GetExamMarks(examId);
            if (res && res.status) {
                setExamData(res);
            } else {
                setExamData(null);
            }
        } catch (err) {
            console.error("Error fetching exam results:", err);
            setExamData(null);
        } finally {
            setExamLoading(false);
        }
    };

    const handleOpenMarksheet = (student) => {
        setSelectedStudentForMarksheet(student);
        setMarksheetModalOpen(true);
    };

    // Filter batch students
    const filteredBatchStudents = useMemo(() => {
        return (batchData?.data || []).filter((stu) => {
            const name = String(stu.studentName || "").toLowerCase();
            const roll = String(stu.rollNumber || "").toLowerCase();
            const query = batchSearch.trim().toLowerCase();

            const matchesSearch = !query || name.includes(query) || roll.includes(query);
            if (!matchesSearch) return false;

            if (batchStatusFilter === "ALL") return true;
            if (batchStatusFilter === "PASS") return stu.resultStatus === "Pass";
            if (batchStatusFilter === "FAIL") return stu.resultStatus === "Fail";
            if (batchStatusFilter === "PENDING")
                return stu.resultStatus === "Pending" || stu.marksStatus === "Incomplete";

            return true;
        });
    }, [batchData, batchSearch, batchStatusFilter]);

    // Paginate batch students
    const totalBatchPages = Math.ceil(filteredBatchStudents.length / batchLimit) || 1;
    const paginatedBatchStudents = useMemo(() => {
        const start = (batchPage - 1) * batchLimit;
        return filteredBatchStudents.slice(start, start + batchLimit);
    }, [filteredBatchStudents, batchPage, batchLimit]);

    // Filter exam students
    const filteredExamMarks = useMemo(() => {
        return (examData?.data || []).filter((m) => {
            const name = String(m.studentName || m.student?.StudentName || "").toLowerCase();
            const roll = String(m.rollNumber || m.student?.rollNumber || "").toLowerCase();
            const query = examSearch.trim().toLowerCase();
            return !query || name.includes(query) || roll.includes(query);
        });
    }, [examData, examSearch]);

    // Paginate exam students
    const totalExamPages = Math.ceil(filteredExamMarks.length / examLimit) || 1;
    const paginatedExamMarks = useMemo(() => {
        const start = (examPage - 1) * examLimit;
        return filteredExamMarks.slice(start, start + examLimit);
    }, [filteredExamMarks, examPage, examLimit]);

    const batchSummary = batchData?.summary || {};
    const examSummary = examData?.summary || {};
    const pendingExamStudents = examData?.pendingStudents || [];

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FaGraduationCap className="text-slate-700 text-2xl" />
                        <span>Academic Results &amp; Marksheets</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Consolidated semester evaluation, performance analytics, and printable student marksheets.
                    </p>
                </div>

                {/* View Mode Tabs */}
                <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab("batch")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition ${
                            activeTab === "batch"
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <FaUsers className="text-xs" />
                        <span>Batch-wise Results</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("exam")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition ${
                            activeTab === "exam"
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <FaClipboardList className="text-xs" />
                        <span>Exam-wise Results</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. BATCH-WISE RESULTS VIEW */}
            {/* ========================================================================= */}
            {activeTab === "batch" && (
                <div className="space-y-6">
                    {/* Controls Bar: Batch Select, Search, Status Filter */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                                {/* Batch Selector */}
                                <div className="min-w-[240px]">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Select Target Batch
                                    </label>
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="w-full h-10 px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                    >
                                        <option value="">-- Choose Batch --</option>
                                        {batches.map((b) => (
                                            <option key={b._id} value={b._id}>
                                                {b.batchName} ({b.course?.courseName || b.courseName || "General"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filters */}
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Filter Status
                                    </label>
                                    <div className="flex gap-1">
                                        {[
                                            { label: "All", val: "ALL" },
                                            { label: "Passed", val: "PASS" },
                                            { label: "Failed", val: "FAIL" },
                                            { label: "Pending", val: "PENDING" }
                                        ].map((f) => (
                                            <button
                                                key={f.val}
                                                type="button"
                                                onClick={() => {
                                                    setBatchStatusFilter(f.val);
                                                    setBatchPage(1);
                                                }}
                                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                                    batchStatusFilter === f.val
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Search Input & Limit */}
                            <div className="flex items-center gap-3">
                                <div className="w-full sm:w-64">
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Search Student
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Name or Roll Number..."
                                            value={batchSearch}
                                            onChange={(e) => {
                                                setBatchSearch(e.target.value);
                                                setBatchPage(1);
                                            }}
                                            className="w-full h-10 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                        />
                                        <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                                        {batchSearch && (
                                            <button
                                                onClick={() => setBatchSearch("")}
                                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="w-28 self-end">
                                    <select
                                        value={batchLimit}
                                        onChange={(e) => {
                                            setBatchLimit(Number(e.target.value));
                                            setBatchPage(1);
                                        }}
                                        className="w-full h-10 px-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                    >
                                        <option value={10}>10 / page</option>
                                        <option value={25}>25 / page</option>
                                        <option value={50}>50 / page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Summary Cards */}
                    {batchData && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Total Students</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{batchSummary.totalStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 block">Evaluated</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{batchSummary.appearedStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block">Passed</span>
                                <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{batchSummary.passedStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block">Failed</span>
                                <span className="text-xl font-bold text-red-600 mt-0.5 block">{batchSummary.failedStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 block">Pending / Partial</span>
                                <span className="text-xl font-bold text-amber-700 mt-0.5 block">{batchSummary.pendingStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Batch Avg %</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{batchSummary.batchAveragePercentage || 0}%</span>
                            </div>
                        </div>
                    )}

                    {/* Batch Results Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {batchLoading ? (
                            <div className="p-16 flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : !selectedBatchId ? (
                            <div className="p-12 text-center text-slate-500">
                                Please select a batch from the dropdown above to view student results.
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                                                <th className="px-5 py-3.5">Roll No</th>
                                                <th className="px-5 py-3.5">Student Name</th>
                                                <th className="px-5 py-3.5 text-center">Subjects Evaluated</th>
                                                <th className="px-5 py-3.5 text-center">Total Marks</th>
                                                <th className="px-5 py-3.5 text-center">Percentage</th>
                                                <th className="px-5 py-3.5 text-center">Grade</th>
                                                <th className="px-5 py-3.5 text-center">Final Result</th>
                                                <th className="px-5 py-3.5 text-center">Marksheet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedBatchStudents.length > 0 ? (
                                                paginatedBatchStudents.map((stu) => (
                                                    <tr key={stu.studentId} className="hover:bg-slate-50/80 transition">
                                                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                                                            {stu.rollNumber}
                                                        </td>
                                                        <td className="px-5 py-3.5 font-bold text-slate-900">
                                                            {stu.studentName}
                                                            <span className="block text-[11px] text-slate-400 font-normal">
                                                                {stu.email}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <span className="font-semibold text-slate-800">
                                                                {stu.enteredSubjectsCount} / {stu.totalScheduledExams}
                                                            </span>
                                                            {stu.marksStatus === "Incomplete" && (
                                                                <span className="block text-[10px] text-amber-600 font-bold">
                                                                    Partial ({stu.missingExamsCount} missing)
                                                                </span>
                                                            )}
                                                            {stu.marksStatus === "No Marks" && (
                                                                <span className="block text-[10px] text-slate-400">
                                                                    Not Appeared
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                                                            {stu.totalObtained} <span className="text-slate-400 font-normal">/ {stu.totalMaxMarks}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                                                            {stu.percentage}%
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <span
                                                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                                                    stu.grade === "A+" || stu.grade === "A"
                                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                        : stu.grade === "B+" || stu.grade === "B"
                                                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                        : stu.grade === "C" || stu.grade === "D"
                                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                        : stu.grade === "F"
                                                                        ? "bg-red-50 text-red-700 border border-red-200"
                                                                        : "bg-slate-100 text-slate-600"
                                                                }`}
                                                            >
                                                                {stu.grade || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            {stu.resultStatus === "Pass" ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                                                    <FaCheckCircle className="text-[10px]" /> PASS
                                                                </span>
                                                            ) : stu.resultStatus === "Fail" ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                                                                    <FaTimesCircle className="text-[10px]" /> FAIL
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                                                                    <FaExclamationTriangle className="text-[10px]" /> PENDING
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenMarksheet(stu)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition border border-slate-300 shadow-2xs"
                                                                title="View & Print Marksheet"
                                                            >
                                                                <FaPrint className="text-xs text-slate-600" />
                                                                <span>Marksheet</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                                        <p className="font-semibold text-sm">No Results Found</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            No student records matched your search or status filter.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-5 py-3.5 gap-3 bg-slate-50/50">
                                    <span className="text-xs text-slate-500">
                                        Showing{" "}
                                        <strong className="text-slate-700">
                                            {filteredBatchStudents.length > 0 ? (batchPage - 1) * batchLimit + 1 : 0}
                                        </strong>{" "}
                                        to{" "}
                                        <strong className="text-slate-700">
                                            {Math.min(batchPage * batchLimit, filteredBatchStudents.length)}
                                        </strong>{" "}
                                        of <strong className="text-slate-700">{filteredBatchStudents.length}</strong> students
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setBatchPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={batchPage === 1}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                            Page {batchPage} of {totalBatchPages}
                                        </span>

                                        <button
                                            onClick={() => setBatchPage((prev) => Math.min(prev + 1, totalBatchPages))}
                                            disabled={batchPage >= totalBatchPages}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 2. EXAM-WISE RESULTS VIEW */}
            {/* ========================================================================= */}
            {activeTab === "exam" && (
                <div className="space-y-6">
                    {/* Controls Bar: Exam Select & Search */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                Select Scheduled Exam
                            </label>
                            <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="w-full md:max-w-md h-10 px-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                            >
                                <option value="">-- Choose Exam --</option>
                                {exams.map((ex) => (
                                    <option key={ex._id} value={ex._id}>
                                        {ex.examName || ex.ExamName} - {ex.subject} ({ex.batch?.batchName || ex.batchName || "N/A"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-full sm:w-64">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                    Search Student
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Name or Roll Number..."
                                        value={examSearch}
                                        onChange={(e) => {
                                            setExamSearch(e.target.value);
                                            setExamPage(1);
                                        }}
                                        className="w-full h-10 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                    />
                                    <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                                    {examSearch && (
                                        <button
                                            onClick={() => setExamSearch("")}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="w-28 self-end">
                                <select
                                    value={examLimit}
                                    onChange={(e) => {
                                        setExamLimit(Number(e.target.value));
                                        setExamPage(1);
                                    }}
                                    className="w-full h-10 px-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                                >
                                    <option value={10}>10 / page</option>
                                    <option value={25}>25 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Exam KPI Summary Cards */}
                    {examData && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Graded / Appeared</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{examSummary.totalStudents || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block">Passed</span>
                                <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{examSummary.passed || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 block">Failed</span>
                                <span className="text-xl font-bold text-red-600 mt-0.5 block">{examSummary.failed || 0}</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 block">Highest Score</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                                    {examSummary.highestMarks || 0} <span className="text-xs text-slate-400 font-normal">/ {examData.exam?.maxMarks || 100}</span>
                                </span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Average %</span>
                                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{examSummary.avgPercentage || 0}%</span>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 block">Pending Marks</span>
                                <span className="text-xl font-bold text-amber-700 mt-0.5 block">{pendingExamStudents.length}</span>
                            </div>
                        </div>
                    )}

                    {/* Graded Students Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                Evaluated Students ({filteredExamMarks.length})
                            </h3>
                            {examData?.exam && (
                                <span className="text-xs text-slate-500">
                                    Subject: <strong>{examData.exam.subject}</strong> &bull; Max Marks:{" "}
                                    <strong>{examData.exam.maxMarks || 100}</strong> (Passing: {examData.exam.minMarks || 33})
                                </span>
                            )}
                        </div>

                        {examLoading ? (
                            <div className="p-16 flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : !selectedExamId ? (
                            <div className="p-12 text-center text-slate-500">
                                Please select an exam from the dropdown above to view results.
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                                                <th className="px-5 py-3.5">Roll No</th>
                                                <th className="px-5 py-3.5">Student Name</th>
                                                <th className="px-5 py-3.5 text-center">Marks Obtained</th>
                                                <th className="px-5 py-3.5 text-center">Percentage</th>
                                                <th className="px-5 py-3.5 text-center">Grade</th>
                                                <th className="px-5 py-3.5 text-center">Status</th>
                                                <th className="px-5 py-3.5">Remarks</th>
                                                <th className="px-5 py-3.5 text-center">Marksheet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedExamMarks.length > 0 ? (
                                                paginatedExamMarks.map((m) => (
                                                    <tr key={m._id} className="hover:bg-slate-50/80 transition">
                                                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">
                                                            {m.rollNumber || m.student?.rollNumber || "N/A"}
                                                        </td>
                                                        <td className="px-5 py-3.5 font-bold text-slate-900">
                                                            {m.studentName || m.student?.StudentName}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                                                            {m.marksObtained} <span className="text-slate-400 font-normal">/ {m.maxMarks}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                                                            {m.percentage}%
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
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
                                                        <td className="px-5 py-3.5 text-center">
                                                            {m.status === "Pass" ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                                                    <FaCheckCircle className="text-[10px]" /> PASS
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                                                                    <FaTimesCircle className="text-[10px]" /> FAIL
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate">
                                                            {m.remarks || "-"}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenMarksheet(m.student || { _id: m.student, name: m.studentName, rollNumber: m.rollNumber })}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition border border-slate-300 shadow-2xs"
                                                                title="View & Print Marksheet"
                                                            >
                                                                <FaPrint className="text-xs text-slate-600" />
                                                                <span>Marksheet</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                                        <p className="font-semibold text-sm">No Student Marks Found</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            No marks have been recorded for this exam matching your criteria.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-5 py-3.5 gap-3 bg-slate-50/50">
                                    <span className="text-xs text-slate-500">
                                        Showing{" "}
                                        <strong className="text-slate-700">
                                            {filteredExamMarks.length > 0 ? (examPage - 1) * examLimit + 1 : 0}
                                        </strong>{" "}
                                        to{" "}
                                        <strong className="text-slate-700">
                                            {Math.min(examPage * examLimit, filteredExamMarks.length)}
                                        </strong>{" "}
                                        of <strong className="text-slate-700">{filteredExamMarks.length}</strong> students
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setExamPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={examPage === 1}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                            Page {examPage} of {totalExamPages}
                                        </span>

                                        <button
                                            onClick={() => setExamPage((prev) => Math.min(prev + 1, totalExamPages))}
                                            disabled={examPage >= totalExamPages}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Missing Marks Audit Banner */}
                    {pendingExamStudents.length > 0 && (
                        <div className="bg-amber-50/60 rounded-xl border border-amber-300 p-4 shadow-xs">
                            <div className="flex items-center gap-2 mb-2">
                                <FaExclamationTriangle className="text-amber-600 text-sm" />
                                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                                    Evaluation Audit: {pendingExamStudents.length} Enrolled Student(s) Pending Marks
                                </h4>
                            </div>
                            <p className="text-xs text-amber-800 mb-3">
                                The following students belong to this exam&apos;s batch but do not have marks recorded yet. They are excluded from pass/fail calculations until graded.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {pendingExamStudents.map((ps) => (
                                    <div key={ps._id} className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800 block">{ps.name}</span>
                                            <span className="text-[11px] text-slate-500 font-mono">Roll: {ps.rollNumber}</span>
                                        </div>
                                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Render Marksheet Modal */}
            <MarksheetModal
                open={marksheetModalOpen}
                onClose={() => setMarksheetModalOpen(false)}
                studentId={selectedStudentForMarksheet?._id || selectedStudentForMarksheet?.studentId}
                studentData={selectedStudentForMarksheet}
            />
        </div>
    );
}
