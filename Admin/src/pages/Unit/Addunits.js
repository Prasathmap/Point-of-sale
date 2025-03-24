import { React, useEffect } from "react";
import CustomInput from "../../components/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createUnit,
  getAUnit,
  resetState,
  updateAUnit,
} from "../../features/unit/unitSlice";

let schema = yup.object().shape({
  title: yup.string().required("Unit Name is Required"),
});
const Addunit = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getUnitId = location.pathname.split("/")[3];
  const newUnit = useSelector((state) => state.unit);
  const {
    isSuccess,
    isError,
    isLoading,
    createdUnit,
    unitName,
    updatedUnit,
  } = newUnit;
  useEffect(() => {
    if (getUnitId !== undefined) {
      dispatch(getAUnit(getUnitId));
    } else {
      dispatch(resetState());
    }
  }, [getUnitId]);

  useEffect(() => {
    if (isSuccess && createdUnit) {
      toast.success("Unit Added Successfullly!");
    }
    if (isSuccess && updatedUnit) {
      toast.success("Unit Updated Successfullly!");
      navigate("/admin/list-unit");
    }

    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: unitName || "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (getUnitId !== undefined) {
        const data = { id: getUnitId, unitData: values };
        dispatch(updateAUnit(data));
        dispatch(resetState());
      } else {
        dispatch(createUnit(values));
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
        {getUnitId !== undefined ? "Edit" : "Add"} Unit
      </h3>
      <div>
        <form action="" onSubmit={formik.handleSubmit}>
          <CustomInput
            type="text"
            name="title"
            onChng={formik.handleChange("title")}
            onBlr={formik.handleBlur("title")}
            val={formik.values.title}
            label="Enter Unit"
            id="unit"
          />
          <div className="error">
            {formik.touched.title && formik.errors.title}
          </div>
          <button
            className="btn btn-success border-0 rounded-3 my-5"
            type="submit"
          >
            {getUnitId !== undefined ? "Edit" : "Add"} Unit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addunit;
