import axios from "axios";
import { API_url } from "../../config/config";

export const Register = async (data) => {
    return await axios.post(`${API_url}/frontend/auth/register`, data);
};

export const ApplyAdmissionApi = async (data) => {
    return await axios.post(`${API_url}/frontend/admission/apply`, data);
};

export const LoginApi = async (data) => {
    const res = await axios.post(`${API_url}/login`, data);
    return res;
};

export const ForgotPasswordApi = async (data) => {
    return await axios.post(`${API_url}/frontend/auth/forgot-password`, data);
};

export const VerifyResetTokenApi = async (token) => {
    return await axios.get(`${API_url}/frontend/auth/verify-reset-token/${token}`);
};

export const ResetPasswordApi = async (token, data) => {
    return await axios.post(`${API_url}/frontend/auth/reset-password/${token}`, data);
};
