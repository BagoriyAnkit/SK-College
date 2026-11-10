import axios from "axios";
import { API_url } from "../../config/config";


export const ViewAllContact = async () => {
    const res = await axios.get(`${API_url}/contact/viewAll`);
    return res.data.data;
};


export const DeleteContact = async (id) => {
    const res = await axios.delete(`${API_url}/contact/delete/${id}`);
    return res
};