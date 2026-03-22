import { createSlice } from "@reduxjs/toolkit";
import { fetchExchangeRate } from "./currencyOps";

const currencySlice = createSlice({
  name: "currency",
  initialState: {
    rate: 52, // Дефолтний курс на випадок помилки
    isLoading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExchangeRate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rate = action.payload;
      })
      .addCase(fetchExchangeRate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const currencyReducer = currencySlice.reducer;