import React, { useState ,useRef} from "react";
import { Form,Button, Layout, Typography, Modal, Select,Radio } from "antd";
import stateData from "../../data/pincode_IN.json";
import { useFormik } from "formik";
import * as yup from "yup";
import CustomInput from "../../components/CustomInput";
import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { useDispatch } from "react-redux";
import { registerUser,sendOtp,verifyOtp } from "../../features/auth/authSlice";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Form validation schema
const signUpSchema = yup.object({
  userName: yup.string().required("User Name is Required"),
  email: yup.string().required("Email is Required").email("Email should be valid"),
  emailOtp: yup.string().length(6,"OTP must be 6 digits").matches(/^\d{6}$/,"OTP must be numeric"),
  phone: yup.string().matches(/^\d{10}$/, "Enter a valid 10-digit phone number").required("Phone number is required"),
  storeName: yup.string().required("Store Name is required"),
  address: yup.string().required("Store address is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  village: yup.string().required("Village is required"),
  pincode: yup.string().required("Pincode is required"),
  pancard: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number (e.g., ABCDE1234F)").required("PAN is required"),
  gstno: yup.string().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Enter a valid GST number (e.g., 22ABCDE1234F1Z5)").required("GST is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});

const MultiStepForm = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [cities, setCities] = useState([]);
  const [villages, setVillages] = useState([]);
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState({ email: false });
  const [emailResendTime, setEmailResendTime] = useState(30);
  const inputRefs = useRef({});
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentInfo, setPaymentInfo] = useState({
    razorpayPaymentId: "",
  });
  const plans = {
    monthly: { basic: "₹500/week" },
    yearly: { basic: "₹3000/month" },
  };
  
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phone: "",
      address: "",
      state: "",
      city: "",
      village: "",
      pincode: "",
      pancard: "",
      gstno: "",
      storeName: "",
      password: "",
      confirmPassword: "",
      paymentInfo: "",
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      if (!otpVerified) {
        alert("Please verify your email OTP first.");
        return;
      }
      dispatch(registerUser(values));
    },
  });


 // Function to send OTP
const handleSendOTP = async (type) => {
  if (type === "email" && (!formik.values.email || formik.errors.email)) return;
  
  setLoading(true);
  try {
    if (type === "email") {
      await dispatch(sendOtp({ email: formik.values.email }));
      setEmailOtpSent(true);
      setEmailResendTime(30);
      alert.success("OTP sent to your email.");

      // Countdown for resending OTP
      const interval = setInterval(() => {
        setEmailResendTime((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  } catch (error) {
    console.log(`Error sending OTP for ${type}.`);
  }
  setLoading(false);
};

const handleVerifyOTP = async (type) => {
  const otpCode = emailOtp.join("").trim(); // Ensure no spaces

  if (otpCode.length !== 6) {
    alert("Enter a valid 6-digit OTP.");
    return;
  }

  setLoading(true);
  try {
    const response = await dispatch(
      verifyOtp({
        [type]: formik.values[type], // Ensure email is sent
        [`${type}Otp`]: otpCode, // Ensure OTP is correctly sent
      })
    );

    console.log("OTP Verify API Response:", response.payload); // Log full response

    if (response.payload?.success) {
      setOtpVerified((prev) => ({ ...prev, [type]: true }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP Verified Successfully!`);
    } else {
      alert(response.payload?.message || "OTP Verification Failed.");
    }
  } catch (error) {
    console.error("OTP Verification Error:", error);
    alert("OTP Verification Failed due to an error.");
  }
  setLoading(false);
};


// Function to handle OTP input change
const handleOtpChange = (index, value) => {
  if (!/^\d*$/.test(value)) return; // Only numbers allowed
  
  const newOtp = [...emailOtp];
  newOtp[index] = value;
  setEmailOtp(newOtp);

  // Move to next input automatically
  if (value && index < 5) {
    inputRefs.current[`email-${index + 1}`]?.focus();
  }
};

// Handle backspace navigation
const handleOtpKeyDown = (index, e) => {
  if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
    inputRefs.current[`email-${index - 1}`]?.focus();
  }
}; 
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
const checkOutHandler = async () => {
  const res = await loadScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  if (!formik.values.subscription) {
    alert("Please select a subscription plan");
    return;
  }

  let amountString = plans[billingCycle][formik.values.subscription]; // e.g., "₹500/week"
  let amount = parseInt(amountString.replace(/[^0-9]/g, ""), 10); // Extracts numeric value

  const result = await axios.post(
    "http://localhost:4000/api/auth/order/checkout",
    { amount: amount },
    config
  );

  if (!result) {
    alert("Something went wrong");
    return;
  }

  const { amount: orderAmount, currency } = result.data.order;

  const options = {
    key: "rzp_test_QSZHdzxON8Fo45",
    amount: orderAmount,
    currency: currency,
    name: "Mapitonce",

    handler: async function (response) {
      const data = {
        razorpayPaymentId: response.razorpay_payment_id,
      };

      try {
        const verificationResult = await axios.post(
          "http://localhost:4000/api/auth/order/paymentVerification",
          data
        );

        console.log("Payment Verification Response:", verificationResult.data); // Debugging

        if (verificationResult.data.success) {
          dispatch({
            type: "UPDATE_PAYMENT_INFO",
            payload: verificationResult.data,
          });

          // 🔹 Update Formik after successful verification
          formik.setFieldValue("paymentInfo", verificationResult.data);

          alert("Payment successful and saved.");
        } else {
          alert("Payment verification failed.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        alert("Payment verification request failed.");
      }
    },

    notes: {
      address: "Developer's corner office",
    },
    theme: {
      color: "#61dafb",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};


  const handleStateChange = (value) => {
    formik.setFieldValue("state", value);
    formik.setFieldValue("city", "");
    formik.setFieldValue("village", "");
    setCities(Object.keys(stateData[value] || {}));
    setVillages([]);
    setPincode("");
  };

  const handleCityChange = (value) => {
    formik.setFieldValue("city", value);
    formik.setFieldValue("village", "");
    setVillages(Object.keys(stateData[formik.values.state]?.[value] || {}));
    setPincode("");
  };

  const handleVillageChange = (value) => {
    formik.setFieldValue("village", value);
    const selectedPincode = stateData[formik.values.state]?.[formik.values.city]?.[value] || "";
    formik.setFieldValue("pincode", selectedPincode);
  };
  
  
  const next = () => {
    setCurrent((prev) => prev + 1);
  };
  
  const prev = () => setCurrent(current - 1);

  const steps = [
    {
      title: "Personal Info",
      content: (
        <>
          <Title level={2}>Personal Info</Title>
          <Text type="secondary">Enter your personal details.</Text>
          <Form layout="vertical">
               <CustomInput
                  label="Name"
                  type="text"
                  name="userName"
                  id="userName"
                  placeholder="Name"
                  val={formik.values.userName}
                  onChng={formik.handleChange("userName")}
                  onBlr={formik.handleBlur("userName")}
                />
                <div className="error">
                  {formik.touched.userName && formik.errors.userName}
                </div>
                
                <CustomInput
                    label="Email"
                    name="email"
                    placeholder="Enter your email"
                    val={formik.values.email}
                    onChng={formik.handleChange}
                    onBlr={() => !emailOtpSent && handleSendOTP("email")}
                />
    
                    <div className="error">{formik.touched.email && formik.errors.email}</div>

                    {emailOtpSent && (
                      <>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>
                          {emailOtp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              value={digit}
                              ref={(el) => (inputRefs.current[`email-${index}`] = el)}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              readOnly={otpVerified.email}
                              style={{
                                width: "40px",
                                height: "40px",
                                textAlign: "center",
                                fontSize: "18px",
                                border: otpVerified.email ? "2px solid green" : "2px solid #ccc",
                                borderRadius: "5px",
                                backgroundColor: otpVerified.email ? "#e6ffe6" : "white",
                              }}
                            />
                          ))}

                          <Button
                            onClick={() => handleVerifyOTP("email")}
                            disabled={loading || otpVerified.email}
                            style={{ marginLeft: "10px" }}
                          >
                            {loading ? "Verifying..." : otpVerified.email ? "✅ Verified" : "Verify OTP"}
                          </Button>
                        </div>

                        <p style={{ marginTop: "10px", textAlign: "center" }}>
                          {emailResendTime > 0 ? (
                            `Resend OTP in ${emailResendTime}s`
                          ) : (
                            <Button onClick={() => handleSendOTP("email")}>Resend OTP</Button>
                          )}
                        </p>
                      </>
                    )}

               <CustomInput
                  type="tel"
                  label="Mobile"
                  name="phone"
                  placeholder="Mobile Number"
                  val={formik.values.phone}
                  onChng={formik.handleChange("phone")}
                />
                <div className="error">{formik.touched.phone && formik.errors.phone}</div>

          </Form>
        </>
      ),
    },
    
    {
      title: "Address Details",
      content: (
        <>
          <Title level={2}>Address Info</Title>
          <Text type="secondary">Select your location.</Text>

          <Form layout="vertical">
          <CustomInput
                  type="text"
                  label="address"
                  name="address"
                  placeholder="address"
                  val={formik.values.address}
                  onChng={formik.handleChange("address")}
                  onBlr={formik.handleBlur("address")}
                />
                <div className="error">
                  {formik.touched.address && formik.errors.address}
                </div>

            <Form.Item label="State">
              <Select placeholder="Select State" onChange={handleStateChange} value={formik.values.state}>
                {Object.keys(stateData).map((state) => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="City">
              <Select placeholder="Select City" disabled={!formik.values.state} onChange={handleCityChange} value={formik.values.city}>
                {cities.map((city) => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Village">
              <Select placeholder="Select Village" disabled={!formik.values.city} onChange={handleVillageChange} value={formik.values.village}>
                {villages.map((village) => (
                  <Option key={village} value={village}>{village}</Option>
                ))}
              </Select>
            </Form.Item>
            <CustomInput
                type="text"
                label="Pincode"
                id="pincode"
                name="pincode"
                val={formik.values.pincode} 
                // onChng={(e) => formik.setFieldValue("pincode", e.target.value)}
                // onBlr={formik.handleBlur("pincode")}
              />
              <div className="error mt-2">
                {formik.touched.pincode && formik.errors.pincode}
              </div>
            
          </Form>
        </>
      ),
    },
    {
      title: "Business Info",
      content: (
        <>
          <Title level={2}>Business Details</Title>
          <Form layout="vertical">
          <CustomInput
            type="text"
            label="Pan card"
            id="pancard"
            name="pancard"
            onChng={formik.handleChange("pancard")}
            onBlr={formik.handleBlur("pancard")}
            val={formik.values.pancard}
          />
          <div className="error mt-2">
            {formik.touched.pancard && formik.errors.pancard}
          </div>
          <CustomInput
            type="text"
            label="GST No"
            id="gstno"
            name="gstno"
            onChng={formik.handleChange("gstno")}
            onBlr={formik.handleBlur("gstno")}
            val={formik.values.gstno}
          />
          <div className="error mt-2">
            {formik.touched.gstno && formik.errors.gstno}
          </div>
           <CustomInput
            type="text"
            label="Store Name"
            id="storeName"
            name="storeName"
            onChng={formik.handleChange("storeName")}
            onBlr={formik.handleBlur("storeName")}
            val={formik.values.storeName}
          />
           <div className="error mt-2">
            {formik.touched.storeName && formik.errors.storeName}
          </div>
          </Form>
        </>
      ),
    },
    {
      title: " Subscription Plan",
      content: (
        <> 
        <div>
      <h2>Choose Your Subscription Plan</h2>
      <Form layout="vertical">
        <Form.Item label="Billing Cycle">
          <Radio.Group onChange={(e) => setBillingCycle(e.target.value)} value={billingCycle}>
            <Radio value="monthly">Monthly</Radio>
            <Radio value="yearly">Yearly</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Subscription Plan">
          <Radio.Group
            onChange={(e) => formik.setFieldValue("subscription", e.target.value)}
            value={formik.values.subscription}
          >
            <Radio value="basic">Basic - {plans[billingCycle].basic}</Radio>
            
          </Radio.Group>
          <div className="error mt-2">{formik.touched.subscription && formik.errors.subscription}</div>
        </Form.Item>

        <Button type="primary" className="mt-4" onClick={checkOutHandler}>
          Subscribe
        </Button>
      </Form>
    </div>
        
        </>)
    },
    {
      title: "Set Password",
      content: (
        <>
          <Title level={2}>Create Password</Title>
          <Form layout="vertical">
          <CustomInput
            type="password"
            label="Password"
            id="pass"
            name="password"
            onChng={formik.handleChange("password")}
            onBlr={formik.handleBlur("password")}
            val={formik.values.password}
          />
          <div className="error mt-2">
            {formik.touched.password && formik.errors.password}
          </div>
          <CustomInput
            type="password"
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            onChng={formik.handleChange("confirmPassword")}
            onBlr={formik.handleBlur("confirmPassword")}
            val={formik.values.confirmPassword}
          />
          <div className="error mt-2">
            {formik.touched.confirmPassword && formik.errors.confirmPassword}
          </div>
          </Form>
        </>
      ),
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#F0F4F8", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
    <div style={{ background: "white", borderRadius: 10, width: "100%", maxWidth: "700px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)", padding: "20px", transition: "all 0.3s ease-in-out" }}>
      
      <Header style={{ background: "#4F46E5", padding: "15px", borderRadius: "10px 0px 10px 0", overflowX: "auto", whiteSpace: "nowrap", display: "flex", justifyContent: "center" }}>
      
      </Header>
      
      <Content style={{ marginTop: 20, padding: "10px" }}>
        <form onSubmit={formik.handleSubmit}>
          <div style={{ padding: "15px", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
            {steps[current].content}
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            {current > 0 && <Button onClick={prev} style={{ flex: 1, minWidth: "100px", backgroundColor: "#64748B", color: "white", border: "none" }}>Previous</Button>}
            {current < steps.length - 1 ? (
              <Button type="primary" onClick={next} style={{ flex: 1, minWidth: "100px", backgroundColor: "#2563EB", border: "none" }}>Next Step</Button>
            ) : (
              <button
                style={{flex: 1, minWidth: "100px", backgroundColor: "#2563EB", border: "none" }}
                type="submit"
              >
                Register
              </button>
            )}
          </div>
        </form>
      </Content>
    </div>
    <Modal open={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}>
      <p>Modal Content</p>
    </Modal>
  </Layout>

  );
};

export default MultiStepForm;
