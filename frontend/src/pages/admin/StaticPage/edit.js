
import React, { useState, useEffect } from 'react'

import Swal from "sweetalert2";
import { UpdateStaticPage, ViewStaticPage } from '../../../Service/admin/StaticPage';

import { Formik, useFormik } from 'formik';
import *as Yup from 'yup'
import { useNavigate, useParams } from "react-router-dom";


export default function Edit() {
    const [staticpage, setStaticPage] = useState(null);

    const navigate = useNavigate()
    const { id } = useParams()
    // console.log("Student ID:", id);

    // const [AddStudentOpen, setAddStudentOpen] = useState(false)
    // const [StudentName, setStudentName] = useState('')
    // 	const [Phone, setPhone] = useState('')
    // 	const [Email, setEmail] = useState('')
    // 	const [Address, setAddress] = useState('')
    //   	const [CourseId, setCourseId] = useState('')
    //     	const [dob, setdob] = useState('')
    // 	const [Status, setStatus] = useState('InActvie')


    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {

            title: staticpage?.title || "",
            description: staticpage?.description || "",
            image: staticpage?.image || "",
            slug: staticpage?.slug || "",

        },

        onSubmit: async (values) => {
            try {

                const res = await UpdateStaticPage(id, values);

                if (res.status) {

                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Page Updated Successfully"
                    });

                    navigate("/admin/StaticPage");
                }

            } catch (error) {

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.response?.data?.message || "Something went wrong"
                });

            }
        }
    });
    const getStaticPage = async () => {
        try {
            const res = await ViewStaticPage(id);
            // console.log("API Response:", res);
            // console.log("Student Data:", res.data);

            console.log(res.data); // check data

            setStaticPage(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (id) {
            getStaticPage();
        }
    }, []);

    return (


        <div>

            {/* Add Bus */}
            <div id="view-add-bus" className="space-y-6">


                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <button className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-100 transition">
                            <i data-lucide="arrow-left" className="w-5 h-5"></i>
                        </button>

                        <h2 className="text-3xl font-bold text-slate-800">
                            Edit StaticPage
                        </h2>

                    </div>

                </div>

                {/* Form Card */}
                {/* Form Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 w-full">

                    <form onSubmit={formik.handleSubmit}>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* Bus Number */}
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
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />

                                {formik.touched.title && formik.errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Bus Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Enter  Description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}

                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Bus Type */}
                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Image
                                </label>
                                <input
                                    type='file'
                                    name='image'
                                    placeholder="Enter the Image "
                                    // value={formik.values.image}
                                    onBlur={formik.handleBlur}
                                    onChange={(e) => {
                                        formik.setFieldValue("image", e.target.files[0]);
                                    }}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.image && formik.errors.image && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.image}
                                    </p>
                                )}


                            </div> */}

                            {/* Total Seats */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Slug
                                </label>
                                <input

                                    type="text"
                                    name='slug'
                                    placeholder="Enter Slug"
                                    value={formik.values.slug}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.slug && formik.errors.slug && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Course
                                </label>
                                <input
                                    type="text"
                                    name='Course'
                                    placeholder="Enter Course"
                                    value={formik.values.Course}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.Course && formik.errors.Course && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.Course}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formik.values.dob}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300"
                                />

                                {formik.touched.dob && formik.errors.dob && (
                                    <p className="text-red-500 text-sm">
                                        {formik.errors.dob}
                                    </p>
                                )}

                            </div> */}



                        </div>


                        {/* Divider */}
                        <div className="border-t border-slate-200 my-8"></div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4">

                            <button
                                type="button"
                                onClick={() => navigate("/admin/StaticPage")}
                                className="px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
                            >
                                Back
                            </button>

                            <button
                                type="submit"
                                className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition"
                            >
                                Submit
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </div>
    )
}
