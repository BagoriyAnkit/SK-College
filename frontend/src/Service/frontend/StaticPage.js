import axios from "axios";
import { API_url } from "../../config/config";


// View All Static Pages
export const StaticPageList = async () => {

    const res = await axios.get(
        `${API_url}/frontend/static/viewall`
    );

    return res.data.data;

};



// Find Static Page By Slug
export const ViewStaticPageBySlug = async (slug) => {

    const res = await axios.get(
        `${API_url}/frontend/static/find/${slug}`
    );

    return res.data.data;

};