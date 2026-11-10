import axios from "axios";
import { API_url } from "../../config/config";

// Add Placement
export const AddPlacement = async (data) => {
    const res = await axios.post(`${API_url}/placement/add`, data);
    return res.data;
};

// View All Placements
export const ViewAllPlacement = async () => {
    const res = await axios.get(`${API_url}/placement/viewAll`);
    return res.data;
};

export const FindOnePlacement = async (id) => {
    const res = await axios.get(`${API_url}/placement/findOne/${id}`);
    return res.data;
};

// Update Placement
export const UpdatePlacement = async (id, data) => {
    const res = await axios.put(`${API_url}/placement/update/${id}`, data);
    return res.data;
};

// Delete Placement
export const DeletePlacement = async (id) => {
    const res = await axios.delete(`${API_url}/placement/delete/${id}`);
    return res.data;
};