import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Стан: true — вхід, false — реєстрація
  const [isMailSent, setIsMailSent] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {error} = isLogin
      ? await supabase.auth.signInWithPassword({email, password})
      : await supabase.auth.signUp({email, password});

    if (error) {
      toast.error(`Помилка: ${error.message}`);
    } else {
      toast.success(isLogin ? 'З поверненням!' : 'Підтвердіть, будь ласка, реєстрацію - лист надіслано на пошту.',
        {duration: 5000});
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      maxWidth: '350px',
      margin: '80px auto',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      color: 'white'
    }}>
      <h2 style={{textAlign: 'center', marginBottom: '10px'}}>
        {isLogin ? 'Вхід у Maxgear' : 'Реєстрація клієнта'}
      </h2>

      <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <input
          className="auth-input"
          type="email"
          placeholder="Ваш Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Пароль (мін. 6 символів)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} style={{
          padding: '12px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          {loading ? 'Секунду...' : (isLogin ? 'Увійти' : 'Створити акаунт')}
        </button>
      </form>

      <p style={{textAlign: 'center', fontSize: '14px'}}>
        {isLogin ? 'Ще не маєте акаунту?' : 'Вже є акаунт?'}
        <span
          onClick={() => setIsLogin(!isLogin)}
          style={{color: '#60a5fa', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline'}}
        >
          {isLogin ? 'Зареєструватися' : 'Увійти'}
        </span>
      </p>
    </div>
  );
};