import React, { useState, useEffect } from "react";
import { Button, Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchLastUploadedLogo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/logo/latest`);
        if (response.ok) {
          const result = await response.json();
          if (result.fileName) {
            setLogoUrl(`${process.env.REACT_APP_SERVER_URL}/uploads/${result.fileName}`);
          }
        } else {
          console.error("Failed to fetch last uploaded logo.");
        }
      } catch (error) {
        console.error("Error fetching last uploaded logo:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchLastUploadedLogo();
  }, []); // Empty dependency array, only runs once on mount

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );

      if (res.status === 200) {
        message.success("Registration successful");
        navigate("/login");
        setLoading(false);
      }
    } catch (error) {
      message.error("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md bg-gray-900 text-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-center text-4xl font-semibold mb-8">
          <Link to="/" >
            {/* Display the logo if data is loaded */}
           {dataLoaded && logoUrl ? (
              <img src={logoUrl} alt="Logo" width={80} className="mx-auto" />
            ) : (
              <p>Loading...</p> 
            )}
          </Link>
        </h1>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span className="text-gray-100">User Name</span>} 
            name="userName"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              placeholder="Enter your username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-100">E-mail</span>} 
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-100">Password</span>} 
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-100">Confirm Password</span>}
            name="passwordAgain"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords you entered do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white border-none"
              loading={loading}
            >
              Sign up
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="ml-2 text-teal-400 font-semibold">
            Log in now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
