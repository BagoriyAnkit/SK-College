import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";

import { AddAbout } from "../../../Service/admin/About";

export default function Add() {

  const navigate = useNavigate();

  const formik = useFormik({

    initialValues: {
      title: "",
      description: "",
      vision: "",
      mission: "",
      image: ""
    },

    validationSchema: Yup.object({

      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      vision: Yup.string().required("Vision is required"),
      mission: Yup.string().required("Mission is required"),

    }),

    onSubmit: async (values) => {

      try {

        const formData = new FormData();

        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("vision", values.vision);
        formData.append("mission", values.mission);
        formData.append("image", values.image);

        const res = await AddAbout(formData);

        if (res.data.status) {

          Swal.fire({
            title: "Success!",
            text: "About Added Successfully",
            icon: "success"
          });

          navigate("/admin/about");

        }

      } catch (error) {

        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Something went wrong",
          icon: "error"
        });

      }

    }

  });

  return (
  <div>

    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-slate-800">
            Add About
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 w-full">

        <form onSubmit={formik.handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-12 px-4 rounded-xl border border-slate-300"
              />

              {formik.touched.title && formik.errors.title && (
                <p className="text-red-500 text-sm">
                  {formik.errors.title}
                </p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Image
              </label>

              <input
                type="file"
                name="image"
                onChange={(e) =>
                  formik.setFieldValue("image", e.target.files[0])
                }
                className="w-full h-12 px-4 rounded-xl border border-slate-300"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>

              <textarea
                rows="4"
                name="description"
                placeholder="Enter Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 rounded-xl border border-slate-300"
              ></textarea>

              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Vision */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Vision
              </label>

              <textarea
                rows="4"
                name="vision"
                placeholder="Enter Vision"
                value={formik.values.vision}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 rounded-xl border border-slate-300"
              ></textarea>

              {formik.touched.vision && formik.errors.vision && (
                <p className="text-red-500 text-sm">
                  {formik.errors.vision}
                </p>
              )}
            </div>

            {/* Mission */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mission
              </label>

              <textarea
                rows="4"
                name="mission"
                placeholder="Enter Mission"
                value={formik.values.mission}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 rounded-xl border border-slate-300"
              ></textarea>

              {formik.touched.mission && formik.errors.mission && (
                <p className="text-red-500 text-sm">
                  {formik.errors.mission}
                </p>
              )}
            </div>

          </div>

          <div className="border-t border-slate-200 my-8"></div>

          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={() => navigate("/admin/about")}
              className="px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            >
              Submit
            </button>

          </div>

        </form>

      </div>

    </div>

  </div>
);
}