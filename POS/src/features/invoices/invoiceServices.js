import axios from "axios";
import { base_url } from "../../utils/baseUrl";

const CreateSale= async (invoiceData) => {
  const response = await axios.post(`${base_url}invoices/`, invoiceData);
  return response.data;
};

const Billno= async () => {
  const response = await axios.get(`${base_url}invoices/bill-no`);
  return response.data.invoiceno;
};
  
const getOrders = async (data) => {
  const response = await axios.get(`${base_url}invoices/get-all`, data);
  return response.data;
};

const getTodayStats = async (data) => {
    const response = await axios.get(`${base_url}invoices/getTodayorders`,data);
    return response.data;
  };
  
  
const invoiceService = {
    CreateSale,
    Billno,
    getOrders,
    getTodayStats,
   };
  export default invoiceService;
  