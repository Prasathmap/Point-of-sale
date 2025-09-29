import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined,PercentageOutlined, GoldOutlined } from "@ant-design/icons";
import { AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { RiCouponLine } from "react-icons/ri";
import { FaStore, FaWallet, FaClipboardList} from "react-icons/fa";
import { AiOutlineLogin } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Outlet,useNavigate} from "react-router-dom";
import { FaUsers } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { useDispatch,useSelector } from "react-redux";
import { SiBrandfolder } from "react-icons/si";
import { BiCategoryAlt } from "react-icons/bi";
import { Layout, Menu, theme, Spin, Drawer, Button } from "antd";
import { getProfiles} from "../features/auth/authSlice";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { profiles } = useSelector((state) => state.auth);

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

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
      if (mobileView) {
        setDrawerVisible(false);
      }
    }, 500);
  };

  const menuItems = [
    {
      key: "",
      icon: <AiOutlineDashboard className="fs-4" />,
      label: "Dashboard",
    },
    {
      key: "Catalog",
      icon: <AiOutlineShoppingCart className="fs-4" />,
      label: "Catalog",
      children: [
        {
          key: "product",
          icon: <AiOutlineShoppingCart className="fs-4" />,
          label: "Product",
        },
        {
          key: "brand",
          icon: <SiBrandfolder className="fs-4" />,
          label: "Brand",
        },
        {
          key: "category",
          icon: <BiCategoryAlt className="fs-4" />,
          label: "Category",
        },
        {
          key: "tax",
          icon: <PercentageOutlined className="fs-4" />,
          label: "Tax",
        },
        {
          key: "unit",
          icon: <GoldOutlined className="fs-4" />,
          label: "Units",
        },
      ],
    },
    {
      key: "Category",
      icon: <BiCategoryAlt className="fs-4" />,
      label: "Category",
      children: [
        {
          key: "expance",
          icon: <FaWallet className="fs-4" />,
          label: "Expance Category",
        },
        {
          key: "Salestype",
          icon: <MdCategory className="fs-4" />,
          label: "Sales Category",
        },
        
      ],
    },
    {
      key: "orders",
      icon: <FaClipboardList className="fs-4" />,
      label: "Sales Report",
    },
    {
      key: "customers",
      icon: <AiOutlineUser className="fs-4" />,
      label: "Customers",
    },
     {
      key: "create-logins",
      icon: <AiOutlineLogin className="fs-4" />,
      label: "Login",
    },
    {
      key: "coupon",
      icon: <RiCouponLine className="fs-4" />,
      label: "Marketing",
    },
    {
      key: "profile",
      icon: <FaStore className="fs-4" />,
      label: "Store",
    },
    
    {
      key: "Employee",
      icon: <FaUsers className="fs-4" />,
      label: "Employee",
    },
    {
      key: "signout",
      icon: <AiOutlineLogout className="fs-4" />,
      label: "Sign Out",
    },
  ];

  return (
    <Layout className="main-layout" style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!mobileView && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={250}
          collapsedWidth={80}
          breakpoint="md"
          onBreakpoint={(broken) => {
            setMobileView(broken);
            if (broken) {
              setCollapsed(true);
            }
          }}
        >
          <div className="logo">
            <h2 className="text-white fs-5 text-center py-3 mb-0">
              {collapsed ? <span className="sm-logo">MAP</span> : <span className="lg-logo">Mapit</span>}
            </h2>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[""]}
            onClick={({ key }) => handleNavigation(key)}
            items={menuItems}
          />
        </Sider>
      )}

      <Layout className="site-layout">
        <Header
          className="d-flex justify-content-between align-items-center ps-1 pe-3 pe-md-5"
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
          }}
        >
          <div className="d-flex align-items-center">
            {mobileView ? (
              <Button
                type="text"
                icon={drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setDrawerVisible(!drawerVisible)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            ) : (
              React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
                style: { padding: '0 24px' }
              })
            )}
          </div>
          
          <div className="d-flex gap-4 align-items-center">
            <div className="d-flex gap-3 align-items-center dropdown">
              <div>
                <img
                  width={32}
                  height={32}
                  src="https://stroyka-admin.html.themeforest.scompiler.ru/variants/ltr/images/customers/customer-4-64x64.jpg"
                  alt=""
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div
                role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <h5 className="mb-0">{profiles?.[0]?.storeName || "User"}</h5>
              </div>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <Link
                    className="dropdown-item py-1 mb-1"
                    style={{ height: "auto", lineHeight: "20px" }}
                    to="/"
                  >
                    Signout
                  </Link>
                </li>
              </div>
            </div>
          </div>
        </Header>

        {/* Mobile Drawer */}
        {mobileView && (
          <Drawer
            title="Menu"
            placement="left"
            closable={true}
            onClose={() => setDrawerVisible(false)}
            visible={drawerVisible}
            width={250}
            bodyStyle={{ padding: 0 }}
            headerStyle={{ padding: '16px' }}
          >
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[""]}
              onClick={({ key }) => handleNavigation(key)}
              items={menuItems}
              style={{ height: '100%', borderRight: 0 }}
            />
          </Drawer>
        )}

        <Spin spinning={loading} wrapperClassName="content-spinner">
          <Content
            style={{
              margin: mobileView ? '16px 8px' : '24px 16px',
              padding: mobileView ? 12 : 24,
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
    </Layout>
  );
};

export default MainLayout;