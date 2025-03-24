import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

// Register User
const register = async (userData) => {
  const response = await axios.post(`${base_url}auth/register`, userData);
  if (response.data) {
    return response.data;
  }
};
// Send OTP
const sendOtp = async (email) => {
  const response = await axios.post(`${base_url}auth/send-otp`, { email });
  return response.data;
};

//Verify OTP
const verifyOtp = async (email,emailOtp) => {
  const response = await axios.post(`${base_url}auth/verify-otp`, { email, emailOtp });
  return response.data;
};

//login
const login = async (user) => {
  const response = await axios.post(`${base_url}auth/admin-login`, user);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const updateUser = async (data) => {
  const response = await axios.put(`${base_url}auth/edit-user`, data.data, data.config2, config );
  if (response.data) {
    return response.data;
  }
};

const getOrders = async (data) => {
  const response = await axios.get(`${base_url}invoices/get-all`, data);
  return response.data;
};

const getOrder = async (id) => {
  const response = await axios.get(`${base_url}invoices/get-all/${id}`,config);
  return response.data;
};

const updateOrder = async (data) => {
  const response = await axios.put(
    `${base_url}user/updateOrder/${data.id}`,
    { status: data.status },
    config
  );

  return response.data;
};

const getMonthlyOrders = async (data) => {
  const response = await axios.get(
    `${base_url}invoices/getMonthWiseOrderIncome`,
    data
  );

  return response.data;
};

const getYearlyStats = async (data) => {
  const response = await axios.get(
    `${base_url}invoices/getyearlyorders`,

    data
  );

  return response.data;
};
const getTodayStats = async (data) => {
  const response = await axios.get(
    `${base_url}invoices/gettodayorders`,
   
    data
  );

  return response.data;
};
const authService = {
  register,
  sendOtp,
  verifyOtp,
  login,
  getOrders,
  getOrder,
  getMonthlyOrders,
  getYearlyStats,
  updateOrder,
  getTodayStats,
  updateUser,
};

export default authService;
