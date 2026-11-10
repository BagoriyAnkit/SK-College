import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  MapPin,
  Calendar,
  Check,
  AlertCircle,
  TrendingUp
} from "lucide-react";

import Loader from "../../../Components/Loader";
import {
  FindOnePlacement,
  UpdatePlacement
} from "../../../Service/admin/Placement";
import { ViewAllStudent } from "../../../Service/admin/collage";

export default function PlacementEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);

  const formik = useFormik({
    initialValues: {
      StudentName: "",
      CompanyName: "",
      Package: "",
      Year: "",
      JobType: "Full Time",
      Location: "",
    },

    validationSchema: Yup.object({
      StudentName: Yup.string().trim().required("Candidate full name is required"),
      CompanyName: Yup.string().trim().required("Recruiting company name is required"),
      Package: Yup.string().trim().required("Annual compensation / package is required"),
      Year: Yup.string().trim().required("Placement batch year is required"),
      JobType: Yup.string().trim().required("Job role classification is required"),
      Location: Yup.string().trim().required("Work location is required"),
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const res = await UpdatePlacement(id, values);

        if (res?.success !== false) {
          await Swal.fire({
            title: "Changes Saved!",
            text: "Placement record updated successfully.",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/placement");
        } else {
          Swal.fire({
            title: "Update Failed",
            text: res?.message || "Failed to update placement record.",
            icon: "warning",
            confirmButtonColor: "#0f172a"
          });
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to update placement record.";
        Swal.fire({
          title: "Update Error",
          text: message,
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students list for datalist suggestions
        const stuPromise = ViewAllStudent(1, 100).catch(() => ({ data: [] }));

        // Prefer state if passed from listing, otherwise fetch from server
        let placementData = location.state?.placement || null;
        if (!placementData && id) {
          const res = await FindOnePlacement(id);
          placementData = res?.data || null;
        }

        const [stuRes] = await Promise.all([stuPromise]);
        const stuList = Array.isArray(stuRes?.data) ? stuRes.data : Array.isArray(stuRes) ? stuRes : [];
        setStudents(stuList);

        if (placementData) {
          formik.setValues({
            StudentName: placementData.StudentName || "",
            CompanyName: placementData.CompanyName || "",
            Package: placementData.Package || "",
            Year: placementData.Year || "",
            JobType: placementData.JobType || "Full Time",
            Location: placementData.Location || "",
          });
        }
      } catch (error) {
        console.error("Error fetching placement for edit:", error);
        Swal.fire({
          title: "Record Not Found",
          text: "Could not load placement record details.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/placement" className="hover:text-slate-800 transition">
              Campus Placements
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Placement Record</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Placement Offer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update candidate placement offer details, recruiter compensation packages, and work terms
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/placement")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Placements</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          
          {/* Section 1: Candidate Information */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Candidate / Student Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Placed Student Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="registered-students-list"
                    name="StudentName"
                    placeholder="Enter or select candidate legal name"
                    value={formik.values.StudentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.StudentName && formik.errors.StudentName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <datalist id="registered-students-list">
                  {students.map((s) => (
                    <option
                      key={s._id}
                      value={s.StudentName || s.studentName}
                    >
                      {s.Course ? `(${s.Course})` : ""}
                    </option>
                  ))}
                </datalist>
                {formik.touched.StudentName && formik.errors.StudentName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.StudentName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Recruiter & Compensation Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Corporate Offer &amp; Compensation Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Recruiting Partner / Company <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="suggested-companies-list"
                    name="CompanyName"
                    placeholder="e.g. Tata Consultancy Services, Amazon"
                    value={formik.values.CompanyName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.CompanyName && formik.errors.CompanyName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <datalist id="suggested-companies-list">
                  <option value="Tata Consultancy Services (TCS)" />
                  <option value="Infosys Limited" />
                  <option value="Wipro Technologies" />
                  <option value="Amazon India" />
                  <option value="Microsoft" />
                  <option value="Accenture" />
                  <option value="Cognizant" />
                  <option value="Tech Mahindra" />
                  <option value="HCL Technologies" />
                  <option value="L&T Infotech" />
                  <option value="Deloitte" />
                  <option value="Capgemini" />
                </datalist>
                {formik.touched.CompanyName && formik.errors.CompanyName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.CompanyName}</span>
                  </p>
                )}
              </div>

              {/* Package */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Annual Package (CTC) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="Package"
                    placeholder="e.g. 8.5 LPA or 12 LPA"
                    value={formik.values.Package}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.Package && formik.errors.Package
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.Package && formik.errors.Package && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.Package}</span>
                  </p>
                )}
              </div>

              {/* Placement Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Placement Batch Year <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="Year"
                    placeholder="e.g. 2026 or 2025"
                    value={formik.values.Year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.Year && formik.errors.Year
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.Year && formik.errors.Year && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.Year}</span>
                  </p>
                )}
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Role Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  name="JobType"
                  value={formik.values.JobType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer ${
                    formik.touched.JobType && formik.errors.JobType
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Internship + PPO">Internship + PPO</option>
                  <option value="Contractual">Contractual</option>
                </select>
                {formik.touched.JobType && formik.errors.JobType && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.JobType}</span>
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="Location"
                    placeholder="e.g. Bengaluru, Karnataka (or Pune, Remote)"
                    value={formik.values.Location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.Location && formik.errors.Location
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.Location && formik.errors.Location && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.Location}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/placement")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
