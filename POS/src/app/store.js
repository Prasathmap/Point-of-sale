import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/product/productSlice";
import pCategoryReducer from "../features/pcategory/pcategorySlice";
import cartSlice from "../features/cart/cartSlice";
import invoiceReducer from "../features/invoices/invoiceSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    pCategory: pCategoryReducer,
    cart: cartSlice,
    invoice:invoiceReducer,
  },
});
