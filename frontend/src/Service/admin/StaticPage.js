import axios from "axios";
import { API_url } from "../../config/config";

export const AddStaticPage = async (data) => {

    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("slug", data.slug);
    formData.append("image", data.image);


    const res = await axios.post(`${API_url}/staticpage/add`, formData);
    return res;
};

export const ViewAllStaticPage = async () => {
    const res = await axios.get(`${API_url}/staticpage/viewAll`);
    return res.data.data;
};

export const ViewStaticPage = async (id) => {
    const res = await axios.get(`${API_url}/staticpage/find/${id}`);
    return res.data;
};

export const UpdateStaticPage = async (id, data) => {
    const res = await axios.put(`${API_url}/staticpage/update/${id}`, data);
    return res.data;
};

export const DeleteStaticPage = async (id) => {
    const res = await axios.delete(`${API_url}/staticpage/delete/${id}`);
    return res
};