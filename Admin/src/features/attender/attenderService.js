import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getAttenders = async () => {
  const response = await axios.get(`${base_url}attender/`);

  return response.data;
};

const createAttender = async (attender) => {
  const response = await axios.post(`${base_url}attender/`, attender, config);

  return response.data;
};
const updateAttender = async (attender) => {
  const response = await axios.put(
    `${base_url}attender/${attender.id}`,
    { title: attender.attenderData.title,
      empcode: attender.attenderData.empcode,
      phone: attender.attenderData.phone,
     },
    config
  );

  return response.data;
};
const getAttender = async (id) => {
  const response = await axios.get(`${base_url}attender/${id}`, config);

  return response.data;
};

const deleteAttender = async (id) => {
  const response = await axios.delete(`${base_url}attender/${id}`, config);

  return response.data;
};

const attenderService = {
  getAttenders,
  createAttender,
  getAttender,
  updateAttender,
  deleteAttender,
};

export default attenderService;
