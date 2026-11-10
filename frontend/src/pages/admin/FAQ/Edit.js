import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { Formik, useFormik } from 'formik';
import *as Yup from 'yup'
import { UpdateFaq, ViewOneFaq } from '../../../Service/admin/Faq';
// import { text } from 'express';


export default function FaqEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [faq, setFaq] = useState({});

    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            question: faq.question || "",
            answer: faq.answer || "",
        },

        validationSchema: Yup.object({
            question: Yup.string().required("Question is required"),

            answer: Yup.string().required("Answer is required"),
        }),

        onSubmit: async (values) => {
            try {
                await UpdateFaq(id, values);

                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Faq Updated Successfully",
                });

                navigate("/admin/Faq");
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "Something went wrong",
                });
            }
        }
    });

    const getFaq = async () => {
        try {
            const res = await ViewOneFaq(id);

            // console.log("API Response :", res.data);

            // agar response {status:true,data:{...}} hai
            setFaq(res.data);

            // agar response direct object ho to ye use karo
            // setTeacher(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (id) {
            getFaq();
        }
    }, [id]);




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
                            Edit FAQ
                        </h2>

                    </div>

                </div>

                {/* Form Card */}
                {/* Form Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 w-full">

                    <form onSubmit={formik.handleSubmit}>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* Bus Number */}
                            {/* Teacher Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    name="question"
                                    placeholder="Enter Your Question"
                                    value={formik.values.question}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.question && formik.errors.question && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.question}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Answer
                                </label>
                                <textarea

                                    name="answer"
                                    placeholder="Enter Your Answer"
                                    value={formik.values.answer}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}

                                    className="w-full px-4 py-3 min-h-[120px] rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.answer && formik.errors.answer && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.answer}</p>
                                )}
                            </div>

                            {/* Email
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="Email"
                                    placeholder="Enter Email"
                                    value={formik.values.Email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.Email && formik.errors.Email && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.Email}</p>
                                )}
                            </div> */}

                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Gender
                                </label>
                                <select

                                    type="text"
                                    name='gender'
                                    placeholder="Enter gender"
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Custom">Custom</option>
                                </select>
                                {formik.touched.gender && formik.errors.gender && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.gender}
                                    </p>
                                )}

                            </div> */}

                            {/* Department */}
                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="Department"
                                    placeholder="Enter Department"
                                    value={formik.values.Department}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.Department && formik.errors.Department && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.Department}</p>
                                )}
                            </div> */}

                            {/* Qualification */}
                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Qualification
                                </label>
                                <input
                                    type="text"
                                    name="Qualification"
                                    placeholder="Enter Qualification"
                                    value={formik.values.Qualification}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.Qualification && formik.errors.Qualification && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.Qualification}</p>
                                )}
                            </div> */}

                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Experience
                                </label>
                                <input
                                    type="text"
                                    name="Experience"
                                    placeholder="Enter Experience"
                                    value={formik.values.Experience}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                />
                                {formik.touched.Experience && formik.errors.Experience && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.Experience}</p>
                                )}
                            </div> */}

                            {/* Status */}
                            {/* <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={Status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 outline-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div> */}



                            {/* Divider */}
                            <div className="border-t border-slate-200 my-8"></div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-4">

                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/Faq")}
                                    className="px-8 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition"
                                >
                                    Update
                                </button>

                            </div>
                        </div>
                    </form>

                </div>

            </div>
        </div>
    )
}