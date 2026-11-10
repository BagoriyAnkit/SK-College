import axios from "axios";
import { API_url } from "../../config/config";


// View All Department
export const ViewAllDepartment = async () => {
    const res = await axios.get(`${API_url}/frontend/department/list`);
    return res.data;
};


// View One Department
export const ViewOneDepartment = async (id) => {
    const res = await axios.get(`${API_url}/frontend/department/details/${id}`);
    return res.data;
};