import axios from "axios";
import { API_url } from "../../config/config";


export const AddContact = async (data) => {
    const res = await axios.post(`${API_url}/frontend/contact/add`, data);
    return res;
};