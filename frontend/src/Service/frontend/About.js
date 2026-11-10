import axios from "axios";
import { API_url } from "../../config/config";


export const ViewAbout = async () => {

    const res = await axios.get(
        `${API_url}/frontend/about/view`
    );

    return res;

};