import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MainLayout from "./components/MainLayout";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Addcat from "./pages/Category/Addcat";
import Categorylist from "./pages/Category/Categorylist";
import Addbrand from "./pages/Brand/Addbrand";
import Brandlist from "./pages/Brand/Brandlist";
import Addtax from "./pages/Tax/Addtax";
import Taxlist from "./pages/Tax/Taxlist";
import Addattender from "./pages/Attender/Addattender";
import Attenderlist from "./pages/Attender/Attenderlist";
import Addunit from "./pages/Unit/Addunits"
import Unitlist from "./pages/Unit/Unitlist";
import Productlist from "./pages/Product/Productlist";
import Addproduct from "./pages/Product/Addproduct";
import Couponlist from "./pages/Coupon/Couponlist";
import AddCoupon from "./pages/Coupon/AddCoupon";
import ViewOrder from "./pages/ViewOrder";
import { OpenRoutes } from "./routing/OpenRoutes";
import { PrivateRoutes } from "./routing/PrivateRoutes";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <OpenRoutes>
              <Login />
            </OpenRoutes>
          }
        />
        <Route
          path="register"
          element={
            <OpenRoutes>
              <Register />
            </OpenRoutes>
          }
        />
        {/* <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/forgot-password" element={<Forgotpassword />} /> */}
        <Route
          path="/admin"
          element={
            <PrivateRoutes>
              <MainLayout />
            </PrivateRoutes>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="coupon-list" element={<Couponlist />} />
          <Route path="coupon" element={<AddCoupon />} />
          <Route path="coupon/:id" element={<AddCoupon />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order/:id" element={<ViewOrder />} />
          <Route path="customers" element={<Customers />} />
          <Route path="list-category" element={<Categorylist />} />
          <Route path="category" element={<Addcat />} />
          <Route path="category/:id" element={<Addcat />} />
          <Route path="list-brand" element={<Brandlist />} />
          <Route path="brand" element={<Addbrand />} />
          <Route path="brand/:id" element={<Addbrand />} />
          <Route path="list-attender" element={<Attenderlist />} />
          <Route path="attender" element={<Addattender />} />
          <Route path="attender/:id" element={<Addattender />} />
          <Route path="list-tax" element={<Taxlist />} />
          <Route path="tax" element={<Addtax />} />
          <Route path="tax/:id" element={<Addtax />} />
          <Route path="unit" element={<Addunit />} />
          <Route path="unit/:id" element={<Addunit/>} />
          <Route path="list-unit" element={<Unitlist />} />
          <Route path="list-product" element={<Productlist />} />
          <Route path="product" element={<Addproduct />} />
          <Route path="product/:id" element={<Addproduct />} />
          <Route path="profile" element={ <Profile /> } />
         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
