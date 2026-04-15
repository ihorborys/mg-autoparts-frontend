// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient';
//
// const AuthContext = createContext({});
//
// export const AuthProvider = ({children}) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//
//   // Функція для отримання профілю (без зайвих ускладнень)
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data, error} = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', sessionUser.id)
//         .single();
//
//       if (error) return sessionUser; // Якщо профілю нема, повертаємо хоча б Auth дані
//       return {...sessionUser, ...data};
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//
//     const initializeAuth = async () => {
//       // 1. Отримуємо поточну сесію відразу
//       const {data: {session}} = await supabase.auth.getSession();
//
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//
//       // 2. ГАРАНТОВАНО вимикаємо завантаження
//       if (isMounted) setLoading(false);
//
//       // 3. Підписуємось на зміни (вхід/вихід)
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (_event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//         } else {
//           if (isMounted) setUser(null);
//         }
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
//     };
//   }, []);
//
//   return (
//     <AuthContext.Provider value={{user, loading, setUser}}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => useContext(AuthContext);


// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient';
// import { useDispatch } from 'react-redux';
// import { clearCartLocal } from '../redux/cart/cartSlice'; // Перевір шлях до слайсу
// import toast from 'react-hot-toast';
//
// const AuthContext = createContext({});
//
// export const AuthProvider = ({children}) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();
//
//   // Функція для отримання профілю
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data, error} = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', sessionUser.id)
//         .single();
//
//       if (error) return sessionUser;
//       return {...sessionUser, ...data};
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//     let isToastShown = false; // Захист від подвійних тостів
//
//     // 1. Одразу ловимо хеш (підтвердження пошти), поки Supabase його не затер
//     const isConfirmingEmail = window.location.hash.includes('type=signup') ||
//       window.location.hash.includes('access_token');
//
//     const initializeAuth = async () => {
//       // Отримуємо початкову сесію
//       const {data: {session}} = await supabase.auth.getSession();
//
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//
//       if (isMounted) setLoading(false);
//
//       // Підписуємось на всі зміни стану (вхід, вихід, зміна пароля тощо)
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//
//           // ЛОГІКА ТОСТЕРІВ ПРИ ПІДТВЕРДЖЕННІ ПОШТИ
//           if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && isConfirmingEmail && !isToastShown) {
//             isToastShown = true;
//             toast.success(
//               <div>
//                 <strong>Акаунт активовано!</strong><br/>
//                 Ласкаво просимо до Maxgear.
//               </div>,
//               {duration: 6000, icon: '✅'}
//             );
//             // Очищаємо URL від токенів
//             window.history.replaceState(null, null, window.location.pathname);
//           }
//         } else {
//           if (isMounted) setUser(null);
//         }
//
//         // ОЧИЩЕННЯ КОШИКА ПРИ ВИХОДІ
//         if (event === 'SIGNED_OUT') {
//           dispatch(clearCartLocal()); // Очищуємо Redux миттєво
//         }
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
//     };
//   }, [dispatch]);
//
//   return (
//     <AuthContext.Provider value={{user, loading, setUser}}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


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
//   // 1. Функція для отримання повних даних профілю з БД
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data, error} = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', sessionUser.id)
//         .single();
//
//       if (error) return sessionUser;
//       return {...sessionUser, ...data};
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   // 2. ЦЕНТРАЛІЗОВАНА функція виходу
//   const logout = async () => {
//     try {
//       const {error} = await supabase.auth.signOut();
//       if (error) throw error;
//
//       // Очищаємо стан миттєво
//       setUser(null);
//       dispatch(clearCartLocal());
//       toast.success("До зустрічі!");
//     } catch (error) {
//       toast.error("Помилка при виході");
//       console.error("Logout error:", error.message);
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//     let isToastShown = false;
//
//     const isConfirmingEmail = window.location.hash.includes('type=signup') ||
//       window.location.hash.includes('access_token');
//
//     const initializeAuth = async () => {
//       // Отримуємо початкову сесію
//       const {data: {session}} = await supabase.auth.getSession();
//
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//
//       if (isMounted) setLoading(false);
//
//       // Слухаємо зміни стану (вхід/вихід)
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//
//           // Тост при підтвердженні пошти
//           if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && isConfirmingEmail && !isToastShown) {
//             isToastShown = true;
//             toast.success(
//               <div><strong>Акаунт активовано!</strong><br/>Ласкаво просимо до Maxgear.</div>,
//               {duration: 6000, icon: '✅'}
//             );
//             window.history.replaceState(null, null, window.location.pathname);
//           }
//         } else {
//           if (isMounted) {
//             setUser(null);
//             // Важливо: очищуємо кошик, якщо сесія зникла (наприклад, видалили куки)
//             dispatch(clearCartLocal());
//           }
//         }
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
//     };
//   }, [dispatch]);
//
//   // Передаємо logout у value, щоб компоненти могли його викликати
//   return (
//     <AuthContext.Provider value={{user, loading, logout, setUser}}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => useContext(AuthContext);


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
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data} = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
//       return data ? {...sessionUser, ...data} : sessionUser;
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   // АГРЕСИВНИЙ ВИХІД
//   const logout = async () => {
//     try {
//       // 1. Спочатку миттєво чистимо інтерфейс, не чекаючи відповіді сервера
//       setUser(null);
//       dispatch(clearCartLocal());
//
//       // 2. Посилаємо запит на сервер
//       await supabase.auth.signOut();
//
//       toast.success("До зустрічі!");
//     } catch (error) {
//       console.error("Logout error:", error.message);
//       // Навіть якщо помилка на сервері, ми вже почистили локальний стан
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//     let isToastShown = false;
//
//     // ПЕРЕВІРКА: чи це активація через імейл (тип signup)
//     const isEmailActivation = window.location.hash.includes('type=signup');
//
//     const initializeAuth = async () => {
//       const {data: {session}} = await supabase.auth.getSession();
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//       if (isMounted) setLoading(false);
//
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//
//           // ЛОГІКА РОЗУМНИХ ТОСТІВ
//           if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !isToastShown) {
//             isToastShown = true;
//
//             if (isEmailActivation) {
//               // Варіант 1: Юзер прийшов з пошти (Активація)
//               toast.success(
//                 <div><strong>Акаунт активовано!</strong><br/>Ласкаво просимо до Maxgear.</div>,
//                 {duration: 6000, icon: '✅'}
//               );
//             } else if (event === 'SIGNED_IN') {
//               // Варіант 2: Звичайний вхід (Пароль або Google)
//               toast.success("З поверненням до Maxgear!", {icon: '👋'});
//             }
//
//             window.history.replaceState(null, null, window.location.pathname);
//           }
//         } else {
//           if (isMounted) setUser(null);
//           if (event === 'SIGNED_OUT') dispatch(clearCartLocal());
//         }
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
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
//   // Функція для отримання профілю
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const {data} = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
//       return data ? {...sessionUser, ...data} : sessionUser;
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   // АГРЕСИВНИЙ ВИХІД
//   const logout = async () => {
//     try {
//       // 1. Спочатку миттєво чистимо інтерфейс
//       setUser(null);
//       dispatch(clearCartLocal());
//
//       // 2. Посилаємо запит на сервер
//       await supabase.auth.signOut();
//
//       toast.success("До зустрічі!");
//     } catch (error) {
//       console.error("Logout error:", error.message);
//     }
//   };
//
//   useEffect(() => {
//     let isMounted = true;
//     let isActivationToastShown = false; // Окремий прапорець для активації
//
//     // ПЕРЕВІРКА: чи в URL є ознаки активації (type=signup)
//     const isEmailActivation = window.location.hash.includes('type=signup');
//
//     const initializeAuth = async () => {
//       // 1. Отримуємо початкову сесію
//       const {data: {session}} = await supabase.auth.getSession();
//
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//
//       if (isMounted) setLoading(false);
//
//       // 2. Слухаємо зміни стану
//       const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//
//           // --- ЛОГІКА РОЗУМНИХ ТОСТІВ ---
//
//           // СЦЕНАРІЙ А: Активація через імейл
//           if (isEmailActivation && !isActivationToastShown && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
//             isActivationToastShown = true;
//             toast.success(
//               <div><strong>Акаунт активовано!</strong><br/>Ласкаво просимо до Maxgear.</div>,
//               {duration: 6000, icon: '✅'}
//             );
//             // Очищаємо хеш в URL
//             window.history.replaceState(null, null, window.location.pathname);
//           }
//
//             // СЦЕНАРІЙ Б: Звичайний вхід (кнопка "Увійти" або Google)
//           // Спрацьовує тільки на SIGNED_IN і якщо це НЕ активація через пошту
//           else if (event === 'SIGNED_IN' && !isEmailActivation) {
//             toast.success("З поверненням до Maxgear!", {icon: '👋', duration: 3000});
//           }
//         } else {
//           if (isMounted) setUser(null);
//           // Очищення кошика при події виходу
//           if (event === 'SIGNED_OUT') dispatch(clearCartLocal());
//         }
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
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


// import { createContext, useContext, useEffect, useState, useRef } from 'react';
// import { supabase } from '../supabaseClient';
// import { useDispatch } from 'react-redux';
// import { clearCartLocal } from '../redux/cart/cartSlice';
// import toast from 'react-hot-toast';
//
// const AuthContext = createContext({});
//
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();
//
//   // Використовуємо ref для відстеження подій входу
//   const pendingToast = useRef(null);
//
//   const fetchFullUser = async (sessionUser) => {
//     if (!sessionUser) return null;
//     try {
//       const { data } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
//       return data ? { ...sessionUser, ...data } : sessionUser;
//     } catch {
//       return sessionUser;
//     }
//   };
//
//   const logout = async () => {
//     try {
//       setUser(null);
//       dispatch(clearCartLocal());
//       pendingToast.current = null;
//       await supabase.auth.signOut();
//       toast.success("До зустрічі!");
//     } catch (error) {
//       console.error("Logout error:", error.message);
//     }
//   };
//
//   // ОКРЕМИЙ ЕФЕКТ для показу тостів після того, як loading став false
//   useEffect(() => {
//     if (!loading && pendingToast.current) {
//       // Даємо 100мс, щоб Toaster точно встиг з'явитися в App.jsx
//       const timer = setTimeout(() => {
//         if (pendingToast.current === 'welcome') {
//           toast.success("З поверненням до Maxgear!");
//         } else if (pendingToast.current === 'activated') {
//           toast.success("Акаунт активовано! Ласкаво просимо.");
//         }
//         pendingToast.current = null; // Очищаємо, щоб не було дублів
//       }, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [loading]);
//
//   useEffect(() => {
//     let isMounted = true;
//
//     const initializeAuth = async () => {
//       // 1. Початкова перевірка сесії
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session?.user) {
//         const fullUser = await fetchFullUser(session.user);
//         if (isMounted) setUser(fullUser);
//       }
//       if (isMounted) setLoading(false);
//
//       // 2. Слухаємо зміни
//       const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//         const isActivation = window.location.hash.includes('type=signup');
//
//         if (session?.user) {
//           const fullUser = await fetchFullUser(session.user);
//           if (isMounted) setUser(fullUser);
//
//           if (event === 'SIGNED_IN') {
//             // Замість негайного тосту — ставимо "чергу"
//             pendingToast.current = isActivation ? 'activated' : 'welcome';
//
//             if (isActivation) {
//               window.history.replaceState(null, null, window.location.pathname);
//             }
//           }
//         } else {
//           if (isMounted) setUser(null);
//           if (event === 'SIGNED_OUT') dispatch(clearCartLocal());
//         }
//
//         // Гарантуємо, що loading вимкнеться
//         if (isMounted) setLoading(false);
//       });
//
//       return subscription;
//     };
//
//     const authSub = initializeAuth();
//     return () => {
//       isMounted = false;
//       authSub.then(sub => sub?.unsubscribe());
//     };
//   }, [dispatch]);
//
//   return (
//     <AuthContext.Provider value={{ user, loading, logout, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => useContext(AuthContext);