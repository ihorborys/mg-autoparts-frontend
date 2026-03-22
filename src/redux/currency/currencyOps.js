import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js"; // Наш централізований axios

export const fetchExchangeRate = createAsyncThunk(
  "currency/fetchRate",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/api/rates/latest");
      return response.data.rate;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);