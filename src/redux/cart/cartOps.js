import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js";

// Налаштування базової URL вже має бути в axios.defaults.baseURL
// (ми це робили в productsOps.js)

// 1. Отримати всі товари в кошику юзера
export const fetchCart = createAsyncThunk(
  "cart/fetchAll",
  async (userId, thunkAPI) => {
    try {
      const response = await api.get(`/api/cart/${userId}`);
      return response.data; // Повертає { items, total_price_eur, ... }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 2. Додати товар в кошик (або збільшити кількість)
export const addToCart = createAsyncThunk(
  "cart/add",
  async (itemData, thunkAPI) => {
    try {
      const response = await api.post("/api/cart/", itemData);
      // Повертаємо дані товару + нову кількість з сервера
      return {...itemData, quantity: response.data.new_quantity};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 3. Оновити кількість (точне значення для кнопок +/- в самому кошику)
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({userId, supplierId, code, quantity}, thunkAPI) => {
    try {
      const response = await api.patch("/api/cart/update", null, {
        params: {user_id: userId, supplier_id: supplierId, code, quantity}
      });
      return {supplierId, code, quantity};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 4. Видалити один товар з кошика
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async ({userId, supplierId, code}, thunkAPI) => {
    try {
      await api.delete(`/api/cart/${userId}/${supplierId}/${code}`);
      return {supplierId, code};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 5. Повністю очистити кошик юзера
export const clearEntireCart = createAsyncThunk(
  "cart/clearAll",
  async (userId, thunkAPI) => {
    try {
      await api.delete(`/api/cart/${userId}`);
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);