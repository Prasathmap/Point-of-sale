import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PrivateRoutes = ({ children }) => {
  const navigate = useNavigate();
  const getTokenFromLocalStorage = JSON.parse(localStorage.getItem("grn"));

  useEffect(() => {
    if (!getTokenFromLocalStorage?.token) {
      navigate("/", { replace: true });
    }
  }, [getTokenFromLocalStorage, navigate]);

  return getTokenFromLocalStorage?.token ? children : null;
};