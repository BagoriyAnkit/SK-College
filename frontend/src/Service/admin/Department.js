import axios from "axios";
import { API_url } from "../../config/config";


// Add Department
export const AddDepartment = async (data) => {
    const res = await axios.post(`${API_url}/department/add`, data);
    return res;
};


// View All Department
export const ViewAllDepartment = async (page, limit) => {
    const res = await axios.get(
        `${API_url}/department/viewall?page=${page}&limit=${limit}`
    );
    return res.data;
};


// View One Department
export const ViewOneDepartment = async (id) => {
    const res = await axios.get(`${API_url}/department/findOne/${id}`);
    return res;
};


// Update Department Status
export const UpdateDepartmentStatus = async (id) => {
    const res = await axios.patch(`${API_url}/department/update-status/${id}`);
    return res;
};


// Update Department
export const UpdateDepartment = async (id, data) => {
    const res = await axios.put(`${API_url}/department/update/${id}`, data);
    return res.data.data;
};


// Delete Department
export const DeleteDepartment = async (id) => {
    const res = await axios.delete(`${API_url}/department/delete/${id}`);
    return res;
};