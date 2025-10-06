import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import SalesReducer from "../features/sales/salesSlice";
import inventoryReducer from '../features/inventory/inventorySlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    sales:SalesReducer,
    inventory: inventoryReducer,

  },
});
