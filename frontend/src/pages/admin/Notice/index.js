import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";
import Loader from '../../../Components/Loader';
import { ViewAllNotice, DeleteNotice } from '../../../Service/admin/Notice';
import { 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaPlus, 
    FaSearch, 
    FaBullhorn, 
    FaUsers, 
    FaBuilding, 
    FaCalendarAlt,
    FaTimes
} from "react-icons/fa";
import moment from "moment";
import NoticeDetailsModal from './NoticeDetailsModal';

export default function NoticeList() {
    const [notices, setNotices] = useState([]);
    const [loader, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAudience, setSelectedAudience] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

    // Modal state
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);

    const getNotices = async () => {
        try {
            setLoading(true);
            const res = await ViewAllNotice(page, limit);
            const noticeList = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : [];
            setNotices(noticeList);
            setTotalPages(res?.totalPages || Math.ceil((res?.total || noticeList.length) / limit) || 1);
            setTotalRecords(res?.total || res?.totalNotices || noticeList.length);
        } catch (error) {
            console.error("Error fetching notices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNotices();
    }, [page, limit]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this Notice?",
            text: "This action will permanently remove the notice broadcast from all student and staff portals.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#dc2626",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await DeleteNotice(id);
                Swal.fire({
                    title: "Deleted!",
                    text: "Notice successfully removed.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                getNotices();
            } catch (error) {
                Swal.fire({
                    title: "Delete Failed",
                    text: error?.response?.data?.message || "Unable to delete notice.",
                    icon: "error"
                });
            }
        }
    };

    const handleViewNotice = (item) => {
        setSelectedNotice(item);
        setDetailsOpen(true);
    };

    // Client-side search and filtering
    const filteredNotices = useMemo(() => {
        return notices.filter((item) => {
            const title = String(item.notice_title || "").toLowerCase();
            const desc = String(item.description || "").toLowerCase();
            const dept = String(item.department || "").toLowerCase();
            const issuedBy = String(item.issued_by || "").toLowerCase();
            const query = searchQuery.trim().toLowerCase();

            const matchesSearch = !query || 
                title.includes(query) || 
                desc.includes(query) || 
                dept.includes(query) || 
                issuedBy.includes(query);

            if (!matchesSearch) return false;

            if (selectedAudience) {
                const itemAudience = String(item.for_whom || "").toLowerCase();
                if (itemAudience !== selectedAudience.toLowerCase()) {
                    return false;
                }
            }

            if (selectedDepartment) {
                const itemDept = String(item.department || "").toLowerCase();
                if (itemDept !== selectedDepartment.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });
    }, [notices, searchQuery, selectedAudience, selectedDepartment]);

    // Unique departments for filter dropdown
    const availableDepartments = useMemo(() => {
        const depts = new Set();
        notices.forEach((n) => {
            if (n.department) depts.add(n.department);
        });
        return Array.from(depts);
    }, [notices]);

    const isFiltered = Boolean(searchQuery || selectedAudience || selectedDepartment);

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedAudience("");
        setSelectedDepartment("");
    };

    // Metrics calculations
    const totalCount = totalRecords || notices.length;
    const studentCount = notices.filter(n => String(n.for_whom || "").toLowerCase().includes("student")).length;
    const staffCount = notices.filter(n => {
        const aud = String(n.for_whom || "").toLowerCase();
        return aud.includes("teacher") || aud.includes("staff");
    }).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Notice Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Broadcast official announcements, circulars, and departmental updates across campus.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/notice/add"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Notice</span>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Circulars</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaBullhorn className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Student Notices</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{studentCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaUsers className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Staff / Faculty</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{staffCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaBuilding className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Active Departments</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{availableDepartments.length || 1}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaCalendarAlt className="text-base" />
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
                            placeholder="Search by title, department, description, or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 bg-white"
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                    </div>

                    {/* Filter by Target Audience */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                            className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                        >
                            <option value="">All Audiences</option>
                            <option value="All">All Campus</option>
                            <option value="Students">Students Only</option>
                            <option value="Teachers">Faculty / Teachers</option>
                            <option value="Staff">Staff Members</option>
                        </select>
                    </div>

                    {/* Filter by Department */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-slate-500"
                        >
                            <option value="">All Departments</option>
                            {availableDepartments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Limit Dropdown */}
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
                            title="Reset filters"
                        >
                            <FaTimes className="text-xs" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Card */}
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
                                        <th className="px-5 py-3.5">Notice Title &amp; Preview</th>
                                        <th className="px-5 py-3.5">Department</th>
                                        <th className="px-5 py-3.5">Issued By</th>
                                        <th className="px-5 py-3.5">Published Date</th>
                                        <th className="px-5 py-3.5 text-center">Target Audience</th>
                                        <th className="px-5 py-3.5 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredNotices.length > 0 ? (
                                        filteredNotices.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition">
                                                {/* Notice Title */}
                                                <td className="px-5 py-3.5 max-w-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewNotice(item)}
                                                        className="text-left font-semibold text-slate-900 hover:text-indigo-600 transition block text-sm"
                                                    >
                                                        {item.notice_title}
                                                    </button>
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                                                        {item.description || "No preview available."}
                                                    </p>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-3.5">
                                                    <span className="font-semibold text-slate-800 block">
                                                        {item.department || "General"}
                                                    </span>
                                                </td>

                                                {/* Issued By */}
                                                <td className="px-5 py-3.5">
                                                    <span className="font-medium text-slate-700">
                                                        {item.issued_by || "Administration"}
                                                    </span>
                                                </td>

                                                {/* Published Date */}
                                                <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-slate-400 text-[11px]" />
                                                        <span>
                                                            {item.publish_date
                                                                ? moment(item.publish_date).format("DD MMM YYYY")
                                                                : "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Target Audience */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                        {item.for_whom || "All"}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewNotice(item)}
                                                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                            title="View Notice Details"
                                                        >
                                                            <FaEye className="text-sm" />
                                                        </button>

                                                        <Link
                                                            to={`/admin/notice/edit/${item._id}`}
                                                            state={{ notice: item }}
                                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                            title="Edit Notice"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Notice"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-500">
                                                <p className="font-semibold text-sm">No Notices Found</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {isFiltered
                                                        ? "Try clearing filters or adjusting your search term."
                                                        : "Click '+ Add Notice' to publish your first college circular."}
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
                                    {filteredNotices.length > 0 ? (page - 1) * limit + 1 : 0}
                                </strong>{" "}
                                to{" "}
                                <strong className="text-slate-700">
                                    {Math.min(page * limit, totalRecords || filteredNotices.length)}
                                </strong>{" "}
                                of <strong className="text-slate-700">{totalRecords || filteredNotices.length}</strong> notices
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                >
                                    Previous
                                </button>

                                <span className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                    Page {page} of {totalPages || 1}
                                </span>

                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Notice Details Modal */}
            <NoticeDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                notice={selectedNotice}
            />
        </div>
    );
}
