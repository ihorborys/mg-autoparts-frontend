import styles from './Auth.module.css';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';


export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/catalog`,
      },
    });

    if (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentOrigin = window.location.origin;

    const {data, error} = isLogin
      ? await supabase.auth.signInWithPassword({email, password})
      : await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/catalog`,
        },
      });

    if (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    } else {
      if (!isLogin) {
        if (data?.user?.identities?.length === 0) {
          toast.error('Цей email вже зареєстрований. Спробуйте увійти.');
          setLoading(false);
          return;
        }
        toast.success('Підтвердіть реєстрацію - лист надіслано на пошту. Натисніть на посилання в листі', {
          duration: 8000,
        });
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 style={{textAlign: 'center', marginBottom: '10px'}}>
        {isLogin ? 'Вхід у Maxgear' : 'Реєстрація клієнта'}
      </h2>

      <div className={styles.formWrapper}>
        {loading && <div className={styles.overlay}/>}

        <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <input
            className={styles.authInput}
            type="email"
            placeholder="Ваш Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Поле пароля з кнопкою показу/приховування */}
          <div className={styles.passwordWrapper}>
            <input
              className={styles.authInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(prev => !prev)}
              tabIndex={-1} // не потрапляє в tab-порядок
              aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
            >
              {showPassword
                ? <EyeOff size={18} color="#888"/>
                : <Eye size={18} color="#888"/>
              }
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Секунду...' : (isLogin ? 'Увійти' : 'Створити акаунт')}
          </button>
        </form>

        <div style={{display: 'flex', alignItems: 'center', margin: '10px 0'}}>
          <div style={{flex: 1, height: '1px', backgroundColor: '#444'}}/>
          <span style={{padding: '0 10px', color: '#888', fontSize: '12px'}}>АБО</span>
          <div style={{flex: 1, height: '1px', backgroundColor: '#444'}}/>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className={styles.googleLoginButton}
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
            onClick={() => !loading && setIsLogin(!isLogin)}
            style={{
              color: loading ? '#555' : '#60a5fa',
              cursor: loading ? 'default' : 'pointer',
              marginLeft: '8px',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  );
};
