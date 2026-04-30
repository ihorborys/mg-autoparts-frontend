import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Створюємо клієнт з розширеними налаштуваннями авторизації
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Вказуємо унікальний ключ для сховища.
    // Це гарантує, що жодні старі сесії або інші проєкти на localhost не заважатимуть.
    storageKey: 'maxgear-auth-v1',
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  }
});