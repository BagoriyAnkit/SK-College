import axios from "axios";
import { API_url } from "../../config/config";


// Add Admission
export const AddAdmission = async (data) => {
    const res = await axios.post(`${API_url}/admission/add`, data);
    return res.data;
};


// View All Admission
export const ViewAllAdmission = async () => {
    const res = await axios.get(`${API_url}/admission/ViewAll`);
    return res.data;
};


// Find One Admission
export const FindAdmission = async (id) => {
    const res = await axios.get(`${API_url}/admission/find/${id}`);
    return res.data;
};


// Update Admission
export const UpdateAdmission = async (id, data) => {
    const res = await axios.put(
        `${API_url}/admission/updateadmission/${id}`,
        data
    );
    return res.data;
};


// Update Admission Status
export const UpdateAdmissionStatus = async (id) => {
    const res = await axios.patch(
        `${API_url}/admission/status/${id}`
    );
    return res.data;
};

// Approve Admission (creates student and user, sets activation token)
export const ApproveAdmission = async (id) => {
    const res = await axios.put(`${API_url}/admission/approve/${id}`);
    return res.data;
};

// Reject Admission (marks rejected, no user or student created)
export const RejectAdmission = async (id, data = {}) => {
    const res = await axios.put(`${API_url}/admission/reject/${id}`, data);
    return res.data;
};

export const DeleteAdmission = async (id) => {
    const res = await axios.delete(
        `${API_url}/admission/delete/${id}`
    );
    return res.data;
};
