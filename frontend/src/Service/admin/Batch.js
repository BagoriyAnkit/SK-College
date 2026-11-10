import axios from "axios";
import { API_url } from "../../config/config";

// Add Batch
export const AddBatch = async (data) => {
    const res = await axios.post(`${API_url}/batch/add`, data);
    return res.data;
};

// View All Batch
export const ViewAllBatch = async () => {
    const res = await axios.get(`${API_url}/batch/viewall`);
    return res.data;
};

// View One Batch
export const ViewOneBatch = async (id) => {
    const res = await axios.get(`${API_url}/batch/find/${id}`);
    return res.data;
};

// Update Batch
export const UpdateBatch = async (id, data) => {
    const res = await axios.put(`${API_url}/batch/update/${id}`, data);
    return res.data;
};

// Delete Batch
export const DeleteBatch = async (id) => {
    const res = await axios.delete(`${API_url}/batch/delete/${id}`);
    return res.data;
};

// Update Status
export const UpdateBatchStatus = async (id) => {
    const res = await axios.put(`${API_url}/batch/status/${id}`);
    return res.data;
};