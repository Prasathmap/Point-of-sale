import axios from "axios";
import { base_url } from "../../utils/baseUrl";

const getUsers = async () => {
  const response = await axios.get(`${base_url}invoices/get-all`);

  return response.data;
};

const customerService = {
  getUsers,
};

export default customerService;
