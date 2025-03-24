import { React, useEffect } from "react";
import CustomInput from "../../components/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createAttender,
  getAAttender,
  resetState,
  updateAAttender,
} from "../../features/attender/attenderSlice";

let schema = yup.object().shape({
  title: yup.string().required("Attender Name is Required"),
  empcode: yup.string().required("Attender code is Required"),
  phone: yup.string().required("Attender Phone is Required"),

});
const Addattender = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getAttenderId = location.pathname.split("/")[3];
  const newAttender = useSelector((state) => state.attender);
  const {
    isSuccess,
    isError,
    isLoading,
    createdAttender,
    attenderName,
    empcode,
    phone,
    updatedAttender,
  } = newAttender;
  useEffect(() => {
    if (getAttenderId !== undefined) {
      dispatch(getAAttender(getAttenderId));
    } else {
      dispatch(resetState());
    }
  }, [getAttenderId]);

  useEffect(() => {
    if (isSuccess && createdAttender) {
      toast.success("Attender Added Successfullly!");
    }
    if (isSuccess && updatedAttender) {
      toast.success("Attender Updated Successfullly!");
      navigate("/admin/list-attender");
    }

    if (isError) {
      toast.error("Something Went Wrong!");
    }
  }, [isSuccess, isError, isLoading]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: attenderName || "",
      empcode: empcode || "",
      phone: phone ||"",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (getAttenderId !== undefined) {
        const data = { id: getAttenderId, attenderData: values };
        dispatch(updateAAttender(data));
        dispatch(resetState());
      } else {
        dispatch(createAttender(values));
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
        {getAttenderId !== undefined ? "Edit" : "Add"} Attender
      </h3>
      <div>
        <form action="" onSubmit={formik.handleSubmit}>
          <CustomInput
            type="text"
            name="title"
            onChng={formik.handleChange("title")}
            onBlr={formik.handleBlur("title")}
            val={formik.values.title}
            label="Enter Attender"
            id="Attender"
          />
          <div className="error">
            {formik.touched.title && formik.errors.title}
          </div>
          <CustomInput
            type="text"
            name="empcode"
            onChng={formik.handleChange("empcode")}
            onBlr={formik.handleBlur("empcode")}
            val={formik.values.empcode}
            label="Enter Attender code"
            id="empcode"
          />
          <div className="error">
            {formik.touched.empcode && formik.errors.empcode}
          </div>
          <CustomInput
            type="text"
            name="phone"
            onChng={formik.handleChange("phone")}
            onBlr={formik.handleBlur("phone")}
            val={formik.values.phone}
            label="Enter Phone Number"
            id="phone"
          />
          <div className="error">
            {formik.touched.phone && formik.errors.phone}
          </div>
          <button
            className="btn btn-success border-0 rounded-3 my-5"
            type="submit"
          >
            {getAttenderId !== undefined ? "Edit" : "Add"} Attender
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addattender;
