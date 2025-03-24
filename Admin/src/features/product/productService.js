import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

const getProducts = async () => {
  const response = await axios.get(`${base_url}product/`);

  return response.data;
};
const createProduct = async (product) => {
  const response = await axios.post(`${base_url}product/`, product, config);

  return response.data;
};

const getProduct = async (id) => {
  const response = await axios.get(`${base_url}product/${id}`, config);

  return response.data;
};

const updateProduct = async (product) => {
  const response = await axios.put(
    `${base_url}product/${product.id}`,
    {
      title: product.productData.title,
      price: product.productData.price,
      brand: product.productData.brand,
      tax: product.productData.tax,
      finalPrice: product.productData.finalPrice,
      quantity: product.productData.quantity,
      category: product.productData.category,
      unit: product.productData.unit,
      subcategory: product.productData.subcategory,
      images: product.productData.images,
    },
    config
  );

  return response.data;
};

const deleteproduct = async (id) => {
  const response = await axios.delete(`${base_url}product/${id}`, config);

  return response.data;
};
const blockproduct = async (id) => {
  const response = await axios.put(`${base_url}product/block-product/${id}`, config);

  return response.data;
};
const unblockproduct = async (id) => {
  const response = await axios.put(`${base_url}product/unblock-product/${id}`, config);

  return response.data;
};

const productService = {
  getProducts,
  createProduct,
  deleteproduct,
  updateProduct,
  getProduct,
  blockproduct,
  unblockproduct
};

export default productService;
