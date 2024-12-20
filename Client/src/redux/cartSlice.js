import { createSlice, createSelector } from "@reduxjs/toolkit";
import { message } from "antd";

// Utility function to load initial state from local storage
const getInitialCartState = () => {
  try {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    return {
      cartItems: savedCart?.cartItems || [],
      total: savedCart?.total || 0,
      discount: savedCart?.discount || 0,
    };
  } catch {
    return { cartItems: [], total: 0, discount: 0 };
  }
};

// Utility function to sync state to local storage
const syncLocalStorage = (state) => {
  try {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        cartItems: state.cartItems,
        total: state.total,
        discount: state.discount,
      })
    );
  } catch (error) {
    console.error("Failed to sync cart to localStorage:", error);
  }
};

// Utility function to recalculate total
const recalculateTotal = (state) => {
  state.total = state.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...getInitialCartState(),
  },
  reducers: {
    addProduct: (state, action) => {
      const { _id, price, quantity } = action.payload;

      if (!price || price < 0 || !quantity || quantity <= 0) {
        message.error("Invalid product data.");
        return;
      }

      const cartFindItem = state.cartItems.find((item) => item._id === _id);
      if (cartFindItem) {
        cartFindItem.quantity += 1;
      } else {
        state.cartItems.push(action.payload);
        message.success(`Product added.`);
      }

      recalculateTotal(state);
      syncLocalStorage(state);
    },
    deleteProduct: (state, action) => {
      const product = state.cartItems.find((item) => item._id === action.payload._id);
      if (product) {
        state.cartItems = state.cartItems.filter((item) => item._id !== action.payload._id);
        recalculateTotal(state);
        message.info(`Product "${product.name}" has been removed.`);
        syncLocalStorage(state);
      } else {
        message.error("Product not found in the cart.");
      }
    },
    increase: (state, action) => {
      const cartFindItem = state.cartItems.find(
        (item) => item._id === action.payload._id
      );
      if (cartFindItem) {
        cartFindItem.quantity += 1;
        recalculateTotal(state);
        syncLocalStorage(state);
      } else {
        message.error("Product not found in the cart.");
      }
    },
    decrease: (state, action) => {
      const cartFindItem = state.cartItems.find(
        (item) => item._id === action.payload._id
      );
      if (cartFindItem) {
        cartFindItem.quantity -= 1;
        if (cartFindItem.quantity === 0) {
          state.cartItems = state.cartItems.filter(
            (item) => item._id !== action.payload._id
          );
        }
        recalculateTotal(state);
        syncLocalStorage(state);
      } else {
        message.error("Product not found in the cart.");
      }
    },
    reset: (state, action) => {
      const { clearDiscount = true } = action.payload || {};
      state.cartItems = [];
      state.total = 0;
      if (clearDiscount) {
        state.discount = 0;
      }
      message.info("The cart has been reset.");
      syncLocalStorage(state);
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
      recalculateTotal(state);
      syncLocalStorage(state);
    },
    updatePrice: (state, action) => {
      const { id, newPrice } = action.payload;
      const item = state.cartItems.find((product) => product._id === id);
      if (item && newPrice > 0) {
        item.price = newPrice;
        recalculateTotal(state);
        message.success(`Price for "${item.name}" updated.`);
        syncLocalStorage(state);
      } else {
        message.error("Invalid price update.");
      }
    },
  },
});

// Selector to compute the total count of items
export const selectTotalCount = createSelector(
  (state) => state.cart.cartItems,
  (cartItems) =>
    cartItems
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0
);

// Selector to compute the total price after discount
export const selectFinalTotal = createSelector(
  (state) => state.cart,
  ({ total, discount }) => {
    const discountedTotal = total - (total * discount) / 100;
    return discountedTotal;
  }
);

export const {
  addProduct,
  deleteProduct,
  increase,
  decrease,
  reset,
  setDiscount,
  updatePrice,
} = cartSlice.actions;

export default cartSlice.reducer;
