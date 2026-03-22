import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearEntireCart
} from "./cartOps";

const initialState = {
  items: [],
  totalPriceEur: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  extraReducers: (builder) => {
    builder
      // --- FETCH CART (Отримання всього кошика) ---
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalPriceEur = action.payload.total_price_eur;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- ADD TO CART (Додавання / UPSERT) ---
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const {code, supplier_id, quantity} = action.payload;

        // Шукаємо, чи є вже такий товар у нашому стейті
        const existingItem = state.items.find(
          (item) => item.code === code && item.supplier_id === supplier_id
        );

        if (existingItem) {
          // Якщо був — оновлюємо кількість тим, що повернув бекенд
          existingItem.quantity = quantity;
        } else {
          // Якщо новий — додаємо в масив
          state.items.push(action.payload);
        }

        // Перераховуємо загальну суму (локально для швидкості)
        state.totalPriceEur = state.items.reduce((total, item) => total + (item.price_eur * item.quantity), 0);
      })

      // --- UPDATE QUANTITY (Кнопки +/- в кошику) ---
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const {code, supplier_id, quantity} = action.payload;
        const item = state.items.find(
          (i) => i.code === code && i.supplier_id === supplier_id
        );
        if (item) {
          item.quantity = quantity;
        }
        state.totalPriceEur = state.items.reduce((total, item) => total + (item.price_eur * item.quantity), 0);
      })

      // --- REMOVE FROM CART (Видалення одного рядка) ---
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const {code, supplier_id} = action.payload;
        state.items = state.items.filter(
          (item) => !(item.code === code && item.supplier_id === supplier_id)
        );
        state.totalPriceEur = state.items.reduce((total, item) => total + (item.price_eur * item.quantity), 0);
      })

      // --- CLEAR ENTIRE CART (Повне очищення) ---
      .addCase(clearEntireCart.fulfilled, (state) => {
        state.items = [];
        state.totalPriceEur = 0;
      });
  },
});

export const cartReducer = cartSlice.reducer;