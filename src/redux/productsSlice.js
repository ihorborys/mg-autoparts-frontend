import { createSlice } from "@reduxjs/toolkit";
import { fetchProductsByQuery } from "./productsOps";

const initialState = {
  items: [],       // Масив знайдених товарів
  isLoading: false, // Індикатор завантаження
  error: null,     // Текст помилки, якщо вона є
  searchPerformed: false, // Чи відбувся вже пошук
  lastQuery: "", // Останній запит
  offset: 0,              // Поточне зміщення (для пагінації)
  hasMore: true,          // Чи є ще товари в базі для підвантаження
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  // Тут ми обробляємо результати асинхронного запиту fetchProductsByQuery
  extraReducers: (builder) => {
    builder
      // 1. Коли запит тільки почався
      .addCase(fetchProductsByQuery.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;

        // Отримуємо query з аргументів, які ми передали в dispatch
        const {query, offset} = action.meta.arg;
        state.lastQuery = query;

        // Якщо це НОВИЙ пошук (offset 0) — очищуємо старі результати
        if (offset === 0) {
          state.items = [];
          state.hasMore = true;
          state.searchPerformed = false;
        }

      })
      // 2. Коли дані успішно прийшли від бекенду
      .addCase(fetchProductsByQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        const {offset, limit} = action.meta.arg; // Дістаємо offset з параметрів запиту
        const newItems = action.payload;    // Товари від бекенду

        if (offset === 0) {
          // Якщо це перший пошук — просто записуємо товари
          state.items = newItems;
        } else {
          // Якщо це пагінація — ДОДАЄМО нові товари до тих, що вже є
          state.items = [...state.items, ...newItems];
        }

        state.offset = offset;
        state.searchPerformed = true;

        // ПЕРЕВІРКА: якщо прийшло 20 товарів — значить, можливо, є ще.
        // Якщо менше 20 — значить база закінчилася, ховаємо кнопку.
        state.hasMore = newItems.length === limit;
      })
      // 3. Якщо сталася помилка
      .addCase(fetchProductsByQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Експортуємо редьюсер
export const productsReducer = productsSlice.reducer;