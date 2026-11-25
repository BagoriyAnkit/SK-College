import axios from "axios";
import { API_url } from "../../config/config";


export const AddMemories = async (data) => {
    try {

        const res = await axios.post(
            `${API_url}/memories/add`,
            data
        );

        return res;

    } catch (error) {
        throw error;
    }
};


export const ViewAllMemories = async () => {
    try {

        const res = await axios.get(
            `${API_url}/memories/viewall`
        );

        return res.data;

    } catch (error) {
        throw error;
    }
};


export const ViewOneMemories = async (id) => {
    try {

        const res = await axios.get(
            `${API_url}/memories/find/${id}`
        );

        return res;

    } catch (error) {
        throw error;
    }
};


export const UpdateMemories = async (id, data) => {
    try {

        const res = await axios.put(
            `${API_url}/memories/update/${id}`,
            data
        );

        return res;

    } catch (error) {
        throw error;
    }
};


export const DeleteMemories = async (id) => {
    try {

        const res = await axios.delete(
            `${API_url}/memories/delete/${id}`
        );

        return res;

    } catch (error) {
        throw error;
    }
};