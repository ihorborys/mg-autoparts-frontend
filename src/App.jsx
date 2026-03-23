import "./App.css";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react"; // Додали useEffect та useState
import { supabase } from "./supabaseClient"; // Імпортуємо твій клієнт
import { Auth } from "./components/Auth/Auth.jsx"; // Імпортуємо компонент авторизації
import Loader from "./components/Loader/Loader.jsx";
import toast, { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage/CatalogPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage/CartPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));

const HomeLayout = lazy(() => import("./layouts/HomeLayout/HomeLayout.jsx"));
const CatalogLayout = lazy(() => import("./layouts/CatalogLayout/CatalogLayout.jsx"));

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Прапорець, щоб не показувати тост двічі в одному циклі
    let isToastShown = false;

// 1. ОДРАЗУ зберігаємо стан хешу, поки Supabase його не прибрав
    const isConfirmingEmail = window.location.hash.includes('type=signup');

    // 1. Отримуємо сесію при завантаженні
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    // 2. Слухаємо зміни стану
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

// Перевіряємо SIGNED_IN або INITIAL_SESSION (перший вхід)
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && isConfirmingEmail && !isToastShown) {
        isToastShown = true; // Блокуємо повторний запуск сповіщення

        toast.success(
          <div>
            Акаунт активовано!
            <br/>
            Ласкаво просимо до Maxgear.
          </div>,
          {
            duration: 6000,
            icon: '✅'
          });

        // Очищаємо хеш, щоб тост не вискакував при кожному F5
        window.history.replaceState(null, null, window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();

  }, []); // Тут тепер все закрито правильно

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: '16px',
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Suspense fallback={<Loader/>}>
        <Routes>
          {/* Головна сторінка — доступна всім */}
          <Route path={"/"} element={<HomeLayout session={session}/>}>
            <Route index element={<HomePage/>}></Route>
          </Route>

          {/* ГРУПА МАГАЗИНУ (спільний Хедер для всього) */}
          <Route element={<CatalogLayout session={session}/>}>
            {/* /catalog */}
            <Route path="/catalog" element={session ? <CatalogPage/> : <Auth/>}/>

            {/* /cart — Тепер це окремий красивий шлях! */}
            <Route path="/cart" element={session ? <CartPage/> : <Auth/>}/>
          </Route>

          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;