import axios from "axios";

// Створюємо інстанс із налаштуваннями
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Сюди в майбутньому можна додати перехоплювачі (interceptors)
// наприклад, для автоматичного додавання токена Supabase в хедери
export default api;