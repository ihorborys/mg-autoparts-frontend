import { configureStore } from "@reduxjs/toolkit";

// Імпортуємо наш НОВИЙ редьюсер для продуктів
import { productsReducer } from "./products/productsSlice.js";
import { currencyReducer } from "./currency/currencySlice.js";
import { cartReducer } from "./cart/cartSlice.js";


const rootReducer = {
  // Підключаємо наш productsReducer під ключем 'products'.
  // Тепер весь стан, пов'язаний з товарами, буде доступний як state.products
  products: productsReducer,
  cart: cartReducer,
  currency: currencyReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});