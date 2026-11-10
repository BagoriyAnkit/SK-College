import axios from "axios";
import { API_url } from "../../config/config";

// View All Events
export const ViewAllEvent = async () => {
    const res = await axios.get(`${API_url}/frontend/event/list`);
    return res.data.data;
};

// View Event By Id
export const ViewEvent = async (id) => {
    const res = await axios.get(`${API_url}/frontend/event/details/${id}`);
    return res.data;
};