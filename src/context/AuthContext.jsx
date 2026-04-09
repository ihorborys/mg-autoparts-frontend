// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient'; // Використовуємо ваш існуючий клієнт
//
// const AuthContext = createContext({});
//
// export const AuthProvider = ({children}) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     // Перевіряємо поточну сесію при завантаженні
//     const getSession = async () => {
//       const {data: {session}} = await supabase.auth.getSession();
//       setUser(session?.user ?? null);
//       setLoading(false);
//     };
//
//     getSession();
//
//     // Слухаємо зміни (вхід, вихід, зміна пароля)
//     const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });
//
//     return () => subscription.unsubscribe();
//   }, []);
//
//   return (
//     <AuthContext.Provider value={{user, loading}}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функція для отримання профілю (без зайвих ускладнень)
  const fetchFullUser = async (sessionUser) => {
    if (!sessionUser) return null;
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) return sessionUser; // Якщо профілю нема, повертаємо хоча б Auth дані
      return {...sessionUser, ...data};
    } catch {
      return sessionUser;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Отримуємо поточну сесію відразу
      const {data: {session}} = await supabase.auth.getSession();

      if (session?.user) {
        const fullUser = await fetchFullUser(session.user);
        if (isMounted) setUser(fullUser);
      }

      // 2. ГАРАНТОВАНО вимикаємо завантаження
      if (isMounted) setLoading(false);

      // 3. Підписуємось на зміни (вхід/вихід)
      const {data: {subscription}} = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const fullUser = await fetchFullUser(session.user);
          if (isMounted) setUser(fullUser);
        } else {
          if (isMounted) setUser(null);
        }
      });

      return subscription;
    };

    const authSub = initializeAuth();

    return () => {
      isMounted = false;
      authSub.then(sub => sub?.unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, setUser}}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);