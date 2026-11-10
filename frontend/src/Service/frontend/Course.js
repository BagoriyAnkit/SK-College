import axios from "axios";
import { API_url } from "../../config/config";

export const ViewAllCourse = async () => {
  const res = await axios.get(`${API_url}/frontend/course/list`);
  return res.data;
};

export const FindOneCourse = async (id) => {
  const res = await axios.get(`${API_url}/frontend/course/details/${id}`);
  return res.data;
};