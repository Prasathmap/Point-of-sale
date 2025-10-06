import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from './inventoryService';

// Thunks
export const getInventories = createAsyncThunk(
  'inventory/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.getInventories();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllGoods = createAsyncThunk(
  'goods/All',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.getAllGoods();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const updateInventory = createAsyncThunk(
  "inventory/update-inventory",
  async (updates, thunkAPI) => {
    try {
      return await inventoryService.updatestock(updates);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveInventory = createAsyncThunk(
  'inventory/approve',
  async (data, thunkAPI) => {
    try {
      return await inventoryService.approveInventory(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


// Initial state
const initialState = {
  inventories: [],
  goods:[],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    resetInventoryState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(getInventories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInventories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inventories = action.payload;
      })
      .addCase(getInventories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllGoods.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllGoods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.goods = action.payload;
      })
      .addCase(getAllGoods.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.updategoods = action.payload;
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
     
      // APPROVE
      .addCase(approveInventory.fulfilled, (state, action) => {
        state.isSuccess = true;
      })
      .addCase(approveInventory.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetInventoryState } = inventorySlice.actions;
export default inventorySlice.reducer;
