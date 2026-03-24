import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api.js";

// Налаштування базової URL вже має бути в axios.defaults.baseURL
// (ми це робили в productsOps.js)

// 1. Отримати всі товари в кошику юзера
export const fetchCart = createAsyncThunk(
  "cart/fetchAll",
  async (user_id, thunkAPI) => {
    try {
      const response = await api.get(`/api/cart/${user_id}`);
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
      return {
        ...itemData,
        quantity: response.data.new_quantity,
        stock: response.data.stock // <--- Ось цей "золотий" рядок
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// Шукай 3. Оновити кількість
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({user_id, supplier_id, code, quantity}, thunkAPI) => {
    try {
      // Відправляємо запит у фоні, але не чекаємо його для оновлення цифри
      await api.patch("/api/cart/update", null, {
        params: {user_id, supplier_id, code, quantity}
      });

      // Повертаємо те, що юзер клікнув (миттєва реакція)
      return {supplier_id, code, quantity};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 4. Видалити один товар з кошика
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async ({user_id, supplier_id, code}, thunkAPI) => {
    try {
      await api.delete(`/api/cart/${user_id}/${supplier_id}/${code}`);
      return {supplier_id, code};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// 5. Повністю очистити кошик юзера
export const clearEntireCart = createAsyncThunk(
  "cart/clearAll",
  async (user_id, thunkAPI) => {
    try {
      await api.delete(`/api/cart/${user_id}`);
      return user_id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);