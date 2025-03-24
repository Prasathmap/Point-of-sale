import React, { useEffect, useState } from "react";
import CustomInput from "../../components/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createCategory,
  getAProductCategory,
  resetState,
  updateAProductCategory,
} from "../../features/pcategory/pcategorySlice";

// Validation schema
let schema = yup.object().shape({
  title: yup.string().required("Category Name is Required"),
  subcategories: yup
    .array()
    .of(yup.string().required("Subcategory Name is Required"))
    .min(1, "At least one subcategory is required"),
});

const Addcat = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getPCatId = location.pathname.split("/")[3]; 

  // Redux state
  const newCategory = useSelector((state) => state.pCategory);
  const {
    isSuccess,
    isError,
    categoryName,
    subcategory = [],
    createdCategory,
    updatedCategory,
  } = newCategory;

  // Subcategory input state
  const [subcategoryInput, setSubcategoryInput] = useState("");

  useEffect(() => {
    if (getPCatId !== undefined) {
      dispatch(getAProductCategory(getPCatId));
    } else {
      dispatch(resetState());
    }
  }, [getPCatId]);
  
  // Handle notifications and reset form
  useEffect(() => {
    if (isSuccess && createdCategory) {
      toast.success("Category Added Successfully!");
      formik.resetForm();
    }
    if (isSuccess && updatedCategory) {
      toast.success("Category Updated Successfully!");
      formik.resetForm();
      navigate("/admin/list-category");
    }
    if (isError) {
      toast.error("Something went wrong!");
    }
  }, [isSuccess, isError, createdCategory, updatedCategory, navigate]);

  // Initialize Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: categoryName || "",
      subcategories: subcategory.map((sub) => sub.title), // Extract titles
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (getPCatId !== undefined) {
        const data = { id: getPCatId, pCatData: values };
        dispatch(updateAProductCategory(data));
        dispatch(resetState());
      } else {
        dispatch(createCategory(values));
        formik.resetForm();
        setTimeout(() => {
          dispatch(resetState());
        }, 300);
      }
    },
  });
  
  // Add or update subcategory
  const handleAddOrUpdateSubcategory = () => {
    const trimmedSubcategory = subcategoryInput.trim();
  
    if (!trimmedSubcategory) {
      toast.error("Subcategory cannot be empty!");
      return;
    }
  
    // Ensure only strings are added
    if (formik.values.subcategories.some((sub) => sub === trimmedSubcategory)) {
      toast.error("Subcategory already exists!");
    } else {
      formik.setFieldValue("subcategories", [
        ...formik.values.subcategories,
        trimmedSubcategory,
      ]);
      toast.success("Subcategory added successfully!");
    }
  
    setSubcategoryInput(""); // Clear input
  };
  
  // Remove subcategory
  const handleRemoveSubcategory = (index) => {
    const updatedSubcategories = [...formik.values.subcategories];
    updatedSubcategories.splice(index, 1);
    formik.setFieldValue("subcategories", updatedSubcategories);
  };

  return (
    <div>
      <h3 className="mb-4 title">
        {getPCatId ? "Edit" : "Add"} Category
      </h3>
      <form onSubmit={formik.handleSubmit}>
        <CustomInput
          type="text"
          label="Enter Product Category"
          onChng={formik.handleChange("title")}
          onBlr={formik.handleBlur("title")}
          val={formik.values.title}
          id="category"
        />
        <div className="error">
          {formik.touched.title && formik.errors.title}
        </div>

        <div className="mb-4">
          <div className="input-group">
            <CustomInput
              label="Enter Product Sub Category"
              type="text"
              className="form-control"
              val={subcategoryInput}
              onBlr={formik.handleBlur("subcategories")}
              onChng={(e) => setSubcategoryInput(e.target.value)}
              id="subcategory"
            />
            <Button
              type="button"
              className="btn btn-success d-flex align-items-center"
              onClick={handleAddOrUpdateSubcategory}
            >
              <PlusCircleOutlined style={{ marginRight: "6px" }} />
              Add
            </Button>
          </div>
        </div>

        <ul className="list-group">
  {formik.values.subcategories.length === 0 ? (
    <li className="list-group-item text-muted text-center">
      No subcategories added yet.
    </li>
  ) : (
    formik.values.subcategories.map((subcategory, index) => (
      <li
        key={index}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>{subcategory.title || subcategory}</span> {/* Render title or string */}
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => handleRemoveSubcategory(index)}
        >
          Remove
        </button>
      </li>
    ))
  )}
</ul>


        <button
          className="btn btn-success border-0 rounded-3 my-5"
          type="submit"
        >
          {getPCatId ? "Edit" : "Add"} Category
        </button>
      </form>
    </div>
  );
};

export default Addcat;
