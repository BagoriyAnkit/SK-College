import axios from "axios";
import { API_url } from "../../config/config";

// View All Notice
export const ViewAllNotice = async () => {
    const res = await axios.get(`${API_url}/frontend/notice/list`);
    return res.data;
};

// View Notice By Id
export const ViewNoticeById = async (id) => {
    const res = await axios.get(`${API_url}/frontend/notice/details/${id}`);
    return res.data;
};