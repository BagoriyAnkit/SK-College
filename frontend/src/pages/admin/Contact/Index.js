import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import moment from "moment";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Send,
  MessageSquare,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  Inbox,
  Sparkles,
  ArrowUpDown,
  CheckCircle2
} from "lucide-react";

import Loader from "../../../Components/Loader";
import ContactDetailsModal from "./ContactDetailsModal";
import { ViewAllContact, DeleteContact } from "../../../Service/admin/Contact";

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const getContacts = async () => {
    try {
      setLoading(true);
      const res = await ViewAllContact();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setContacts(list);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  const handleDelete = async (id, senderName) => {
    const result = await Swal.fire({
      title: "Delete Contact Inquiry?",
      text: `Are you sure you want to delete inquiry from "${senderName || "this visitor"}"? This action cannot be reversed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeleteContact(id);

        Swal.fire({
          title: "Deleted!",
          text: "Contact inquiry deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        if (selectedContact?._id === id) {
          setModalOpen(false);
          setSelectedContact(null);
        }

        getContacts();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.message || "Failed to delete inquiry.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleOpenModal = (contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setPage(1);
  };

  // KPI Statistics
  const statistics = useMemo(() => {
    const total = contacts.length;
    const now = moment();
    const recentCount = contacts.filter((c) => {
      if (!c.createdAt) return false;
      return now.diff(moment(c.createdAt), "days") <= 7;
    }).length;

    return {
      total,
      recent: recentCount,
      activeRate: "100%",
      channel: "Public Website Form"
    };
  }, [contacts]);

  // Filtered & Sorted Contacts
  const filteredContacts = useMemo(() => {
    if (!Array.isArray(contacts)) return [];

    const search = searchTerm.trim().toLowerCase();
    const result = contacts.filter((item) => {
      if (!item) return false;

      const name = String(item.fullName || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const subject = String(item.subject || "").toLowerCase();
      const message = String(item.message || "").toLowerCase();

      return !search || name.includes(search) || email.includes(search) || subject.includes(search) || message.includes(search);
    });

    // Sorting
    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [contacts, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredContacts.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + limit);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Contact Inquiries &amp; Communications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review messages, student inquiries, parent questions, and prospective admission messages submitted via the public portal
          </p>
        </div>

        <button
          type="button"
          onClick={getContacts}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {statistics.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Submitted messages from visitors
          </p>
        </div>

        {/* Recent Inquiries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Recent (Last 7 Days)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-700">
            {statistics.recent}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            New contact submissions
          </p>
        </div>

        {/* Inbound Source */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Inbound Channel
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold tracking-tight text-emerald-700 truncate mt-1">
            {statistics.channel}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Direct public web contact form
          </p>
        </div>

        {/* Operational Status */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Communication Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700">
            Active
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All mail routing operative
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
          </div>

          {/* Controls: Sort, Limit */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Limit Select */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Reset Search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Sender Details</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Message Snippet</th>
                <th className="px-5 py-3.5">Received Date</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((item) => {
                  const formattedDate = item.createdAt
                    ? moment(item.createdAt).format("DD MMM YYYY, hh:mm A")
                    : "Archived";

                  const timeAgo = item.createdAt
                    ? moment(item.createdAt).fromNow()
                    : "";

                  const initials = (item.fullName || "User")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const replyMailto = item.email
                    ? `mailto:${item.email}?subject=${encodeURIComponent(
                        `Re: ${item.subject || "Your Inquiry to SK College"}`
                      )}`
                    : null;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Sender Details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {item.fullName || "Anonymous"}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${item.email}`}
                                className="hover:text-blue-600 transition truncate"
                              >
                                {item.email || "No email"}
                              </a>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800 max-w-xs truncate" title={item.subject}>
                          {item.subject || "General Inquiry"}
                        </div>
                      </td>

                      {/* Message Snippet */}
                      <td className="px-5 py-3.5">
                        <p
                          className="text-slate-500 max-w-sm truncate text-xs"
                          title={item.message}
                        >
                          {item.message || "No content"}
                        </p>
                      </td>

                      {/* Received Date & Time */}
                      <td className="px-5 py-3.5">
                        <div className="text-slate-800 font-medium">
                          {formattedDate}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {timeAgo}
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="View Full Message"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {replyMailto && (
                            <a
                              href={replyMailto}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                              title="Reply by Email"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.fullName)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No Inquiries Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchTerm
                        ? `No inquiries match "${searchTerm}". Try resetting the search.`
                        : "There are currently no contact inquiries submitted from the website."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {filteredContacts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + limit, filteredContacts.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filteredContacts.length}
            </span>{" "}
            inquiries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      safePage === p
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ContactDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onDelete={(id) => handleDelete(id, selectedContact?.fullName)}
      />
    </div>
  );
}
