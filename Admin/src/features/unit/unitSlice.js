import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import unitService from "./unitService";

export const getUnits = createAsyncThunk(
  "unit/get-units",
  async (thunkAPI) => {
    try {
      return await unitService.getUnits();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getAUnit = createAsyncThunk(
  "unit/get-unit",
  async (id, thunkAPI) => {
    try {
      return await unitService.getUnit(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createUnit = createAsyncThunk(
  "unit/create-unit",
  async (unitData, thunkAPI) => {
    try {
      return await unitService.createUnit(unitData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const updateAUnit = createAsyncThunk(
  "unit/update-unit",
  async (unit, thunkAPI) => {
    try {
      return await unitService.updateUnit(unit);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteAUnit = createAsyncThunk(
  "unit/delete-unit",
  async (id, thunkAPI) => {
    try {
      return await unitService.deleteUnit(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  units: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUnits.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.units = action.payload;
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createUnit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdUnit = action.payload;
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(getAUnit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.unitName = action.payload.title;
      })
      .addCase(getAUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateAUnit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedUnit = action.payload;
      })
      .addCase(updateAUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(deleteAUnit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedUnit = action.payload;
      })
      .addCase(deleteAUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default unitSlice.reducer;
