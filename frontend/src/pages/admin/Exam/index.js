import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";
import moment from "moment";
import Loader from '../../../Components/Loader';
import { ViewAllExam, DeleteExam, ViewOneExam } from '../../../Service/admin/Exam';
import { ViewAllCourse } from '../../../Service/admin/Course';
import { 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaClipboardList, 
    FaPlus, 
    FaSearch, 
    FaFilter, 
    FaBookOpen, 
    FaGraduationCap, 
    FaCalendarAlt,
    FaCheckCircle,
    FaTimes
} from "react-icons/fa";
import ExamDetails from './ExamDetails';
import ExamMarksModal from './ExamMarksModal';

export default function ExamList() {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loader, setLoading] = useState(true);
    const [examDetails, setExamDetails] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [marksModalOpen, setMarksModalOpen] = useState(false);
    const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedType, setSelectedType] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        getExams();
    }, [page, limit]);

    const loadCourses = async () => {
        try {
            const res = await ViewAllCourse();
            if (res?.data) {
                setCourses(res.data);
            }
        } catch (err) {
            console.error("Failed to load courses:", err);
        }
    };

    const getExams = async () => {
        try {
            setLoading(true);
            const res = await ViewAllExam(page, limit);
            if (res?.data) {
                setExams(res.data);
                setTotalPages(res.totalPages || 1);
                setTotalRecords(res.totalExams || res.total || res.data.length);
            }
        } catch (error) {
            console.error("Error loading exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this Exam?",
            text: "This action will permanently remove the exam schedule and associated student marks entries.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#dc2626",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await DeleteExam(id);
                Swal.fire({
                    title: "Deleted!",
                    text: "Exam successfully removed.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                getExams();
            } catch (error) {
                Swal.fire({
                    title: "Delete Failed",
                    text: error?.response?.data?.message || "Unable to delete exam.",
                    icon: "error"
                });
            }
        }
    };

    const handleViewExam = async (id) => {
        try {
            const res = await ViewOneExam(id);
            setExamDetails(res.data?.data || res.data);
            setDetailsOpen(true);
        } catch (error) {
            console.error("Error viewing exam:", error);
        }
    };

    const handleOpenMarks = (item) => {
        setSelectedExamForMarks(item);
        setMarksModalOpen(true);
    };

    // Client-side filtering for search, course, and examType
    const filteredExams = useMemo(() => {
        return exams.filter((item) => {
            const examName = String(item.examName || item.ExamName || "").toLowerCase();
            const subject = String(item.subject || "").toLowerCase();
            const courseName = String(item.course?.courseName || item.courseName || "").toLowerCase();
            const batchName = String(item.batch?.batchName || item.batchName || item.ClassId || "").toLowerCase();
            const query = searchQuery.trim().toLowerCase();

            const matchesSearch = !query || 
                examName.includes(query) || 
                subject.includes(query) || 
                courseName.includes(query) || 
                batchName.includes(query);

            if (!matchesSearch) return false;

            if (selectedCourse) {
                const itemCourseId = String(item.course?._id || item.course || "");
                const itemCourseName = String(item.course?.courseName || item.courseName || "");
                if (itemCourseId !== selectedCourse && itemCourseName !== selectedCourse) {
                    return false;
                }
            }

            if (selectedType) {
                const itemType = String(item.examType || "").toLowerCase();
                if (itemType !== selectedType.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });
    }, [exams, searchQuery, selectedCourse, selectedType]);

    const isFiltered = Boolean(searchQuery || selectedCourse || selectedType);

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCourse("");
        setSelectedType("");
    };

    // KPI Metrics calculation
    const totalExamsCount = totalRecords || exams.length;
    const gradedCount = exams.filter(e => (e.marksCount && e.marksCount > 0) || (e.marks && e.marks.length > 0)).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Exam Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Schedule academic examinations, configure maximum marks, and evaluate student performances.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/result"
                        className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
                    >
                        <FaGraduationCap className="text-slate-500 text-sm" />
                        <span>Results &amp; Marksheets</span>
                    </Link>
                    <Link
                        to="/admin/exam/add"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Exam</span>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Scheduled</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalExamsCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaCalendarAlt className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Active Courses</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{courses.length}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaBookOpen className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Graded Assessments</span>
                        <span className="text-2xl font-bold text-emerald-700 mt-1 block">{gradedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FaCheckCircle className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Passing Benchmark</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">33% Min</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaClipboardList className="text-base" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by exam name, subject, course, or batch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 bg-white"
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                    </div>

                    {/* Filter by Course */}
                    <div className="w-full md:w-52">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                        >
                            <option value="">All Courses</option>
                            {courses.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.courseName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter by Exam Type */}
                    <div className="w-full md:w-44">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                        >
                            <option value="">All Exam Types</option>
                            <option value="Semester">Semester Exam</option>
                            <option value="Mid Term">Mid Term</option>
                            <option value="Final">Final</option>
                            <option value="Unit Test">Unit Test</option>
                            <option value="Practical">Practical</option>
                            <option value="Internal">Internal</option>
                            <option value="Assignment">Assignment</option>
                        </select>
                    </div>

                    {/* Records Limit Dropdown */}
                    <div className="w-full md:w-32">
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="h-10 px-3 flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 font-semibold transition"
                            title="Reset all filters"
                        >
                            <FaTimes className="text-xs" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Exams Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loader ? (
                    <div className="p-16 flex items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="px-5 py-3.5">Exam Name &amp; AY</th>
                                        <th className="px-5 py-3.5">Subject &amp; Type</th>
                                        <th className="px-5 py-3.5">Course &amp; Batch</th>
                                        <th className="px-5 py-3.5">Exam Date</th>
                                        <th className="px-5 py-3.5 text-center">Marks Allocation</th>
                                        <th className="px-5 py-3.5 text-center">Marks Evaluation</th>
                                        <th className="px-5 py-3.5 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredExams.length > 0 ? (
                                        filteredExams.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition">
                                                {/* Exam Name */}
                                                <td className="px-5 py-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewExam(item._id)}
                                                        className="text-left font-semibold text-slate-900 hover:text-indigo-600 transition block text-sm"
                                                    >
                                                        {item.examName || item.ExamName}
                                                    </button>
                                                    <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                                        AY: {item.academicYear || item.AcademicYear || "2026-27"}
                                                    </span>
                                                </td>

                                                {/* Subject & Type */}
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-slate-800">
                                                        {item.subject || "General"}
                                                    </div>
                                                    <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide border border-slate-200">
                                                        {item.examType || "Semester"}
                                                    </span>
                                                </td>

                                                {/* Course & Batch */}
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-slate-800">
                                                        {item.course?.courseName || item.courseName || "General Course"}
                                                    </div>
                                                    <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
                                                        Batch: {item.batch?.batchName || item.batchName || item.ClassId || "N/A"}
                                                    </div>
                                                </td>

                                                {/* Exam Date */}
                                                <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-slate-400 text-[11px]" />
                                                        <span>
                                                            {item.examDate
                                                                ? moment(item.examDate).format("DD MMM YYYY")
                                                                : (item.StartDate ? moment(item.StartDate).format("DD MMM YYYY") : "N/A")}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Marks Allocation */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {item.maxMarks ?? item.MaxMarks ?? 100}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block font-medium">
                                                        Pass: {item.minMarks ?? item.MinMarks ?? 33}
                                                    </span>
                                                </td>

                                                {/* Marks Evaluation Button */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenMarks(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition border border-slate-300 shadow-sm"
                                                        title="Enter or view student scores"
                                                    >
                                                        <FaClipboardList className="text-xs text-slate-600" />
                                                        <span>
                                                            {item.marksCount !== undefined && item.marksCount > 0
                                                                ? `${item.marksCount} Graded`
                                                                : "Enter Marks"}
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewExam(item._id)}
                                                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                            title="View Details"
                                                        >
                                                            <FaEye className="text-sm" />
                                                        </button>

                                                        <Link
                                                            to={`/admin/exam/edit/${item._id}`}
                                                            state={{ exam: item }}
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                            title="Edit Exam"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Exam"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-slate-500">
                                                <p className="font-semibold text-sm">No Exams Found</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {isFiltered
                                                        ? "Try adjusting your search criteria or clearing filters."
                                                        : "Click '+ Add Exam' to schedule your first academic assessment."}
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
                                    {filteredExams.length > 0 ? (page - 1) * limit + 1 : 0}
                                </strong>{" "}
                                to{" "}
                                <strong className="text-slate-700">
                                    {Math.min(page * limit, totalRecords || filteredExams.length)}
                                </strong>{" "}
                                of <strong className="text-slate-700">{totalRecords || filteredExams.length}</strong> exams
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm bg-white"
                                >
                                    Previous
                                </button>
                                
                                <span className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                    Page {page} of {totalPages || 1}
                                </span>

                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Exam Details Modal */}
            <ExamDetails
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                exam={examDetails}
                onOpenMarks={(ex) => handleOpenMarks(ex)}
            />

            {/* Exam Marks Modal */}
            <ExamMarksModal
                open={marksModalOpen}
                onClose={() => {
                    setMarksModalOpen(false);
                    getExams(); // Refresh exam list and graded counts
                }}
                exam={selectedExamForMarks}
            />
        </div>
    );
}
