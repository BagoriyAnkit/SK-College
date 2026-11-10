import axios from "axios";
import { API_url } from "../../config/config";


export const ViewAllMemories = async () => {
    try {

        const res = await axios.get(`${API_url}/frontend/memories/viewall`);

        return res;

    } catch (error) {
        console.log(error);
    }
};