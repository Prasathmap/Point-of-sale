import React, { useEffect } from "react";
import CustomInput from "../../components/CustomInput";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";

let schema = yup.object().shape({
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  empcode: yup.string().required("Employee code is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      phone: "",
      empcode: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });
  const authState = useSelector((state) => state);

  const { user, isError, isSuccess, isLoading, message } = authState.auth;

  useEffect(() => {
    if (isSuccess) {
      window.location.href = "/Pos";
    } else {
      navigate("");
    }
  }, [user, isError, isSuccess, isLoading]);
  return (
    <div className="py-5" style={{ background: "#ffd333", minHeight: "100vh" }}>
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="my-5 w-25 bg-white rounded-3 mx-auto p-4">
        <h3 className="text-center title">Login</h3>
        <p className="text-center">Login to your account to continue.</p>
        {message?.message === "Rejected" && (
            <div className="error text-center">You are not</div>
          )}

          {message?.message === "Blocked" && (
            <div className="error text-center">Your account has been blocked. Contact support.</div>
          )}

        <form action="" onSubmit={formik.handleSubmit}>
        <CustomInput
            type="text"
            label="Phone Number"
            id="phone"
            name="phone"
            onChng={formik.handleChange("phone")}
            onBlr={formik.handleBlur("phone")}
            val={formik.values.phone}
          />
          <div className="error mt-2">
            {formik.touched.phone && formik.errors.phone}
          </div>

          <CustomInput
            type="text"
            label="Employee Code"
            id="empcode"
            name="empcode"
            onChng={formik.handleChange("empcode")}
            onBlr={formik.handleBlur("empcode")}
            val={formik.values.empcode}
          />
          <div className="error mt-2">
            {formik.touched.empcode && formik.errors.empcode}
          </div>

          <div className="mb-3 text-end"></div>
          <button
            className="border-0 px-3 py-2 text-white fw-bold w-100 text-center text-decoration-none fs-5"
            style={{ background: "#ffd333" }}
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
