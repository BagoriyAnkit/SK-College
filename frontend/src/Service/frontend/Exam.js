import axios from "axios";
import { API_url } from "../../config/config";


// View All Exam
export const ViewAllExam = async () => {

    const res = await axios.get(
        `${API_url}/frontend/exam/viewall`
    );

    return res.data;
};


// View One Exam
export const ViewOneExam = async (id) => {

    const res = await axios.get(
        `${API_url}/frontend/exam/find/${id}`
    );

    return res.data;
};