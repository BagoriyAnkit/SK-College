import axios from "axios";
import { API_url } from "../../config/config";

// View All Batch
export const ViewAllBatch = async () => {
    const res = await axios.get(`${API_url}/frontend/batch/viewall`);
    return res.data;
};

// View One Batch
export const ViewOneBatch = async (id) => {
    const res = await axios.get(`${API_url}/frontend/batch/find/${id}`);
    return res.data;
};