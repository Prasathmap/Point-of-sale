import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";

const getProductCategories = async () => {
  const response = await axios.get(`${base_url}category/` ,config);

  return response.data;
};
const createCategory = async (category) => {
  const response = await axios.post(`${base_url}category/`, category, config);

  return response.data;
};

const getProductCategory = async (id) => {
  const response = await axios.get(`${base_url}category/${id}`, config);

  return response.data;
};

const deleteProductCategory = async (id) => {
  const response = await axios.delete(`${base_url}category/${id}`, config);

  return response.data;
};
const updateProductCategory = async (category) => {
  const response = await axios.put(
    `${base_url}category/${category.id}`,
    {
      title: category.pCatData.title,
      subcategories: category.pCatData.subcategories, 
    },
    config 
  );
  return response.data; // Return API response
};
const getstatus = async (category) => {
  const response = await axios.put(`${base_url}category/status/${category.id}`,{}, config); 
  return response.data;
};
export const SubcategoryStatus = async (categoryId, subcategoryIndex) => {
  const response = await axios.put(`${base_url}category/sub-status/${categoryId}/${subcategoryIndex}`,{},config);
  return response.data;
};

const pCategoryService = {
  getProductCategories,
  createCategory,
  getProductCategory,
  deleteProductCategory,
  updateProductCategory,
  getstatus,
  SubcategoryStatus,
};

export default pCategoryService;
