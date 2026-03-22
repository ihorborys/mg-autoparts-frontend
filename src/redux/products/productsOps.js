import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js";


// Асинхронний thunk для пошуку товарів
export const fetchProductsByQuery = createAsyncThunk(
  "products/fetchByQuery",
  // Тепер приймаємо ОБ'ЄКТ з параметрами
  async ({query, limit = 20, offset = 0}, thunkAPI) => {
    try {
      // Робимо GET запит з динамічними параметрами
      const response = await api.get("/api/catalog/search", {
        params: {
          q: query,      // Твій пошуковий запит
          limit: limit,  // Скільки товарів взяти
          offset: offset // Скільки товарів пропустити (0, 20, 40...)
        },
      });

      // Повертаємо масив товарів бекенду
      return response.data;
    } catch (error) {
      // Обробляємо помилку (наприклад, якщо сервер впав)
      const errorMessage = error.response?.data?.detail || error.message;
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);