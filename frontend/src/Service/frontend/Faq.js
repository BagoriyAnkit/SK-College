import axios from "axios";
import { API_url } from "../../config/config";

export const ViewAllFaq = async () => {
    const res = await axios.get(`${API_url}/frontend/faq/list`);
    return res.data;
};

export const ViewFaqById = async (id) => {
    const res = await axios.get(`${API_url}/frontend/faq/details/${id}`);
    return res.data;
};