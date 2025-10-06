import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

// Get all inventory entries
const getInventories = async () => {
  const response = await axios.get(`${base_url}inventory`, config);
  return response.data;
};
const Billno= async () => {
  const response = await axios.get(`${base_url}inventory/Grn-no`,config);
  return response.data.GrnNo;
};
// Get a single inventory entry by ID
const getInventory = async (id) => {
  const response = await axios.get(`${base_url}inventory/${id}`, config);
  return response.data;
};

// Create a new inventory entry
const createInventory = async (inventoryData) => {
  const response = await axios.post(`${base_url}inventory`, inventoryData, config);
  return response.data;
};

// Delete an inventory entry by ID
const deleteInventory = async (id) => {
  const response = await axios.delete(`${base_url}inventory/${id}`, config);
  return response.data;
};

const inventoryService = {
  Billno,
  getInventories,
  getInventory,
  createInventory,
  deleteInventory,
};

export default inventoryService;
