import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useDispatch } from 'react-redux';
import { clearCartLocal } from '../redux/cart/cartSlice';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchFullUser = async (sessionUser) => {
    if (!sessionUser) return null;
    try {
      const {data} = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
      return data ? {...sessionUser, ...data} : sessionUser;
    } catch {
      return sessionUser;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      dispatch(clearCartLocal());
      await supabase.auth.signOut();
      toast.success("До зустрічі!"); // Використовує стандартну іконку зі скриншоту
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let isActivationToastShown = false;

    // Перевірка на активацію (тільки якщо в URL є параметри реєстрації)
    const isEmailActivation = window.location.hash.includes('type=signup');

    const initializeAuth = async () => {
      // 1. Отримуємо поточну сесію
      const {data: {session}} = await supabase.auth.getSession();

      if (session?.user) {
        const fullUser = await fetchFullUser(session.user);
        if (isMounted) setUser(fullUser);
      }

      if (isMounted) setLoading(false);

      // 2. Слухаємо зміни стану
      const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const fullUser = await fetchFullUser(session.user);
          if (isMounted) setUser(fullUser);

          // --- ЛОГІКА ТОСТІВ ---

          // АКТИВАЦІЯ (через лист на пошті)
          if (isEmailActivation && !isActivationToastShown) {
            isActivationToastShown = true;
            toast.success("Акаунт активовано! Ласкаво просимо до Maxgear.");
            window.history.replaceState(null, null, window.location.pathname);
          }

          // ЗВИЧАЙНИЙ ВХІД (Email/Password або Google)
          else if (event === 'SIGNED_IN' && !isEmailActivation) {
            toast.success("З поверненням!");
          }
        } else {
          if (isMounted) setUser(null);
          if (event === 'SIGNED_OUT') dispatch(clearCartLocal());
        }
      });

      return subscription;
    };

    const authSub = initializeAuth();

    return () => {
      isMounted = false;
      authSub.then(sub => sub?.unsubscribe());
    };
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{user, loading, logout, setUser}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);