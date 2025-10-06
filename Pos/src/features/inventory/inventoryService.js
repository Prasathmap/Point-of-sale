import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

// Get all inventories
const getInventories = async () => {
  const response = await axios.get(`${base_url}inventory`, config);
  return response.data;
};

// Get inventory by ID
const getInventory = async (id) => {
  const response = await axios.get(`${base_url}inventory/${id}`, config);
  return response.data;
};


export const updatestock = async (updates) => {
  const response = await axios.put(`${base_url}goods/handin`, updates, config);
  return response.data;
};

// Approve inventory
const approveInventory = async (data) => {
  const response = await axios.put(
    `${base_url}inventory/approval/${data.id}`,
   {
      status: data.status,
      Receivernote: data.Receivernote,
    },
    config
  );
  return response.data;
};

const getAllGoods = async () => {
  const response = await axios.get(`${base_url}goods`, config);
  return response.data;
};

const inventoryService = {
  getInventories,
  getInventory,
  approveInventory,
  getAllGoods,
  updatestock,
};

export default inventoryService;
