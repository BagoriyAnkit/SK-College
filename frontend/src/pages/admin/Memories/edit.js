import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  Info,
  Calendar,
  RotateCcw
} from "lucide-react";

import Loader from "../../../Components/Loader";
import { ViewOneMemories, UpdateMemories } from "../../../Service/admin/Memories";
import { Image_url } from "../../../config/config";

export default function MemoriesEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await ViewOneMemories(id);
      if (res?.data?.status && res?.data?.data) {
        setCurrentMemory(res.data.data);
      } else if (res?.data?.data) {
        setCurrentMemory(res.data.data);
      } else if (res?.data) {
        setCurrentMemory(res.data);
      }
    } catch (error) {
      console.error("Error loading memory:", error);
      Swal.fire({
        title: "Load Error",
        text: "Could not retrieve the requested memory record.",
        icon: "error",
        confirmButtonColor: "#0f172a"
      });
      navigate("/admin/memories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      image: null
    },

    validationSchema: Yup.object({
      image: Yup.mixed().test(
        "fileType",
        "Only JPG, PNG, WEBP and GIF images are supported",
        (value) => {
          if (!value) return true; // Optional on edit
          return [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
          ].includes(value.type);
        }
      ).test("fileSize", "File size must be 10MB or less", (value) => {
        if (!value) return true;
        return value.size <= 10 * 1024 * 1024;
      })
    }),

    onSubmit: async (values) => {
      if (!values.image) {
        Swal.fire({
          title: "No Changes",
          text: "Please select a replacement photo before updating.",
          icon: "info",
          confirmButtonColor: "#0f172a"
        });
        return;
      }

      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append("image", values.image);

        const res = await UpdateMemories(id, formData);

        if (res?.data?.status !== false) {
          await Swal.fire({
            title: "Memory Updated!",
            text: "Campus memory photo has been replaced successfully.",
            icon: "success",
            confirmButtonColor: "#0f172a"
          });
          navigate("/admin/memories");
        } else {
          Swal.fire({
            title: "Update Failed",
            text: res?.data?.message || "Failed to update memory.",
            icon: "warning",
            confirmButtonColor: "#0f172a"
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.message || "Failed to update memory.",
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

  if (loading) {
    return <Loader />;
  }

  const currentImageSrc = currentMemory?.image
    ? `${Image_url}/${currentMemory.image}`
    : "/default-fallback-image.png";

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin/memories" className="hover:text-slate-800 transition">
              Memories
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Edit Photo</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Campus Memory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Replace or update existing campus photograph #{String(id).slice(-6)}
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
        {/* Main Edit Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={formik.handleSubmit}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6"
          >
            {/* Current Image Display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Gallery Photograph
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Currently Live</span>
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden p-3">
                <div className="max-h-72 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                  <img
                    src={currentImageSrc}
                    alt="Current Memory"
                    className="max-h-72 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-300 px-1">
                  <span className="font-semibold text-white truncate max-w-sm" title={currentMemory?.image}>
                    {currentMemory?.image || "Memory Image"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentMemory?.createdAt
                      ? moment(currentMemory.createdAt).format("DD MMM YYYY")
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Replacement Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Upload Replacement Photograph
              </label>

              {!previewUrl ? (
                <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition group">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-900 shadow-2xs transition mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 group-hover:underline">
                    Click to select new replacement photo
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    JPG, PNG, WEBP or GIF (Max: 10MB)
                  </span>
                </label>
              ) : (
                <div className="rounded-2xl border-2 border-blue-200 overflow-hidden bg-slate-950 p-3 relative group">
                  <div className="relative max-h-72 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900">
                    <img
                      src={previewUrl}
                      alt="Replacement Preview"
                      className="max-h-72 w-auto object-contain"
                    />

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition shadow-md cursor-pointer"
                      title="Discard replacement and keep current"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {fileDetails && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white truncate">
                          Replacement: {fileDetails.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-3">
                        {fileDetails.size}
                      </span>
                    </div>
                  )}
                </div>
              )}

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
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Photo Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-700" />
              <span>Record Information</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Database Record ID</span>
                <span className="font-mono text-slate-700 block mt-0.5">{id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Original Upload Date</span>
                <span className="font-medium text-slate-700 block mt-0.5">
                  {currentMemory?.createdAt
                    ? moment(currentMemory.createdAt).format("DD MMMM YYYY, hh:mm A")
                    : "Archived"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Updated</span>
                <span className="font-medium text-slate-700 block mt-0.5">
                  {currentMemory?.updatedAt
                    ? moment(currentMemory.updatedAt).fromNow()
                    : "Not modified"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Instant Gallery Update</span>
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Replacing this photograph will automatically update the public website and all embedded gallery carousels without breaking existing links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
