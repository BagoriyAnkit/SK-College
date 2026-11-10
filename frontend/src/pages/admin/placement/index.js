import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Briefcase,
  Building2,
  User,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  GraduationCap,
  Layers,
  CheckCircle2
} from "lucide-react";

import Loader from "../../../Components/Loader";
import PlacementDetailsModal from "./PlacementDetailsModal";
import {
  ViewAllPlacement,
  DeletePlacement
} from "../../../Service/admin/Placement";

export default function PlacementList() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // User role checking
  const userStr = localStorage.getItem("adminUser") || localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = String(user?.role || "").toLowerCase();
  const canManage = userRole === "admin" || userRole === "hod";

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await ViewAllPlacement();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPlacements(list);
    } catch (error) {
      console.error("Error fetching placements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleDelete = async (id, studentName, companyName) => {
    const result = await Swal.fire({
      title: "Delete Placement Record?",
      text: `Are you sure you want to delete the offer record for "${studentName || "this student"}" at "${companyName || "the company"}"? This action cannot be reversed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await DeletePlacement(id);

        Swal.fire({
          title: "Deleted!",
          text: "Placement record deleted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a"
        });

        fetchPlacements();
      } catch (error) {
        Swal.fire({
          title: "Delete Failed",
          text: error?.response?.data?.message || "Failed to delete placement record.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setYearFilter("");
    setJobTypeFilter("");
    setCompanyFilter("");
    setPage(1);
  };

  // Derive unique years and companies for filter dropdowns
  const availableYears = useMemo(() => {
    const years = new Set();
    placements.forEach((p) => {
      if (p.Year && String(p.Year).trim()) years.add(String(p.Year).trim());
    });
    return Array.from(years).sort().reverse();
  }, [placements]);

  const availableCompanies = useMemo(() => {
    const comps = new Set();
    placements.forEach((p) => {
      if (p.CompanyName && String(p.CompanyName).trim()) comps.add(String(p.CompanyName).trim());
    });
    return Array.from(comps).sort();
  }, [placements]);

  // Real statistics computed directly from loaded database records
  const statistics = useMemo(() => {
    let maxPkg = 0;
    let pkgSum = 0;
    let pkgCount = 0;
    const uniqueCompanies = new Set();
    const uniqueStudents = new Set();

    placements.forEach((p) => {
      if (p.CompanyName) uniqueCompanies.add(p.CompanyName.trim().toLowerCase());
      if (p.StudentName) uniqueStudents.add(p.StudentName.trim().toLowerCase());

      if (p.Package) {
        // Extract numeric value from string (e.g., "12.5 LPA" -> 12.5, "12,00,000" -> 12)
        const match = String(p.Package).match(/([\d.]+)/);
        if (match) {
          const num = parseFloat(match[1]);
          if (!isNaN(num) && num > 0) {
            if (num > maxPkg) maxPkg = num;
            pkgSum += num;
            pkgCount++;
          }
        }
      }
    });

    const avgPkg = pkgCount > 0 ? (pkgSum / pkgCount).toFixed(2) : "0";

    return {
      totalOffers: placements.length,
      placedStudents: uniqueStudents.size,
      recruiterCount: uniqueCompanies.size,
      highestPackage: maxPkg > 0 ? `${maxPkg} LPA` : "N/A",
      averagePackage: pkgCount > 0 ? `${avgPkg} LPA` : "N/A"
    };
  }, [placements]);

  // Filtered placements
  const filteredPlacements = useMemo(() => {
    if (!Array.isArray(placements)) return [];

    return placements.filter((item) => {
      if (!item) return false;

      const student = String(item.StudentName || "").toLowerCase();
      const company = String(item.CompanyName || "").toLowerCase();
      const location = String(item.Location || "").toLowerCase();
      const year = String(item.Year || "").toLowerCase();
      const jobType = String(item.JobType || "").toLowerCase();
      const pkg = String(item.Package || "").toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        student.includes(search) ||
        company.includes(search) ||
        location.includes(search) ||
        year.includes(search) ||
        jobType.includes(search) ||
        pkg.includes(search);

      const matchesYear = !yearFilter || year === yearFilter.toLowerCase();
      const matchesJobType = !jobTypeFilter || jobType === jobTypeFilter.toLowerCase();
      const matchesCompany = !companyFilter || company === companyFilter.toLowerCase();

      return matchesSearch && matchesYear && matchesJobType && matchesCompany;
    });
  }, [placements, searchTerm, yearFilter, jobTypeFilter, companyFilter]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredPlacements.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginatedPlacements = filteredPlacements.slice(startIndex, startIndex + limit);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campus Placements &amp; Corporate Relations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor student recruitment offers, recruiter engagements, package trends and annual placement statistics
          </p>
        </div>

        {canManage && (
          <Link
            to="/admin/placement/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Placement Offer</span>
          </Link>
        )}
      </div>

      {/* Real Statistics / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Offers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Corporate Offers
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {statistics.totalOffers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {statistics.placedStudents} placed graduates
          </p>
        </div>

        {/* Recruiting Partners */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Recruiting Partners
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-700">
            {statistics.recruiterCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active campus recruitment companies
          </p>
        </div>

        {/* Highest Package */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Highest CTC Offered
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 font-mono">
            {statistics.highestPackage}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Top campus compensation record
          </p>
        </div>

        {/* Average Package */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Average CTC Package
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700 font-mono">
            {statistics.averagePackage}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Mean annual compensation
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, company, location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
          </div>

          {/* Batch Year Filter */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Batch Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Batch {yr}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Job Type Filter */}
          <div className="relative">
            <select
              value={jobTypeFilter}
              onChange={(e) => {
                setJobTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="Internship + PPO">Internship + PPO</option>
              <option value="Contractual">Contractual</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Company Filter */}
          <div className="relative">
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition appearance-none cursor-pointer"
            >
              <option value="">All Recruiting Companies</option>
              {availableCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Info & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing {filteredPlacements.length} matching placement offers</span>
            {(searchTerm || yearFilter || jobTypeFilter || companyFilter) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold transition ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Page Size:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Candidate / Student</th>
                <th className="px-5 py-3.5">Recruiting Partner</th>
                <th className="px-5 py-3.5">Package (CTC)</th>
                <th className="px-5 py-3.5">Batch Year</th>
                <th className="px-5 py-3.5">Job Role Type</th>
                <th className="px-5 py-3.5">Work Location</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedPlacements.length > 0 ? (
                paginatedPlacements.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Student Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {item.StudentName ? item.StudentName.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {item.StudentName || "Unspecified"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Offer ID: {String(item._id).slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Company Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {item.CompanyName || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₹ {item.Package || "Not Disclosed"}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-medium">
                      {item.Year || "—"}
                    </td>

                    {/* Job Type */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          String(item.JobType).toLowerCase().includes("intern")
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {item.JobType || "Full Time"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.Location || "Not Specified"}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedPlacement(item);
                            setModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="View Offer Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        {canManage && (
                          <Link
                            to={`/admin/placement/edit/${item._id}`}
                            state={{ placement: item }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Edit Placement"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Delete */}
                        {canManage && (
                          <button
                            onClick={() =>
                              handleDelete(item._id, item.StudentName, item.CompanyName)
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        No Placement Records Found
                      </span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm || yearFilter || jobTypeFilter || companyFilter
                          ? "No placement offers match your current filter parameters. Try clearing the filters."
                          : "No student placement offers have been recorded yet."}
                      </p>
                      {(searchTerm || yearFilter || jobTypeFilter || companyFilter) && (
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredPlacements.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(startIndex + limit, filteredPlacements.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {filteredPlacements.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Placement Details Modal */}
      <PlacementDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPlacement(null);
        }}
        placement={selectedPlacement}
        canManage={canManage}
      />
    </div>
  );
}
