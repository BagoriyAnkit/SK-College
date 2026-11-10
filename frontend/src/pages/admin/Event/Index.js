import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";
import Loader from '../../../Components/Loader';
import { ViewAllEvent, DeleteEvent, StatusUpdate } from '../../../Service/admin/Event';
import { 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaPlus, 
    FaSearch, 
    FaCalendarAlt, 
    FaClock, 
    FaMapMarkerAlt, 
    FaRegCalendarCheck,
    FaTimes
} from "react-icons/fa";
import moment from "moment";
import EventDetailsModal from './EventDetailsModal';

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loader, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, UPCOMING, PAST

    // Modal state
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const getEvents = async () => {
        try {
            setLoading(true);
            const res = await ViewAllEvent(page, limit);
            const eventList = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setEvents(eventList);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEvents();
    }, [page, limit]);

    const handleStatus = async (id) => {
        try {
            await StatusUpdate(id);
            Swal.fire({
                icon: "success",
                title: "Status Updated",
                text: "Event status successfully updated.",
                timer: 1200,
                showConfirmButton: false,
            });
            getEvents();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: error?.response?.data?.message || "Failed to update status."
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this Event?",
            text: "This action will permanently remove the event from college schedules and public portals.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#dc2626",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await DeleteEvent(id);
                Swal.fire({
                    title: "Deleted!",
                    text: "Event successfully removed.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                getEvents();
            } catch (error) {
                Swal.fire({
                    title: "Delete Failed",
                    text: error?.response?.data?.message || "Unable to delete event.",
                    icon: "error"
                });
            }
        }
    };

    const handleViewEvent = (item) => {
        setSelectedEvent(item);
        setDetailsOpen(true);
    };

    // Client-side search and filtering
    const filteredEvents = useMemo(() => {
        return events.filter((item) => {
            const title = String(item.event_title || "").toLowerCase();
            const loc = String(item.location || "").toLowerCase();
            const desc = String(item.description || "").toLowerCase();
            const query = searchQuery.trim().toLowerCase();

            const matchesSearch = !query || 
                title.includes(query) || 
                loc.includes(query) || 
                desc.includes(query);

            if (!matchesSearch) return false;

            if (statusFilter !== "ALL") {
                const isUpcoming = item.event_date 
                    ? moment(item.event_date).isSameOrAfter(moment(), 'day')
                    : true;
                if (statusFilter === "UPCOMING" && !isUpcoming) return false;
                if (statusFilter === "PAST" && isUpcoming) return false;
            }

            return true;
        });
    }, [events, searchQuery, statusFilter]);

    // Paginated list
    const paginatedEvents = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredEvents.slice(start, start + limit);
    }, [filteredEvents, page, limit]);

    const calculatedTotalPages = Math.ceil(filteredEvents.length / limit) || 1;

    const isFiltered = Boolean(searchQuery || statusFilter !== "ALL");

    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
        setPage(1);
    };

    // Metrics calculations
    const totalCount = events.length;
    const upcomingCount = events.filter(e => e.event_date ? moment(e.event_date).isSameOrAfter(moment(), 'day') : true).length;
    const pastCount = totalCount - upcomingCount;
    const uniqueVenues = useMemo(() => {
        const venues = new Set();
        events.forEach(e => {
            if (e.location) venues.add(e.location);
        });
        return venues.size;
    }, [events]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Events Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Schedule, coordinate, and broadcast college events, workshops, and seminars.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/event/add"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Event</span>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Events</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaRegCalendarCheck className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block">Upcoming Events</span>
                        <span className="text-2xl font-bold text-emerald-700 mt-1 block">{upcomingCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FaCalendarAlt className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Past / Completed</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{pastCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaClock className="text-base" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Active Venues</span>
                        <span className="text-2xl font-bold text-slate-900 mt-1 block">{uniqueVenues || 1}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <FaMapMarkerAlt className="text-base" />
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
                            placeholder="Search by event title, location, or description..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full h-10 pl-9 pr-4 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 bg-white"
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                    </div>

                    {/* Status Filter Chips */}
                    <div className="flex gap-1">
                        {[
                            { label: "All Events", val: "ALL" },
                            { label: "Upcoming", val: "UPCOMING" },
                            { label: "Past Events", val: "PAST" }
                        ].map((f) => (
                            <button
                                key={f.val}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(f.val);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                    statusFilter === f.val
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
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

            {/* Events Table Card */}
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
                                        <th className="px-5 py-3.5">Event Title &amp; Details</th>
                                        <th className="px-5 py-3.5">Event Date</th>
                                        <th className="px-5 py-3.5">Schedule Time</th>
                                        <th className="px-5 py-3.5">Venue / Location</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                        <th className="px-5 py-3.5 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedEvents.length > 0 ? (
                                        paginatedEvents.map((item) => {
                                            const isUpcoming = item.event_date 
                                                ? moment(item.event_date).isSameOrAfter(moment(), 'day')
                                                : true;

                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50/80 transition">
                                                    {/* Event Title */}
                                                    <td className="px-5 py-3.5 max-w-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewEvent(item)}
                                                            className="text-left font-semibold text-slate-900 hover:text-indigo-600 transition block text-sm"
                                                        >
                                                            {item.event_title}
                                                        </button>
                                                        {item.description && (
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Event Date */}
                                                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <FaCalendarAlt className="text-slate-400 text-[11px]" />
                                                            <span>
                                                                {item.event_date
                                                                    ? moment(item.event_date).format("DD MMM YYYY")
                                                                    : "-"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Timing Schedule */}
                                                    <td className="px-5 py-3.5 text-slate-700 font-mono">
                                                        <div className="flex items-center gap-1.5">
                                                            <FaClock className="text-slate-400 text-[11px]" />
                                                            <span>
                                                                {item.start_time || "N/A"} {item.end_time ? `- ${item.end_time}` : ""}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Location */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                            <FaMapMarkerAlt className="text-slate-400 text-[11px] shrink-0" />
                                                            <span>{item.location || "Auditorium"}</span>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-5 py-3.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatus(item._id)}
                                                            title="Click to toggle status"
                                                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                                                isUpcoming
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                                            }`}
                                                        >
                                                            {isUpcoming ? "Upcoming" : "Past Event"}
                                                        </button>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-3.5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewEvent(item)}
                                                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                                title="View Event Details"
                                                            >
                                                                <FaEye className="text-sm" />
                                                            </button>

                                                            <Link
                                                                to={`/admin/event/edit/${item._id}`}
                                                                state={{ event: item }}
                                                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                                                title="Edit Event"
                                                            >
                                                                <FaEdit className="text-sm" />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item._id)}
                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete Event"
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-500">
                                                <p className="font-semibold text-sm">No Events Found</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {isFiltered
                                                        ? "Try clearing filters or adjusting your search term."
                                                        : "Click '+ Add Event' to schedule your first college event."}
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
                                    {filteredEvents.length > 0 ? (page - 1) * limit + 1 : 0}
                                </strong>{" "}
                                to{" "}
                                <strong className="text-slate-700">
                                    {Math.min(page * limit, filteredEvents.length)}
                                </strong>{" "}
                                of <strong className="text-slate-700">{filteredEvents.length}</strong> events
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
                                    Page {page} of {calculatedTotalPages}
                                </span>

                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, calculatedTotalPages))}
                                    disabled={page >= calculatedTotalPages}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Event Details Modal */}
            <EventDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                event={selectedEvent}
                onToggleStatus={handleStatus}
            />
        </div>
    );
}
