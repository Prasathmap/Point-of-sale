import { React, useEffect, useState } from "react";
import CustomInput from "../../components/CustomInput";
import { useLocation, useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getBrands } from "../../features/brand/brandSlice";
import { getTaxs } from "../../features/tax/taxSlice";
import { getUnits } from "../../features/unit/unitSlice";
import { getCategories } from "../../features/pcategory/pcategorySlice";
import Dropzone from "react-dropzone";
import { delImg, uploadImg } from "../../features/upload/uploadSlice";
import {
  createProducts,
  getAProduct,
  resetState,
  updateAProduct,
} from "../../features/product/productSlice";
let schema = yup.object().shape({
  title: yup.string().required("Title is Required"),
  price: yup.number().required("Price is Required"),
  brand: yup.string().required("Brand is Required"),
  category: yup.string().required("Category is Required"),
  subcategory: yup.string().required("Subcategory is required"),
  quantity: yup.number().required("Quantity is Required"),
  tax: yup.number().required("Tax is Required"),
  unit: yup.string().required("Unit is Required"),
  finalPrice: yup.number().required("finalPrice is Required"),
});

const Addproduct = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const getProductId = location.pathname.split("/")[3];
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    dispatch(getBrands());
    dispatch(getTaxs());
    dispatch(getCategories());
    dispatch(getUnits());
  }, []);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const brandState = useSelector((state) => state.brand.brands);
  const taxState = useSelector((state) => state.tax.taxs);
  const unitState = useSelector((state) => state.unit.units);
  const catState = useSelector((state) => state.pCategory.pCategories);
  const imgState = useSelector((state) => state?.upload?.images);
  const newProduct = useSelector((state) => state.product);
  const {
    isSuccess,
    isError,
    isLoading,
    createdProduct,
    updatedProduct,
    productName,
    productPrice,
    productBrand,
    productTax,
    productFinalPrice,
    productCategory,
    productSubcategory,
    productQuantity,
    productImages,
    productUnit
  } = newProduct;
 
  
  useEffect(() => {
    if (getProductId !== undefined) {
      dispatch(getAProduct(getProductId));
    } else {
      dispatch(resetState());
    }
  }, [getProductId]);
  useEffect(() => {
    if (isSuccess && createdProduct) {
      toast.success("Product Added Successfullly!");
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfullly!");
      navigate("/admin/list-product");
    }
    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading]);
  

  const img = [];
  imgState?.forEach((i) => {
    img.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  const imgshow = [];
  productImages?.forEach((i) => {
    imgshow.push({
      public_id: i.public_id,
      url: i.url,
    });
  });

  useEffect(() => {
    formik.values.images = img;
  }, [img]);
  
 

  const formik = useFormik({
    initialValues: {
      title: productName || "",
      price: productPrice || "",
      brand: productBrand || "",
      tax: productTax || "",
      category: productCategory || "",
      subcategory: productSubcategory || "",
      quantity: productQuantity || "",
      unit: productUnit || "",
      finalPrice: "",
      images: productImages || "",
      
    },
    validationSchema: schema,
    onSubmit: (values) => {
      console.log(values);
      if (getProductId !== undefined) {
        const data = { id: getProductId, productData: values };
        dispatch(updateAProduct(data));
      } else {
        dispatch(createProducts(values));
        formik.resetForm();
        setTimeout(() => {
          dispatch(resetState());
        }, 3000);
      }
    },
  });
  
  useEffect(() => {
    const price = parseFloat(formik.values.price) || 0;
    const tax = parseFloat(formik.values.tax) || 0;
    const calculatedFinalPrice = (price + (price * tax) / 100).toFixed(2);

    formik.setFieldValue("finalPrice", calculatedFinalPrice);
  }, [formik.values.price, formik.values.tax]);

  return (
    <div>
      <h3 className="mb-4 title">
        {getProductId !== undefined ? "Edit" : "Add"} Product
      </h3>
      <div>
        <form
          onSubmit={formik.handleSubmit}
          className="d-flex gap-3 flex-column"
        >
          <CustomInput
            type="text"
            label="Enter Product Title"
            name="title"
            onChng={formik.handleChange("title")}
            onBlr={formik.handleBlur("title")}
            val={formik.values.title}
          />
          <div className="error">
            {formik.touched.title && formik.errors.title}
          </div>
          <CustomInput
              type="number"
              label="Enter Product Price"
              name="price"
              onChng={formik.handleChange("price")}
              onBlr={formik.handleBlur("price")}
              val={formik.values.price}
            />
            <div className="error">
              {formik.touched.price && formik.errors.price}
            </div>
          <select
            name="brand"
            onChange={formik.handleChange("brand")}
            onBlr={formik.handleBlur("brand")}
            val={formik.values.brand}
            className="form-control py-3 mb-3"
            id=""
          >
            <option value="">Select Brand</option>
            {brandState.map((i, j) => {
              return (
                <option key={j} value={i.title}>
                  {i.title}
                </option>
              );
            })}
          </select>
          <div className="error">
            {formik.touched.brand && formik.errors.brand}
          </div>
          <select
              name="category"
              onChange={(e) => {
                const selectedCategory = e.target.value;
                formik.handleChange("category")(e); // Update Formik's category value
                const relatedSubcategories = catState.find(
                  (category) => category.title === selectedCategory
                )?.subcategories || [];
                setFilteredSubcategories(relatedSubcategories); // Dynamically set subcategories
                formik.setFieldValue("subcategory", ""); // Reset subcategory value
              }}
              onBlr={formik.handleBlur("category")}
              val={formik.values.category}
              className="form-control py-3 mb-3"
              id=""
            >
              <option value="">Select Category</option>
              {catState.map((category, index) => (
                <option key={index} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
            <div className="error">
              {formik.touched.category && formik.errors.category}
            </div>

            {/* Subcategory Dropdown */}
            <select
              name="subcategory"
              onChange={formik.handleChange("subcategory")}
              onBlr={formik.handleBlur("subcategory")}
              val={formik.values.subcategory}
              className="form-control py-3 mb-3"
              id=""
            >
              <option value="">Select Subcategory</option>
              {filteredSubcategories.map((subcategory, index) => (
                <option key={index} value={subcategory.title}>
                  {subcategory.title}
                </option>
              ))}
            </select>
            <div className="error">
              {formik.touched.subcategory && formik.errors.subcategory}
            </div>

            <select
                name="tax"
                onChange={formik.handleChange("tax")}
                onBlur={formik.handleBlur("tax")}
                value={formik.values.tax} // Ensure this matches with the tax titles in taxState
                className="form-control py-3 mb-3"
              >
                <option value="">Select Tax</option>
                {taxState.map((i, j) => (
                  <option key={j} value={i.title}>
                    {i.title} ({i.value}%)
                  </option>
                ))}
              </select>
              <div className="error">
                {formik.touched.tax && formik.errors.tax}
              </div>

              <div className="mt-3">
                <strong>Final Price:</strong> 
                <CustomInput
                    type="number"
                    label="Enter Product finalPrice"
                    name="finalPrice"
                    disabled
                    onChng={formik.handleChange("finalPrice")}
                    onBlr={formik.handleBlur("finalPrice")}
                    val={formik.values.finalPrice}
                  />
                  <div className="error">
                    {formik.touched.finalPrice && formik.errors.finalPrice}
                  </div>
              </div>
              <select
                name="unit"
                onChange={formik.handleChange("unit")}
                onBlr={formik.handleBlur("unit")}
                val={formik.values.unit}
                className="form-control py-3 mb-3"
                id=""
              >
                <option value="">Select Unit</option>
                {unitState.map((i, j) => {
                  return (
                    <option key={j} value={i.title}>
                      {i.title}
                    </option>
                  );
                })}
              </select>
              <div className="error">
                {formik.touched.unit && formik.errors.unit}
              </div>


          <CustomInput
            type="number"
            label="Enter Product Quantity"
            name="quantity"
            onChng={formik.handleChange("quantity")}
            onBlr={formik.handleBlur("quantity")}
            val={formik.values.quantity}
          />
          <div className="error">
            {formik.touched.quantity && formik.errors.quantity}
          </div>
          <div className="bg-white border-1 p-5 text-center">
            <Dropzone
              onDrop={(acceptedFiles) => dispatch(uploadImg(acceptedFiles))}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
          <div className="showimages d-flex flex-wrap gap-3">
            {imgshow?.map((i, j) => {
              return (
                <div className=" position-relative" key={j}>
                  <button
                    type="button"
                    onClick={() => dispatch(delImg(i.public_id))}
                    className="btn-close position-absolute"
                    style={{ top: "10px", right: "10px" }}
                  ></button>
                  <img src={i.url} alt="" width={200} height={200} />
                </div>
              );
            })}
            {imgState?.map((i, j) => {
              return (
                <div className=" position-relative" key={j}>
                  <button
                    type="button"
                    onClick={() => dispatch(delImg(i.public_id))}
                    className="btn-close position-absolute"
                    style={{ top: "10px", right: "10px" }}
                  ></button>
                  <img src={i.url} alt="" width={200} height={200} />
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-success border-0 rounded-3 my-5"
            type="submit"
          >
            {getProductId !== undefined ? "Edit" : "Add"} Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addproduct;
