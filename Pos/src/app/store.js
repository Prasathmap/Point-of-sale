import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartSlice from "../features/cart/cartSlice";
import invoiceReducer from "../features/invoices/invoiceSlice"
import expanceReducer from "../features/expance/expanceSlice";
import SalesReducer from "../features/sales/salesSlice";
import inventoryReducer from '../features/inventory/inventorySlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    expance: expanceReducer,
    cart: cartSlice,
    invoice:invoiceReducer,
    sales:SalesReducer,
    inventory: inventoryReducer,

  },
});
