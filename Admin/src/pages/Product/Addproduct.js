import { React, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import "react-quill/dist/quill.snow.css";
import { Input, InputNumber, Select, Card, Button, Tooltip, Row, Col } from 'antd';
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
const { Option } = Select;
let schema = yup.object().shape({
  title: yup.string().required("Title is Required"),
  brand: yup.string().required("Brand is Required"),
  category: yup.string().required("Category is Required"),
  subcategory: yup.string().required("Subcategory is required"),
  unit: yup.string().required("Unit is Required"),
  variants: yup.array().of(
    yup.object().shape({
      variant: yup.string().required("Variant is required"),
      mrp: yup.number().required("MRP is required"),
      tax: yup.number().required("Tax is required"),
    })
  ).min(1, "At least one variant is required"),
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
  const [variantCount, setVariantCount] = useState(1);

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
    productBrand,
    productCategory,
    productSubcategory,
    productImages,
    productUnit,
    productVariants
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
      toast.success("Product Added Successfully!");
    }
    if (isSuccess && updatedProduct) {
      toast.success("Product Updated Successfully!");
      navigate("/admin/product");
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
    enableReinitialize: true,
    initialValues: {
      title: productName || "",
      brand: productBrand || "",
      category: productCategory || "",
      subcategory: productSubcategory || "",
      unit: productUnit || "",
      images: productImages || [],
       variants: productVariants?.length > 0 
      ? productVariants.map(v => ({
          variant: v.variant || "",
          mrp: v.mrp || "",
          tax: v.tax || "",
          price: v.price || "",
          taxprice: v.taxprice || "",
          cgst: v.cgst || "",
          cgstprice: v.cgstprice || "",
          sgst: v.sgst || "",
          sgstprice: v.sgstprice || ""
        }))
      : [{
          variant: "",
          mrp: "",
          price: "",
          tax: "",
          taxprice: "",
          cgst: "",
          cgstprice: "",
          sgst: "",
          sgstprice: ""
        }]
    },
    validationSchema: schema,
    onSubmit: (values) => {
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
    if (productCategory) {
      const relatedSubcategories = catState.find(
        (category) => category.title === productCategory
      )?.subcategories || [];
      setFilteredSubcategories(relatedSubcategories);
    }
  }, [productCategory, catState]);
  const calculateVariantPrices = (variants, variantIndex) => {
  const mrp = parseFloat(variants[variantIndex].mrp) || 0;
  const tax = parseFloat(variants[variantIndex].tax) || 0;

  // Calculate all values as numbers first
    const taxableAmount = (mrp * tax) / 100;
  const calculatedFinalPrice = mrp + taxableAmount;
  
  const cgst = tax / 2;
  const sgst = tax / 2;
  const cgstAmount = (mrp * cgst) / 100;
  const sgstAmount = (mrp * sgst) / 100;

  // Return the updated variant with all calculated fields
  return variants.map((v, i) => {
    if (i === variantIndex) {
      return {
        ...v,
        price: calculatedFinalPrice.toFixed(2),
        taxprice: taxableAmount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        cgstprice: cgstAmount.toFixed(2),
        sgstprice: sgstAmount.toFixed(2),
      };
    }
    return v;
  });
};


// Update the handleVariantChange function
const handleVariantChange = (variantIndex, field, value) => {
  let variants = [...formik.values.variants];
  variants[variantIndex] = {
    ...variants[variantIndex],
    [field]: value
  };

  // Recalculate prices before setting the field value
  if (field === 'mrp' || field === 'tax') {
    variants = calculateVariantPrices(variants, variantIndex);
  }

  formik.setFieldValue("variants", variants);
};

  const addVariant = () => {
    formik.setFieldValue("variants", [
      ...formik.values.variants,
      {
        variant: "",
        mrp: "",
        price: "",
        tax: "",
        taxprice: "",
        cgst: "",
        cgstprice: "",
        sgst: "",
        sgstprice: ""
      }
    ]);
    setVariantCount(variantCount + 1);
  };

  const removeVariant = (index) => {
    if (formik.values.variants.length > 1) {
      const variants = [...formik.values.variants];
      variants.splice(index, 1);
      formik.setFieldValue("variants", variants);
      setVariantCount(variantCount - 1);
    }
  };

  return (
    <>
      <h3 className="mb-4 title">
        {getProductId !== undefined ? "Edit" : "Add"} Product
      </h3>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <form onSubmit={formik.handleSubmit}>
                  <div className="row g-4">
                    {/* Product Title */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="title" className="form-label fw-medium">Product Title*</label>
                        <input
                          type="text"
                          id="title"
                          className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : formik.touched.title ? 'is-valid' : ''}`}
                          placeholder="Enter product title"
                          name="title"
                          onChange={formik.handleChange("title")}
                          onBlur={formik.handleBlur("title")}
                          value={formik.values.title}
                        />
                        {formik.touched.title && formik.errors.title && (
                          <div className="invalid-feedback">{formik.errors.title}</div>
                        )}
                      </div>
                    </div>

                    {/* Brand Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="brand" className="form-label fw-medium">Brand*</label>
                        <select
                          id="brand"
                          name="brand"
                          className={`form-control ${formik.touched.brand && formik.errors.brand ? 'is-invalid' : formik.touched.brand ? 'is-valid' : ''}`}
                          onChange={formik.handleChange("brand")}
                          onBlur={formik.handleBlur("brand")}
                          value={formik.values.brand}
                        >
                          <option value="">Select Brand</option>
                          {brandState.map(
                            (brand) => brand.status &&
                              (
                            <option key={brand} value={brand.title}>{brand.title}</option>
                          ))}
                        </select>
                        {formik.touched.brand && formik.errors.brand && (
                          <div className="invalid-feedback">{formik.errors.brand}</div>
                        )}
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="category" className="form-label fw-medium">Category*</label>
                        <select
                          id="category"
                          name="category"
                          className={`form-control ${formik.touched.category && formik.errors.category ? 'is-invalid' : formik.touched.category ? 'is-valid' : ''}`}                     
                          onChange={(e) => {
                            const selectedCategory = e.target.value;
                            formik.handleChange("category")(e);
                            const relatedSubcategories = catState.find(
                              category => category.title === selectedCategory
                            )?.subcategories || [];
                            setFilteredSubcategories(relatedSubcategories);
                            formik.setFieldValue("subcategory", "");
                          }}
                          onBlur={formik.handleBlur("category")}
                          value={formik.values.category}
                        >
                          <option value="">Select Category</option>
                          {catState.map((category, index) => category.status && (
                            <option key={index} value={category.title}>{category.title}</option>
                          ))}
                        </select>
                        {formik.touched.category && formik.errors.category && (
                          <div className="invalid-feedback">{formik.errors.category}</div>
                        )}
                      </div>
                    </div>

                    {/* Subcategory Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="subcategory" className="form-label fw-medium">Subcategory</label>
                        <select
                          id="subcategory"
                          name="subcategory"
                          className={`form-control ${formik.touched.subcategory && formik.errors.subcategory ? 'is-invalid' : formik.touched.subcategory ? 'is-valid' : ''}`}                     
                          onChange={formik.handleChange("subcategory")}
                          onBlur={formik.handleBlur("subcategory")}
                          value={formik.values.subcategory}
                          disabled={!formik.values.category}
                        >
                          <option value="">Select Subcategory</option>
                          {filteredSubcategories.map((subcategory, index) => subcategory.status && (
                            <option key={index} value={subcategory.title}>{subcategory.title}</option>
                          ))}
                        </select>
                        {formik.touched.subcategory && formik.errors.subcategory && (
                          <div className="invalid-feedback">{formik.errors.subcategory}</div>
                        )}
                      </div>
                    </div>

                    {/* Unit Selection */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="unit" className="form-label fw-medium">Unit*</label>
                        <select
                          id="unit"
                          name="unit"
                          className={`form-control ${formik.touched.unit && formik.errors.unit ? 'is-invalid' : formik.touched.unit ? 'is-valid' : ''}`}                     
                          onChange={formik.handleChange("unit")}
                          onBlur={formik.handleBlur("unit")}
                          value={formik.values.unit}
                        >
                          <option value="">Select Unit</option>
                          {unitState.map((i, j) => i.status &&(
                            <option key={j} value={i.title}>{i.title}</option>
                          ))}
                        </select>
                        {formik.touched.unit && formik.errors.unit && (
                          <div className="invalid-feedback">{formik.errors.unit}</div>
                        )}
                      </div>
                    </div>

                    {/* Variants Section */}
                 <div className="variant-section">
                    <h5 className="mb-3 text-lg font-semibold">Product Variants</h5>

                    {formik.values.variants.map((variant, index) => (
                      <Card key={index} size="small" className="mb-3">
                        <Row gutter={[16, 16]} align="middle">
                          <Col xs={24} sm={12} md={8} lg={4}>
                            <label className="form-label fw-medium">Variant*</label>
                            <Input
                              placeholder="e.g., 500g"
                              value={variant.variant}
                              onChange={(e) => handleVariantChange(index, 'variant', e.target.value)}
                              onBlur={formik.handleBlur(`variants[${index}].variant`)}
                              status={
                                formik.touched.variants?.[index]?.variant &&
                                formik.errors.variants?.[index]?.variant
                                  ? 'error'
                                  : ''
                              }
                            />
                          </Col>

                          <Col xs={24} sm={12} md={8} lg={4}>
                            <label className="form-label fw-medium">MRP*</label>
                            <InputNumber
                              prefix="₹"
                              style={{ width: '100%' }}
                              placeholder="MRP"
                              value={variant.mrp}
                              min={0}
                              step={0.01}
                              onChange={(value) => handleVariantChange(index, 'mrp', value)}
                              onBlur={formik.handleBlur(`variants[${index}].mrp`)}
                              status={
                                formik.touched.variants?.[index]?.mrp &&
                                formik.errors.variants?.[index]?.mrp
                                  ? 'error'
                                  : ''
                              }
                            />
                          </Col>

                          <Col xs={24} sm={12} md={8} lg={4}>
                            <label className="form-label fw-medium">Tax*</label>
                            <Select
                              placeholder="Select Tax"
                              value={variant.tax}
                              style={{ width: '100%' }}
                              onChange={(value) => handleVariantChange(index, 'tax', value)}
                              onBlur={formik.handleBlur(`variants[${index}].tax`)}
                              status={
                                formik.touched.variants?.[index]?.tax &&
                                formik.errors.variants?.[index]?.tax
                                  ? 'error'
                                  : ''
                              }
                            >
                              {taxState.map((i, j) => (
                              <option key={j} value={i.title}>
                                {i.title} ({i.value}%)
                              </option>
                            ))}
                            </Select>
                          </Col>

                          <Col xs={24} sm={12} md={8} lg={4}>
                            <label className="form-label fw-medium">Tax Amount</label>
                            <Input prefix="₹" disabled value={variant.taxprice} />
                          </Col>

                          <Col xs={24} sm={12} md={8} lg={4}>
                            <label className="form-label fw-medium">Price</label>
                            <Input prefix="₹" disabled value={variant.price} />
                          </Col>

                          <Col xs={24} sm={12} md={8} lg={4} className="flex gap-2 items-end">
                            {formik.values.variants.length > 1 && (
                              <Tooltip title="Remove Variant">
                                <Button
                                  danger
                                  type="text"
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeVariant(index)}
                                />
                              </Tooltip>
                            )}
                            {index === formik.values.variants.length - 1 && (
                              <Tooltip title="Add Variant">
                                <Button
                                  type="dashed"
                                  icon={<PlusCircleOutlined />}
                                  onClick={addVariant}
                                />
                              </Tooltip>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    {formik.touched.variants && formik.errors.variants && typeof formik.errors.variants === 'string' && (
                      <div className="text-red-500">{formik.errors.variants}</div>
                    )}
                  </div>

                    {/* Image Upload */}
                    <div className="col-md-6">     
                      <Dropzone 
                        onDrop={(acceptedFiles) => {
                          dispatch(uploadImg(acceptedFiles));
                          // Create previews for local files before upload completes
                          const previews = acceptedFiles.map(file => ({
                            url: URL.createObjectURL(file),
                            public_id: file.name, // temporary ID
                            isLocal: true // flag for local files
                          }));
                          // Dispatch or set state with these previews
                        }}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // Fixed: 5MB in bytes (was 5KB before)
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <div 
                            {...getRootProps()}
                            className={`dropzone-card ${isDragActive ? 'active' : ''}`}
                          >
                            <input {...getInputProps()} />
                            <label htmlFor="image" className="form-label fw-medium">Image*</label>
                            <div className="upload-container">
                              <FaCloudUploadAlt className="upload-icon" />
                              <p className="upload-text">Drag & Drop or Click to Upload</p>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                        
                        <div className="showimages d-flex flex-wrap gap-3">
                          {/* Show uploaded images from server */}
                          {imgshow?.map((image, index) => (
                            <div className="position-relative" key={`imgshow-${index}`}>
                              <button
                                type="button"
                                onClick={() => dispatch(delImg(image.public_id))}
                                className="btn-close position-absolute"
                                style={{ top: "10px", right: "10px" }}
                              ></button>
                              <img src={image.url} alt="" width={200} height={200} />
                            </div>
                          ))}
                          
                          {imgState?.map((image, index) => (
                            <div className="position-relative" key={`imgState-${index}`}>
                              <button
                                type="button"
                                onClick={() => dispatch(delImg(image.public_id))}
                                className="btn-close position-absolute"
                                style={{ top: "10px", right: "10px" }}
                              ></button>
                              <img src={image.url} alt="" width={200} height={200} />
                            </div>
                          ))}
                        </div>
                      </div>

                    {/* Submit Button */}
                    <div className="col-10 mt-8">
                      <button
                        className="btn btn-primary px-4 py-2"
                        type="submit"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            {getProductId !== undefined ? "Update" : "Save"} Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addproduct;