import axios from "axios"
import { API_url } from "../../config/config";

export const AddEvent = async (data) => {
    const res = await axios.post(`${API_url}/event/add`, data)
    return res
}

export const ViewAllEvent = async () => {
    const res = await axios.get(`${API_url}/event/viewall`);
    return res.data.data;   // ya return res;
}

export const ViewEvent = async (id) => {
    const res = await axios.get(`${API_url}/event/view/${id}`);
    return res.data;
};

export const UpdateEvent = async (id, data) => {
    const res = await axios.put(`${API_url}/event/update/${id}`, data);
    return res.data;
};

export const DeleteEvent = async (id) => {
    const res = await axios.delete(`${API_url}/event/delete/${id}`);
    return res.data;
};

export const StatusUpdate = async (id) => {
    const res = await axios.put(`${API_url}/event/updateStatus/${id}`);
    return res;
};