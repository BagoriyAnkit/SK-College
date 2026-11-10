import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Award,
  Upload,
  Check,
  AlertCircle
} from "lucide-react";

import Loader from "../../../Components/Loader";
import {
  FindAdmission,
  UpdateAdmission
} from "../../../Service/admin/admission";
import { ViewAllCourse } from "../../../Service/admin/Course";
import { Image_url } from "../../../config/config";

export default function AddmissionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [admRes, courseRes] = await Promise.all([
          FindAdmission(id),
          ViewAllCourse(1, 100)
        ]);

        setAdmission(admRes?.data || null);

        const courseList = Array.isArray(courseRes?.data) ? courseRes.data : Array.isArray(courseRes) ? courseRes : [];
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching admission details for edit:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Admission record not found or server error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      studentName: admission?.studentName || "",
      fatherName: admission?.fatherName || "",
      motherName: admission?.motherName || "",
      parentMobile: admission?.parentMobile || "",
      gender: admission?.gender || "",
      DOB: admission?.DOB
        ? new Date(admission.DOB).toISOString().split("T")[0]
        : "",
      mobile: admission?.mobile || "",
      email: admission?.email || "",
      aadhaar: admission?.aadhaar || "",
      address: admission?.address || "",
      city: admission?.city || "",
      state: admission?.state || "",
      pincode: admission?.pincode || "",
      courseName: admission?.courseName || "",
      session: admission?.session || "",
      admissionDate: admission?.admissionDate
        ? new Date(admission.admissionDate).toISOString().split("T")[0]
        : "",
      qualification: admission?.qualification || "",
      board: admission?.board || "",
      passingYear: admission?.passingYear || "",
      percentage: admission?.percentage || "",
      photo: null,
      signature: null,
      marksheet: null,
    },

    validationSchema: Yup.object({
      studentName: Yup.string().required("Applicant full name is required"),
      fatherName: Yup.string().required("Father's name is required"),
      motherName: Yup.string().required("Mother's name is required"),
      parentMobile: Yup.string().matches(/^[0-9]{10}$/, "Parent mobile number must be 10 digits").nullable(),
      gender: Yup.string().required("Gender selection is required"),
      aadhaar: Yup.string().required("Aadhaar card number is required"),
      session: Yup.string().required("Academic session is required"),
      admissionDate: Yup.string().required("Admission date is required"),
      qualification: Yup.string().required("Prior qualification is required"),
      board: Yup.string().required("Education board/university is required"),
      passingYear: Yup.number()
        .typeError("Passing year must be a valid number")
        .required("Passing year is required"),
      percentage: Yup.string().required("Percentage/Grade is required"),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email address is required"),
      address: Yup.string().required("Residential address is required"),
      courseName: Yup.string().required("Applied course is required"),
      DOB: Yup.date()
        .max(new Date(), "Future date is not allowed")
        .required("Date of birth is required"),
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const formData = new FormData();

        const regularFields = [
          "studentName",
          "fatherName",
          "motherName",
          "parentMobile",
          "gender",
          "DOB",
          "mobile",
          "email",
          "aadhaar",
          "address",
          "city",
          "state",
          "pincode",
          "courseName",
          "session",
          "admissionDate",
          "qualification",
          "board",
          "passingYear",
          "percentage"
        ];

        regularFields.forEach((field) => {
          if (values[field] !== null && values[field] !== undefined) {
            formData.append(field, values[field]);
          }
        });

        if (values.photo) {
          formData.append("photo", values.photo);
        }

        if (values.signature) {
          formData.append("signature", values.signature);
        }

        if (values.marksheet) {
          formData.append("marksheet", values.marksheet);
        }

        const res = await UpdateAdmission(id, formData);

        if (res?.status || res) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Admission application updated successfully.",
            confirmButtonColor: "#0f172a"
          });

          navigate("/admin/addmissions");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.response?.data?.message || "Something went wrong while updating admission",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return <Loader />;
  }

  if (!admission) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-lg font-bold text-slate-800">Admission Record Not Found</h2>
        <Link
          to="/admin/addmissions"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Admissions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/addmissions" className="hover:text-slate-800 transition">
              Admissions Management
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Edit Admission</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Admission: {admission.studentName || "Applicant"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify candidate bio-data, academic choices, contact information, and documents
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/addmissions")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admissions</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Section 1: Personal & Identity Information */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Personal &amp; Identity Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Applicant Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  placeholder="Enter Student Name"
                  value={formik.values.studentName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.studentName && formik.errors.studentName
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.studentName && formik.errors.studentName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.studentName}</span>
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                    formik.touched.gender && formik.errors.gender
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Custom">Custom / Other</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.gender}</span>
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="DOB"
                  value={formik.values.DOB}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.DOB && formik.errors.DOB
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.DOB && formik.errors.DOB && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.DOB}</span>
                  </p>
                )}
              </div>

              {/* Aadhaar Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Aadhaar Card Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="aadhaar"
                  placeholder="12-digit Aadhaar UID"
                  value={formik.values.aadhaar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.aadhaar && formik.errors.aadhaar
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.aadhaar && formik.errors.aadhaar && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.aadhaar}</span>
                  </p>
                )}
              </div>

              {/* Candidate Photograph */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Candidate Photograph
                </label>
                <div className="flex items-center gap-4">
                  {admission.photo && !formik.values.photo && (
                    <img
                      src={`${Image_url}/${admission.photo}`}
                      alt="Student"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  {formik.values.photo && (
                    <img
                      src={URL.createObjectURL(formik.values.photo)}
                      alt="New Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) =>
                      formik.setFieldValue("photo", e.currentTarget.files[0])
                    }
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Parents & Family Background */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Parents &amp; Family Background
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Father's Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={formik.values.fatherName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.fatherName && formik.errors.fatherName
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.fatherName && formik.errors.fatherName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.fatherName}</span>
                  </p>
                )}
              </div>

              {/* Mother Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mother's Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="motherName"
                  placeholder="Enter mother's name"
                  value={formik.values.motherName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.motherName && formik.errors.motherName
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.motherName && formik.errors.motherName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.motherName}</span>
                  </p>
                )}
              </div>

              {/* Parent Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent / Guardian Mobile Number
                </label>
                <input
                  type="text"
                  name="parentMobile"
                  placeholder="10-digit parent mobile"
                  maxLength={10}
                  value={formik.values.parentMobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.parentMobile && formik.errors.parentMobile
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.parentMobile && formik.errors.parentMobile && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.parentMobile}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Residential Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                3. Contact &amp; Residential Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mobile"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.mobile && formik.errors.mobile
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.mobile && formik.errors.mobile && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.mobile}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.email && formik.errors.email
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.email}</span>
                  </p>
                )}
              </div>

              {/* Residential Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Complete Residential Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  placeholder="Street, locality, area details"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.address && formik.errors.address
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.address}</span>
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Jaipur"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="e.g. Rajasthan"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Academic Program & Intake */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                4. Academic Program &amp; Intake Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Course Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Applied Academic Course <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="registered-courses-list"
                    name="courseName"
                    placeholder="Select or enter course name"
                    value={formik.values.courseName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                      formik.touched.courseName && formik.errors.courseName
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-slate-900"
                    }`}
                  />
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <datalist id="registered-courses-list">
                  {courses.map((c) => (
                    <option key={c._id} value={c.courseName}>
                      {c.courseName} {c.courseCode ? `(${c.courseCode})` : ""}
                    </option>
                  ))}
                </datalist>
                {formik.touched.courseName && formik.errors.courseName && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.courseName}</span>
                  </p>
                )}
              </div>

              {/* Session */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Session <span className="text-rose-500">*</span>
                </label>
                <select
                  name="session"
                  value={formik.values.session}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition appearance-none cursor-pointer ${
                    formik.touched.session && formik.errors.session
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                >
                  <option value="">Select Academic Session</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
                {formik.touched.session && formik.errors.session && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.session}</span>
                  </p>
                )}
              </div>

              {/* Admission Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admission Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formik.values.admissionDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.admissionDate && formik.errors.admissionDate
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.admissionDate && formik.errors.admissionDate && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.admissionDate}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Prior Educational Qualifications */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                5. Prior Educational Qualifications
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Qualification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Qualification <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. 12th Senior Secondary"
                  value={formik.values.qualification}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.qualification && formik.errors.qualification
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.qualification && formik.errors.qualification && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.qualification}</span>
                  </p>
                )}
              </div>

              {/* Board */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Board / University <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="board"
                  placeholder="e.g. CBSE / State Board"
                  value={formik.values.board}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.board && formik.errors.board
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.board && formik.errors.board && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.board}</span>
                  </p>
                )}
              </div>

              {/* Passing Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Passing Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="passingYear"
                  placeholder="e.g. 2024"
                  min="1980"
                  max="2035"
                  value={formik.values.passingYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.passingYear && formik.errors.passingYear
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.passingYear && formik.errors.passingYear && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.passingYear}</span>
                  </p>
                )}
              </div>

              {/* Percentage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Aggregate Percentage (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="percentage"
                  placeholder="e.g. 84.5"
                  value={formik.values.percentage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition ${
                    formik.touched.percentage && formik.errors.percentage
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {formik.touched.percentage && formik.errors.percentage && (
                  <p className="flex items-center gap-1 text-rose-500 text-[11px] mt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formik.errors.percentage}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Candidate Signature Specimen */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                6. Candidate Signature Specimen
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {admission.signature && !formik.values.signature && (
                <img
                  src={`${Image_url}/${admission.signature}`}
                  alt="Existing Signature"
                  className="h-12 max-w-[150px] object-contain border border-slate-200 rounded-xl bg-white p-1"
                />
              )}
              {formik.values.signature && (
                <img
                  src={URL.createObjectURL(formik.values.signature)}
                  alt="New Signature"
                  className="h-12 max-w-[150px] object-contain border border-slate-200 rounded-xl bg-white p-1"
                />
              )}
              <input
                type="file"
                name="signature"
                accept="image/*"
                onChange={(e) => {
                  formik.setFieldValue("signature", e.currentTarget.files[0]);
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 7: Previous Qualification Marksheet */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                7. Previous Qualification Marksheet
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {admission.marksheet && !formik.values.marksheet && (
                <a
                  href={`${Image_url}/${admission.marksheet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                >
                  View Current Marksheet
                </a>
              )}
              {formik.values.marksheet && (
                <span className="text-xs text-emerald-700 font-medium">
                  Selected: {formik.values.marksheet.name}
                </span>
              )}
              <input
                type="file"
                name="marksheet"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  formik.setFieldValue("marksheet", e.currentTarget.files[0]);
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/addmissions")}
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
