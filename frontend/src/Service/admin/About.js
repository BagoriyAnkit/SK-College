import axios from "axios";
import { API_url } from "../../config/config";

export const AddAbout = async (formData) => {
  return await axios.post(`${API_url}/about/add`, formData);
};

export const ViewAbout = async () => {
  return await axios.get(`${API_url}/about/view`);
};

export const UpdateAbout = async (id, formData) => {
  return await axios.put(`${API_url}/about/update/${id}`, formData);
};