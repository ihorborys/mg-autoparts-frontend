import styles from './Auth.module.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // 1. Функція для Google Auth
  const handleGoogleLogin = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/catalog`,
      },
    });

    if (error) {
      toast.error(`Помилка Google: ${error.message}`);
    }
    // Успішний вхід через Google обробить AuthContext (подія SIGNED_IN)
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentOrigin = window.location.origin;

    const {error} = isLogin
      ? await supabase.auth.signInWithPassword({email, password})
      : await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/catalog`,
        },
      });

    if (error) {
      toast.error(`Помилка: ${error.message}`);
    } else {
      // Якщо це РЕЄСТРАЦІЯ, показуємо тост про лист
      if (!isLogin) {
        toast.success('Підтвердіть реєстрацію - лист надіслано на пошту.', {
          duration: 8000,
        });
      }
      // Якщо це ВХІД, ми нічого тут не пишемо.
      // AuthContext побачить подію SIGNED_IN і сам покаже "З поверненням!"
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2 style={{textAlign: 'center', marginBottom: '10px'}}>
        {isLogin ? 'Вхід у Maxgear' : 'Реєстрація клієнта'}
      </h2>

      <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <input
          className={styles.authInput}
          type="email"
          placeholder="Ваш Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.authInput}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}>
          {loading ? 'Секунду...' : (isLogin ? 'Увійти' : 'Створити акаунт')}
        </button>
      </form>

      <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
        <div style={{flex: 1, height: '1px', backgroundColor: '#444'}}></div>
        <span style={{padding: '0 10px', color: '#888', fontSize: '12px'}}>АБО</span>
        <div style={{flex: 1, height: '1px', backgroundColor: '#444'}}></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className={styles.googleLoginButton}
        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="G"
          style={{width: '18px'}}
        />
        Продовжити з Google
      </button>

      <p style={{textAlign: 'center', fontSize: '14px', marginTop: '10px'}}>
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