import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js"; // Наш централізований axios

export const fetchExchangeRate = createAsyncThunk(
  "currency/fetchRate",
  async (_, thunkAPI) => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // реально скасовує запит

      const response = await api.get("/api/rates/latest", {
        signal: controller.signal
      });
      return response.data.rate;
    } catch (error) {
      // При будь-якій помилці — мовчки повертаємо дефолт
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);