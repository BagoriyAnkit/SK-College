import axios from "axios";
import { API_url } from "../../config/config";

export const AdminLoginApi = async (data) => {
    return await axios.post(`${API_url}/admin/login`, data);
};

export const ViewAllUser = async (page = 1, limit = 10, search = "", role = "") => {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (role && role !== "all") query += `&role=${encodeURIComponent(role)}`;
    const res = await axios.get(`${API_url}/user/viewAll${query}`);
    return res.data;
};

export const CreateUser = async (data) => {
    const res = await axios.post(`${API_url}/user/add`, data);
    return res.data;
};

export const FindUser = async (id) => {
    const res = await axios.get(`${API_url}/user/find/${id}`);
    return res.data;
};

export const UpdateUser = async (id, data) => {
    const res = await axios.put(`${API_url}/user/update/${id}`, data);
    return res.data;
};

export const DeleteUser = async (id) => {
    const res = await axios.delete(`${API_url}/user/delete/${id}`);
    return res.data;
};

export const UpdateUserStatus = async (id) => {
    const res = await axios.put(`${API_url}/user/statusUpdate/${id}`);
    return res.data;
};
