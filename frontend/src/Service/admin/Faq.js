import axios from "axios";
import { API_url } from "../../config/config";

// Add FAQ
export const AddFaq = async (data) => {
    const res = await axios.post(`${API_url}/faq/add`, data);
    return res.data;
};

// View All FAQ
export const ViewAllFaq = async () => {
    const res = await axios.get(`${API_url}/faq/viewAll`);
    return res.data;
};

// Find One FAQ
export const ViewOneFaq = async (id) => {
    const res = await axios.get(`${API_url}/faq/find/${id}`);
    return res.data;
};

// Update FAQ
export const UpdateFaq = async (id, data) => {
    const res = await axios.put(`${API_url}/faq/update/${id}`, data);
    return res.data;
};

// Delete FAQ
export const DeleteFaq = async (id) => {
    const res = await axios.delete(`${API_url}/faq/delete/${id}`);
    return res.data;
};

// Update FAQ Status
export const UpdateFaqStatus = async (id) => {
    const res = await axios.patch(`${API_url}/faq/status/${id}`);
    return res.data;
};