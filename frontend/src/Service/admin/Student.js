import axios from "axios";
import { API_url } from "../../config/config";

// Add Student
export const AddStudent = async (data) => {
  const res = await axios.post(`${API_url}/student/add`, data);
  return res.data;
};

// View All Students (Pagination)
export const ViewAllStudent = async (page = 1, limit = 2) => {
  const res = await axios.get(
    `${API_url}/student/viewAll?page=${page}&limit=${limit}`
  );
  return res.data;
};

// View One Student
export const ViewOneStudent = async (id) => {
  const res = await axios.get(`${API_url}/student/findstudent/${id}`);
  return res.data;
};

// Update Student
export const UpdateStudent = async (id, data) => {
  const res = await axios.put(`${API_url}/student/update/${id}`, data);
  return res.data;
};

// Delete Student
export const DeleteStudent = async (id) => {
  const res = await axios.delete(`${API_url}/student/delete/${id}`);
  return res.data;
};

// Update Student Status
export const UpdateStudentStatus = async (id) => {
  const res = await axios.patch(`${API_url}/student/status/${id}`);
  return res.data;
};