import axios from "axios";
import { API_url } from "../../config/config";

export const AddNotice = async (data) => {
    const res = await axios.post(`${API_url}/notice/add`, data);
    return res;
};

export const ViewAllNotice = async (page = 1, limit = 10) => {
    const query = page && limit ? `?page=${page}&limit=${limit}` : "";
    const res = await axios.get(`${API_url}/notice/viewAll${query}`);
    return res.data;
};

export const FindOneNotice = async (id) => {
    try {
        const res = await axios.get(`${API_url}/notice/view/${id}`);
        return res.data;
    } catch {
        try {
            const res = await axios.get(`${API_url}/notice/findOne/${id}`);
            return res.data;
        } catch {
            const res = await axios.get(`${API_url}/notice/find/${id}`);
            return res.data;
        }
    }
};

export const ViewOneNotice = FindOneNotice;

export const UpdateNotice = async (id, data) => {
    const res = await axios.put(`${API_url}/notice/update/${id}`, data);
    return res.data;
};

export const DeleteNotice = async (id) => {
    const res = await axios.delete(`${API_url}/notice/delete/${id}`);
    return res.data;
};
