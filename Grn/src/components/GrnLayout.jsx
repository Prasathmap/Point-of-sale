import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {Layout,Menu,theme,Spin,Button,Drawer,Grid,Avatar,Typography,Badge,Divider} from "antd";
import {MenuOutlined,LogoutOutlined,FileAddOutlined,FileTextOutlined,DashboardOutlined,UserOutlined,MenuFoldOutlined,MenuUnfoldOutlined,} from "@ant-design/icons";
import { getProfiles } from "../features/auth/authSlice";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { useToken } = theme;

const GrnLayout = () => {
  const { token } = useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [loading, setLoading] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { profiles } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

  const handleNavigation = (key) => {
    setMobileMenuVisible(false);
    setLoading(true);
    setTimeout(() => {
      if (key === "signout") {
        localStorage.clear();
        window.location.reload();
      } else {
        navigate(key);
      }
      setLoading(false);
    }, 500);
  };

  const menuItems = [
    { key: "", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "add-grn", icon: <FileAddOutlined />, label: "Add GRN" },
    { key: "list-grn", icon: <FileTextOutlined />, label: "GRN Report" },
    {
      key: "signout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const fixedWindowStyle = {
    width: "100%",
    maxWidth: "1800px",
    margin: "0 auto",
    minHeight: "80vh",
    backgroundColor: token.colorBgContainer,
    boxShadow: screens.md ? "0 0 20px rgba(0,0,0,0.1)" : "none",
    position: "relative",
    overflowX: "hidden",
  };

  return (
    <div style={fixedWindowStyle}>
      <Spin 
        spinning={loading} 
        size="large"
        wrapperClassName="content-spinner"
        tip="Loading..."
      >
        <Layout hasSider={screens.md}>
          {/* Desktop Sidebar */}
          {screens.md && (
            <Sider
              width={250}
              collapsed={collapsed}
              onCollapse={(value) => setCollapsed(value)}
              breakpoint="lg"
              style={{
                background: token.colorBgContainer,
                height: "100vh",
                position: "sticky",
                top: 0,
                left: 0,
                boxShadow: "2px 0 8px 0 rgba(29, 35, 41, 0.05)",
              }}
            >
              <div className="logo">
            <h2 className="text-white fs-5 text-center py-3 mb-0">
              {collapsed ? <span className="sm-logo">MAP</span> : <span className="lg-logo">Mapit</span>}
            </h2>
          </div>
              
              <div style={{ padding: "16px 0" }}>
                <Menu
                  mode="inline"
                  onClick={({ key }) => handleNavigation(key)}
                  items={menuItems}
                  selectedKeys={[window.location.pathname.split('/')[1] || '']}
                  style={{
                    borderRight: "none",
                    fontSize: "15px",
                  }}
                  inlineCollapsed={collapsed}
                />
              </div>
              
              {!collapsed && (
                <div style={{ 
                  padding: "16px", 
                  position: "absolute", 
                  bottom: 0, 
                  width: "100%",
                  borderTop: `1px solid ${token.colorBorderSecondary}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Badge dot status="success">
                      <Avatar 
                        size="default" 
                        src="https://stroyka-admin.html.themeforest.scompiler.ru/variants/ltr/images/customers/customer-4-64x64.jpg" 
                        icon={<UserOutlined />}
                      />
                    </Badge>
                    <div>
                      <Text strong style={{ display: "block" }}>
                        {profiles?.[0]?.storeName || "User"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        GRN 
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </Sider>
          )}

          <Layout style={{ minHeight: "100vh" }}>
            {/* Header */}
            <Header
              style={{
                background: token.colorBgContainer,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                height: 64,
                position: "sticky",
                top: 0,
                zIndex: 10,
                boxShadow: "0 1px 2px 0 rgba(29, 35, 41, 0.05)",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                {!screens.md ? (
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileMenuVisible(true)}
                    style={{ fontSize: "18px" }}
                  />
                ) : (
                  <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: "18px", }}
                  />
                )}
                <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                  {!screens.md && "Mapit GRN"}
                </Title>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar 
                    size="default" 
                    src="https://stroyka-admin.html.themeforest.scompiler.ru/variants/ltr/images/customers/customer-4-64x64.jpg" 
                    icon={<UserOutlined />}
                  />
                  {screens.md && (
                    <Text strong>{profiles?.[0]?.storeName || "User"}</Text>
                  )}
                </div>
              </div>
            </Header>

            {/* Mobile Menu Drawer */}
            <Drawer
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                    Mapit GRN
                  </Title>
                </div>
              }
              placement="left"
              onClose={() => setMobileMenuVisible(false)}
              open={mobileMenuVisible}
              width={280}
              bodyStyle={{ padding: 0 }}
              headerStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
            >
              <Menu
                mode="inline"
                onClick={({ key }) => handleNavigation(key)}
                items={menuItems}
                selectedKeys={[window.location.pathname.split('/')[1] || '']}
                style={{ borderRight: "none", padding: "8px 0" }}
              />
              <Divider style={{ margin: 0 }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar 
                    size="default" 
                    src="https://stroyka-admin.html.themeforest.scompiler.ru/variants/ltr/images/customers/customer-4-64x64.jpg" 
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {profiles?.[0]?.storeName || "User"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      GRN
                    </Text>
                  </div>
                </div>
              </div>
            </Drawer>

            {/* Main Content */}
            <Content
              style={{
                padding: screens.md ? "24px" : "16px",
                minHeight: "calc(100vh - 64px)",
                background: token.colorBgContainer,
              }}
            >
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="light"
                style={{ marginTop: "64px" }}
              />
              <div style={{ 
                maxWidth: 1400, 
                margin: '0 auto',
                padding: screens.md ? 0 : '0 8px'
              }}>
                <Outlet />
              </div>
            </Content>
          </Layout>
        </Layout>
      </Spin>
    </div>
  );
};

export default GrnLayout;