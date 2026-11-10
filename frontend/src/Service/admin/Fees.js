import axios from "axios";
import { API_url } from "../../config/config";

// Add Fees
export const AddFees = async (data) => {
    const res = await axios.post(`${API_url}/fees/add`, data);
    return res.data;
};

// View All Fees
export const ViewAllFees = async (page = 1, limit = 6) => {
  const res = await axios.get(`${API_url}/fees/viewAll?page=${page}&limit=${limit}`);
  return res.data;
};

// View One Fees
export const ViewOneFees = async (id) => {
    const res = await axios.get(`${API_url}/fees/find/${id}`);
    return res.data;
};

// Update Fees
export const UpdateFees = async (id, data) => {
    const res = await axios.put(`${API_url}/fees/updatefees/${id}`, data);
    return res.data;
};

// Delete Fees
export const DeleteFees = async (id) => {
    const res = await axios.delete(`${API_url}/fees/delete/${id}`);
    return res.data;
};

// Get Receipt by Receipt Number
export const GetReceiptByNo = async (receiptNo) => {
    const res = await axios.get(`${API_url}/fees/receipt/${encodeURIComponent(receiptNo)}`);
    return res.data;
};

// Get Payment Receipt by Fee ID and Payment ID
export const GetPaymentReceipt = async (feeId, paymentId) => {
    const res = await axios.get(`${API_url}/fees/${feeId}/receipt/${paymentId}`);
    return res.data;
};
