import { createClient } from '@supabase/supabase-js';

// Отримуємо ключі з твого .env файлу через Vite-метадані
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ініціалізуємо клієнт
export const supabase = createClient(supabaseUrl, supabaseAnonKey);