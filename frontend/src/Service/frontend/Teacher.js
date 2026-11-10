import axios from "axios";
import { API_url } from "../../config/config";

export const ViewAllFaculty = async () => {
  const res = await axios.get(`${API_url}/frontend/faculty/list`);
  return res.data;
};

export const ViewFacultyById = async (id) => {
  const res = await axios.get(`${API_url}/frontend/faculty/details/${id}`);
  return res.data;
};