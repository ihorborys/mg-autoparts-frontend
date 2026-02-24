import "./App.css";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react"; // Додали useEffect та useState
import { supabase } from "./supabaseClient"; // Імпортуємо твій клієнт
import { Auth } from "./components/Auth/Auth.jsx"; // Імпортуємо компонент авторизації
import Loader from "./components/Loader/Loader.jsx";
import toast, { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage/CatalogPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));

const HomeLayout = lazy(() => import("./layouts/HomeLayout/HomeLayout.jsx"));
const CatalogLayout = lazy(() => import("./layouts/CatalogLayout/CatalogLayout.jsx"));

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {

    console.log("Повна адреса при завантаженні:", window.location.href);
    console.log("Хеш адреси:", window.location.hash);
    
    // 1. Отримуємо сесію при завантаженні
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    // 2. Слухаємо зміни стану
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // --- ЛОГІКА ТОСТЕРА ТЕПЕР ВСЕРЕДИНІ СЛУХАЧА ---
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=signup')) {
        toast.success("Пошту підтверджено! Реєстрація успішна!", {});
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

          {/* Сторінка каталогу — ЗАХИЩЕНА */}
          <Route path={"/catalog"} element={<CatalogLayout session={session}/>}>
            {/* Якщо сесія є — показуємо каталог, якщо ні — форму входу */}
            <Route index element={session ? <CatalogPage/> : <Auth/>}></Route>
          </Route>

          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;