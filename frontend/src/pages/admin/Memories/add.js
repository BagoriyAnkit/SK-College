import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  Info
} from "lucide-react";

import { AddMemories } from "../../../Service/admin/Memories";

export default function MemoriesAdd() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  const formik = useFormik({
    initialValues: {
      image: null
    },

    validationSchema: Yup.object({
      image: Yup.mixed()
        .required("Please select an image file to upload")
        .test("fileType", "Only JPG, PNG, WEBP and GIF images are supported", (value) => {
          if (!value) return false;
          return [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
          ].includes(value.type);
        })
        .test("fileSize", "File size must be 10MB or less", (value) => {
          if (!value) return false;
          return value.size <= 10 * 1024 * 1024;
        })
    }),

    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append("image", values.image);

        const res = await AddMemories(formData);

        if (res?.data?.status !== false) {
          await Swal.fire({
            title: "Memory Uploaded!",
            text: "Campus memory photo has been published to the gallery.",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/memories");
        } else {
          Swal.fire({
            title: "Upload Failed",
            text: res?.data?.message || "Failed to upload image.",
            icon: "warning",
            confirmButtonColor: "#0f172a"
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.message || "Something went wrong during upload.",
          icon: "error",
          confirmButtonColor: "#0f172a"
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleFileChange = (e) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue("image", file);
      setFileDetails({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    formik.setFieldValue("image", null);
    setPreviewUrl(null);
    setFileDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/memories" className="hover:text-slate-800 transition">
              Memories
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Upload Photo</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Upload Campus Memory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add high-resolution photographs to the college public gallery, student events archive, and campus reels
          </p>
        </div>

        <Link
          to="/admin/memories"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form
            onSubmit={formik.handleSubmit}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Photo File <span className="text-rose-500">*</span>
              </label>

              {!previewUrl ? (
                /* Drag & Drop Upload Zone */
                <label className="relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition group">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-900 shadow-2xs transition mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 group-hover:underline">
                    Click to browse or drag and drop image here
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP or GIF (Max file size: 10MB)
                  </span>
                </label>
              ) : (
                /* Live Preview Area */
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 p-3 relative group">
                  <div className="relative max-h-96 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                    <img
                      src={previewUrl}
                      alt="Selected Preview"
                      className="max-h-96 w-auto object-contain"
                    />

                    {/* Clear Button */}
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition shadow-md cursor-pointer"
                      title="Remove image and select another"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Metadata Bar */}
                  {fileDetails && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white truncate">
                          {fileDetails.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-3">
                        {fileDetails.size}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Validation Error Message */}
              {formik.touched.image && formik.errors.image && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formik.errors.image}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/memories")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !formik.values.image}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload to Gallery</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info & Guidelines Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Image Recommendations</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                <span><strong>Resolution:</strong> Optimal resolution is 1200 &times; 800 or 1920 &times; 1080 pixels.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                <span><strong>Aspect Ratio:</strong> Standard landscape (16:9 or 4:3) formats render best in cards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                <span><strong>File Size:</strong> Keep images under 10MB to maintain fast public website load speeds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                <span><strong>Subject:</strong> Suitable for convocation ceremonies, tech fests, sports meets, cultural programs, and campus infrastructure.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant Public Publishing</span>
            </div>
            <p className="text-blue-700 leading-relaxed text-[11px]">
              Uploaded photos become immediately accessible in the public website's "Campus Life &amp; Memories" section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
