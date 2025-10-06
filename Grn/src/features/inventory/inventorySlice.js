import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from './inventoryService';

export const getInventories = createAsyncThunk(
  'inventory/getAllInventory',
  async (data, thunkAPI) => {
    try {
      return await inventoryService.getInventories(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
export const Billno = createAsyncThunk(
  "orders/Billno",
  async (_, thunkAPI) => {
    try {
      return await inventoryService.Billno();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createNewInventory = createAsyncThunk(
  'inventory/create',
  async (data, thunkAPI) => {
    try {
      return await inventoryService.createInventory(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteInventoryById = createAsyncThunk(
  'inventory/delete',
  async (id, thunkAPI) => {
    try {
      return await inventoryService.deleteInventory(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    inventories: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInventories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInventories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.inventories = action.payload;
      })
      .addCase(getInventories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(Billno.pending, (state) => {
        state.isLoading = true;
      })
     .addCase(Billno.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.grnno = action.payload;  
       })
     .addCase(Billno.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
        })  
      .addCase(createNewInventory.pending, (state) => {
        state.isLoading = true;
      })            
      .addCase(createNewInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.inventories = action.payload;
      })
      .addCase(createNewInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
        })  
      .addCase(deleteInventoryById.fulfilled, (state, action) => {
        state.inventories = state.inventories.filter(
          (inv) => inv._id !== action.payload._id
        );
      });
  },
});

export default inventorySlice.reducer;
