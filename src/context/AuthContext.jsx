// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient';
// import { useDispatch } from 'react-redux';
// import { clearCartLocal } from '../redux/cart/cartSlice';
// import toast from 'react-hot-toast';
//
// const AuthContext = createContext({});
//
// export const AuthProvider = ({children}) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();
//
//   // Об'єднуємо дані Auth-користувача з даними профілю (БД)
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data, error} = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', sessionUser.id)
//         .single();
//
//       if (error) throw error;
//       return data ? {...sessionUser, ...data} : sessionUser;
//     } catch (err) {
//       console.warn("Profile fetch warning (might be delay):", err.message);
//       return sessionUser;
//     }
//   };
//
//   const logout = async () => {
//     try {
//       setUser(null);
//       dispatch(clearCartLocal());
//       await supabase.auth.signOut();
//       toast.success("До зустрічі!");
//     } catch (error) {
//       console.error("Logout error:", error.message);
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//
//     const init = async () => {
//       try {
//         // 1. Пробуємо отримати сесію відразу при старті (для локального запуску)
//         const {data: {session}} = await supabase.auth.getSession();
//
//         if (session?.user && isMounted) {
//           const fullUser = await fetchFullUser(session.user);
//           setUser(fullUser);
//         }
//       } catch (err) {
//         // Навіть якщо тут AbortError, ми просто ігноруємо його
//         console.warn("Initial session fetch error:", err.message);
//       } finally {
//         // ГАРАНТОВАНО вимикаємо лоадер
//         if (isMounted) setLoading(false);
//       }
//
//       // 2. Підписуємося на зміни (це вже працюватиме у фоні)
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//         } else {
//           if (isMounted) setUser(null);
//         }
//         if (isMounted) setLoading(false);
//       });
//
//       return subscription;
//     };
//
//     const subscriptionPromise = init();
//
//     return () => {
//       isMounted = false;
//       subscriptionPromise.then(sub => sub?.unsubscribe());
//     };
//   }, [dispatch]);
//
//   return (
//     <AuthContext.Provider value={{user, loading, logout, setUser}}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => useContext(AuthContext);


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

  // Об'єднуємо дані Auth-користувача з даними профілю (БД).
  // Використовуємо maybeSingle() замість single() —
  // single() кидає помилку якщо запису немає (новий юзер без профілю),
  // maybeSingle() просто повертає null і не ламає флоу.
  const fetchFullUser = async (sessionUser) => {
    if (!sessionUser) return null;
    try {
      const {data} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      return data ? {...sessionUser, ...data} : sessionUser;
    } catch (err) {
      console.warn("Profile fetch warning:", err.message);
      return sessionUser;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      dispatch(clearCartLocal());
      await supabase.auth.signOut();
      toast.success("До зустрічі!");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const {data: {session}} = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const fullUser = await fetchFullUser(session.user);
          setUser(fullUser);
        }
      } catch (err) {
        console.warn("Initial session fetch error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }

      const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const fullUser = await fetchFullUser(session.user);
          if (isMounted) setUser(fullUser);
        } else {
          if (isMounted) setUser(null);
        }
        if (isMounted) setLoading(false);
      });

      return subscription;
    };

    const subscriptionPromise = init();

    return () => {
      isMounted = false;
      subscriptionPromise.then(sub => sub?.unsubscribe());
    };
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{user, loading, logout, setUser}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
