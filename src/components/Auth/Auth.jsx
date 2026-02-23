import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type) => {
    setLoading(true);
    const { error } = type === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(`Помилка: ${error.message}`);
    } else {
      toast.success(type === 'login' ? 'Успішний вхід!' : 'Реєстрація успішна! Перевірте пошту (якщо confirm email увімкнено)');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '50px auto' }}>
      <h2>MaxGear Auth</h2>
      <input
        type="email"
        placeholder="Ваш Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => handleAuth('login')} disabled={loading}>
        {loading ? 'Завантаження...' : 'Увійти'}
      </button>
      <button onClick={() => handleAuth('signup')} disabled={loading} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        Створити акаунт
      </button>
    </div>
  );
};