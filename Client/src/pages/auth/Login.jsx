import React, { useState, useEffect } from "react";
import { Button, Form, Input, Checkbox, message } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Login = () => {
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
    setLoading(true);
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );

      const user = await res.json();

      if (res.status === 200) {
        message.success("Login successful!");
        navigate("/");
        localStorage.setItem(
          "postUser",
          JSON.stringify({
            username: user.userName,
            email: user.email,
          })
        );
      } else if (res.status === 403) {
        message.error("Invalid password!");
      } else if (res.status === 404) {
        message.error("User not found!");
      }

      setLoading(false);
    } catch (error) {
      message.error("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md bg-black p-8 rounded-xl shadow-xl">
        <h1 className="text-center text-4xl font-semibold mb-8 text-gray-800">
          <Link to="/">
          
           {dataLoaded && logoUrl ? (
              <img src={logoUrl} alt="Logo" width={100} className="mx-auto" />
            ) : (
              <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.consoft.vn%2Fcad--visualization.html&psig=AOvVaw0jzdCk06rDCinOQ6KhRRWF&ust=1733239468272000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOjr5J-yiYoDFQAAAAAdAAAAABAJ" alt="Logo" width={80} className="mx-auto" />

            )}
          </Link>
        </h1>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: false }}>
          <Form.Item
            label={<span className="text-gray-100">E-mail</span>} 
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-100">Password</span>} 
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <div className="flex justify-between items-center">
              <Checkbox><span className="text-gray-100">Remember me</span></Checkbox>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full"
              loading={loading}
              style={{ backgroundColor: "#4c6ef5", borderColor: "#4c6ef5" }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account yet?</span>
          <Link to="/register" className="ml-2 text-indigo-600 font-semibold">
            Sign up now!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
