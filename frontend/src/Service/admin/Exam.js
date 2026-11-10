import axios from "axios";
import { API_url } from "../../config/config";

// Add Exam
export const AddExam = async (data) => {
    const res = await axios.post(`${API_url}/exam/add`, data);
    return res.data;
};

// View All Exam
export const ViewAllExam = async (page = 1, limit = 10) => {
    const res = await axios.get(
        `${API_url}/exam/viewall?page=${page}&limit=${limit}`
    );
    return res.data;
};

// View One Exam
export const ViewOneExam = async (id) => {
    const res = await axios.get(`${API_url}/exam/find/${id}`);
    return res.data;
};

// Update Exam
export const UpdateExam = async (id, data) => {
    const res = await axios.put(`${API_url}/exam/update/${id}`, data);
    return res.data;
};

// Delete Exam
export const DeleteExam = async (id) => {
    const res = await axios.delete(`${API_url}/exam/delete/${id}`);
    return res.data;
};

// Get Exam-wise Student Marks List
export const GetExamMarks = async (examId) => {
    const res = await axios.get(`${API_url}/exam/${examId}/marks`);
    return res.data;
};

// Add / Enter Marks for Student
export const AddStudentMarks = async (examId, data) => {
    const res = await axios.post(`${API_url}/exam/${examId}/marks`, data);
    return res.data;
};

// Update Student Marks
export const UpdateStudentMarks = async (examId, marksId, data) => {
    const res = await axios.put(`${API_url}/exam/${examId}/marks/${marksId}`, data);
    return res.data;
};

// Delete Student Marks
export const DeleteStudentMarks = async (examId, marksId) => {
    const res = await axios.delete(`${API_url}/exam/${examId}/marks/${marksId}`);
    return res.data;
};

// Get Student Marks across all exams
export const GetStudentMarks = async (studentId) => {
    const res = await axios.get(`${API_url}/exam/student/${studentId}/marks`);
    return res.data;
};

// Get Batch Results
export const GetBatchResults = async (batchId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_url}/exam/batch/${batchId}/results?${query}` : `${API_url}/exam/batch/${batchId}/results`;
    const res = await axios.get(url);
    return res.data;
};

// Get Student Marksheet
export const GetStudentMarksheet = async (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_url}/exam/student/${studentId}/marksheet?${query}` : `${API_url}/exam/student/${studentId}/marksheet`;
    const res = await axios.get(url);
    return res.data;
};
