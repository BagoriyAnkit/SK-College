import axios from "axios";
import { API_url } from "../../config/config";

export const ViewAllPlacement = async () => {
    const res = await axios.get(`${API_url}/frontend/placement/list`);
    return res.data;
};

export const FindOnePlacement = async (id) => {
    const res = await axios.get(`${API_url}/frontend/placement/details/${id}`);
    return res.data;
};