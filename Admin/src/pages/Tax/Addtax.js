import { React, useEffect } from "react";
import CustomInput from "../../components/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createTax,
  getATax,
  resetState,
  updateATax,
} from "../../features/tax/taxSlice";

let schema = yup.object().shape({
  title: yup.string().required("Tax Name is Required"),
});
const Addtax = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getTaxId = location.pathname.split("/")[3];
  const newTax = useSelector((state) => state.tax);
  const {
    isSuccess,
    isError,
    isLoading,
    createdTax,
    taxName,
    updatedTax,
  } = newTax;
  useEffect(() => {
    if (getTaxId !== undefined) {
      dispatch(getATax(getTaxId));
    } else {
      dispatch(resetState());
    }
  }, [getTaxId]);

  useEffect(() => {
    if (isSuccess && createdTax) {
      toast.success("Tax Added Successfullly!");
    }
    if (isSuccess && updatedTax) {
      toast.success("Tax Updated Successfullly!");
      navigate("/admin/list-tax");
    }

    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: taxName || "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (getTaxId !== undefined) {
        const data = { id: getTaxId, taxData: values };
        dispatch(updateATax(data));
        dispatch(resetState());
      } else {
        dispatch(createTax(values));
        formik.resetForm();
        setTimeout(() => {
          dispatch(resetState());
        }, 300);
      }
    },
  });

  return (
    <div>
      <h3 className="mb-4 title">
        {getTaxId !== undefined ? "Edit" : "Add"} Tax
      </h3>
      <div>
        <form action="" onSubmit={formik.handleSubmit}>
          <CustomInput
            type="text"
            name="title"
            onChng={formik.handleChange("title")}
            onBlr={formik.handleBlur("title")}
            val={formik.values.title}
            label="Enter Tax"
            id="tax"
          />
          <div className="error">
            {formik.touched.title && formik.errors.title}
          </div>
          <button
            className="btn btn-success border-0 rounded-3 my-5"
            type="submit"
          >
            {getTaxId !== undefined ? "Edit" : "Add"} Tax
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addtax;
