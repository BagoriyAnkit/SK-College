import axios from "axios";
import { API_url } from "../../config/config";

/**
 * Fetch real-time dashboard statistics from MongoDB.
 */
export const GetDashboardStats = async () => {
  const res = await axios.get(`${API_url}/dashboard/stats`);
  return res.data;
};
