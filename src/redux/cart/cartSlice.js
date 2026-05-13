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
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.totalPriceEur = 0;
    },

    // Оновлює ціни в Redux без запиту до БД.
    // Викликається після validate-prices якщо бекенд повернув нові ціни.
    // Це чисто UI операція — юзер бачить актуальні ціни і підтверджує замовлення.
    updatePrices: (state, action) => {
      const updatedItems = action.payload; // [{code, supplier_id, price_eur}, ...]

      updatedItems.forEach(updated => {
        const item = state.items.find(
          i => i.code === updated.code && i.supplier_id === updated.supplier_id
        );
        if (item) {
          item.price_eur = updated.price_eur;
        }
      });

      // Перераховуємо загальну суму з новими цінами
      state.totalPriceEur = state.items.reduce(
        (total, item) => total + item.price_eur * item.quantity, 0
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH CART ---
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

      // --- ADD TO CART ---
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const {code, supplier_id, quantity} = action.payload;
        const existingItem = state.items.find(
          (item) => item.code === code && item.supplier_id === supplier_id
        );
        if (existingItem) {
          existingItem.quantity = quantity;
        } else {
          state.items.push(action.payload);
        }
        state.totalPriceEur = state.items.reduce(
          (total, item) => total + item.price_eur * item.quantity, 0
        );
      })

      // --- UPDATE QUANTITY ---
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const {code, supplier_id, quantity} = action.payload;
        const item = state.items.find(
          (i) => i.code === code && i.supplier_id === supplier_id
        );
        if (item) item.quantity = quantity;
        state.totalPriceEur = state.items.reduce(
          (total, item) => total + item.price_eur * item.quantity, 0
        );
      })

      // --- REMOVE FROM CART ---
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const {code, supplier_id} = action.payload;
        state.items = state.items.filter(
          (item) => !(item.code === code && item.supplier_id === supplier_id)
        );
        state.totalPriceEur = state.items.reduce(
          (total, item) => total + item.price_eur * item.quantity, 0
        );
      })

      // --- CLEAR ENTIRE CART ---
      .addCase(clearEntireCart.fulfilled, (state) => {
        state.items = [];
        state.totalPriceEur = 0;
      });
  },
});

export const {clearCartLocal, updatePrices} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
