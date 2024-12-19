import React, { useState, useEffect } from "react";
import { Badge, Input, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  CopyOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import "./index.css";

const Header = ({ setSearched }) => {
  const [logoUrl, setLogoUrl] = useState(null); // state to store the logo URL
  const [dataLoaded, setDataLoaded] = useState(false); // state to check if data is loaded
  const cart = useSelector((state) => state.cart);
  const basketNumber = cart.cartItems.length;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("postUser");
      navigate("/login");
      message.success("Logout successful.");
    }
  };

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

  return (
    <div className="border-b mb-6 bg-black">
  <header className="py-4 px-2 flex flex-wrap justify-between items-center gap-4 md:gap-10">
    {/* Logo Section */}
    <div className="logo">
      <Link to="/">
        {dataLoaded && logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-20" />
        ) : (
          <p>Loading...</p>
        )}
      </Link>
    </div>

    {/* Search Section */}
    <div
      className="header-search flex-1 order-3 md:order-2"
      onClick={() => pathname !== "/" && navigate("/")}
    >
      <Input
        size="large"
        placeholder="Search..."
        prefix={<SearchOutlined />}
        className="rounded-full w-full"
        onChange={(e) => setSearched(e.target.value.toLowerCase())}
      />
    </div>

    {/* Navigation Links */}
    <div className="menu-links flex flex-wrap items-center gap-4 md:gap-6 order-2 md:order-3">
      <Link to="/" className={`menu-link ${pathname === "/" && "text-blue-500"}`}>
        <HomeOutlined className="text-xl md:text-2xl text-white" />
        <span className="text-[10px] md:text-xs text-white">Homepage</span>
      </Link>

      <Badge count={basketNumber} offset={[0, 0]} className="hidden md:block">
        <Link
          to="/cart"
          className={`menu-link ${pathname === "/cart" && "text-blue-500"}`}
        >
          <ShoppingCartOutlined className="text-xl md:text-2xl text-white" />
          <span className="text-[10px] md:text-xs text-white">Basket</span>
        </Link>
      </Badge>

      <Link to="/invoices" className={`menu-link ${pathname === "/invoices" && "text-blue-500"}`}>
        <CopyOutlined className="text-xl md:text-2xl text-white" />
        <span className="text-[10px] md:text-xs text-white">Invoices</span>
      </Link>

      <Link to="/customers" className={`menu-link ${pathname === "/customers" && "text-blue-500"}`}>
        <UserOutlined className="text-xl md:text-2xl text-white" />
        <span className="text-[10px] md:text-xs text-white">Customers</span>
      </Link>

      <Link to="/statistics" className={`menu-link ${pathname === "/statistics" && "text-blue-500"}`}>
        <BarChartOutlined className="text-xl md:text-2xl text-white" />
        <span className="text-[10px] md:text-xs text-white">Statistics</span>
      </Link>

      <Link to="/settings" className={`menu-link ${pathname === "/settings" && "text-blue-500"}`}>
        <SettingOutlined className="text-xl md:text-2xl text-white" />
        <span className="text-[10px] md:text-xs text-white">Settings</span>
      </Link>

      <div onClick={logout}>
        <Link className="menu-link">
          <LogoutOutlined className="text-xl md:text-2xl text-white" />
          <span className="text-[10px] md:text-xs text-white">Exit</span>
        </Link>
      </div>
    </div>

    {/* Mobile Basket Icon */}
    <Badge count={basketNumber} offset={[0, 0]} className="flex md:hidden order-1">
      <Link
        to="/cart"
        className={`menu-link ${pathname === "/cart" && "text-blue-500"}`}
      >
        <ShoppingCartOutlined className="text-2xl text-white" />
        <span className="text-[10px] text-white">Basket</span>
      </Link>
    </Badge>
  </header>
</div>

  );
};

export default Header;
