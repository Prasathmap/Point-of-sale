import React, { useState } from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { RiCouponLine } from "react-icons/ri";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, theme, Spin } from "antd";

const { Header, Content } = Layout;

const MainLayout = () => {
  const [loading, setLoading] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  // Simulate loading for navigation
  const handleNavigation = (key) => {
    setLoading(true);
    setTimeout(() => {
      if (key === "signout") {
        localStorage.clear();
        window.location.reload();
      } else {
        navigate(key);
      }
      setLoading(false);
    }, 500); // Simulate a short delay
  };

  return (
    <Layout>
      <Header
        className="d-flex justify-content-between align-items-center ps-3 pe-5"
        style={{
          background: colorBgContainer,
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2 className="fs-5">
          <span className="lg-logo">Mapit</span>
        </h2>

        {/* Horizontal Menu */}
        <Menu
          theme="light"
          mode="horizontal"
          onClick={({ key }) => handleNavigation(key)}
          items={[
            {
              key: "",
              label: "Dashboard",
            },
            {
              key: "Sales",
              label: "Sales",
            },
            {
              key: "Sales-Report",
              label: "Sales Report",
            },
            {
              key: "signout",
              label: "Sign Out",
            },
          ]}
        />

      </Header>

      <Spin spinning={loading}>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <ToastContainer
            position="top-right"
            autoClose={250}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
          />
          <Outlet />
        </Content>
      </Spin>
    </Layout>
  );
};

export default MainLayout;
