// // src/App.jsx
// import "./App.css";
// import { Route, Routes } from "react-router-dom";
// import { lazy, Suspense } from "react";
// import Loader from "./components/Loader/Loader.jsx";
// import { Toaster } from 'react-hot-toast';
//
// // Імпортуємо тільки потрібні сторінки
// // Я прибрав штучну затримку (setTimeout) для HomePage, вона не потрібна в реальному проєкті
// const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
// const CatalogPage = lazy(() => import("./pages/CatalogPage/CatalogPage.jsx"));
// const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));
//
// // Імпортуємо тільки потрібні лейаути
// const HomeLayout = lazy(() => import("./layouts/HomeLayout/HomeLayout.jsx"));
// const CatalogLayout = lazy(() => import("./layouts/CatalogLayout/CatalogLayout.jsx"));
//
// function App() {
//   return (
//     <div>
//
//        <Toaster
//         position="top-center"
//         reverseOrder={false}
//         toastOptions={{
//           style: {
//             fontSize: '16px',
//             borderRadius: '8px',
//             background: '#333',
//             color: '#fff',
//           },
//         }}
//       />
//
//       <Suspense fallback={<Loader/>}>
//         <Routes>
//           {/* Головна сторінка */}
//           <Route path={"/"} element={<HomeLayout/>}>
//             <Route index element={<HomePage/>}></Route>
//           </Route>
//
//           {/* Сторінка каталогу запчастин */}
//           <Route path={"/catalog"} element={<CatalogLayout/>}>
//             {/* Зверніть увагу: тут шлях "index", а не дублювання "/catalog" */}
//             <Route index element={<CatalogPage/>}></Route>
//           </Route>
//
//           {/* Сторінка 404 */}
//           <Route path="*" element={<NotFoundPage/>}/>
//         </Routes>
//       </Suspense>
//     </div>
//   );
// }
//
// export default App;


import "./App.css";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react"; // Додали useEffect та useState
import { supabase } from "./supabaseClient"; // Імпортуємо твій клієнт
import { Auth } from "./components/Auth"; // Імпортуємо компонент авторизації
import Loader from "./components/Loader/Loader.jsx";
import { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage/CatalogPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));

const HomeLayout = lazy(() => import("./layouts/HomeLayout/HomeLayout.jsx"));
const CatalogLayout = lazy(() => import("./layouts/CatalogLayout/CatalogLayout.jsx"));

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Отримуємо поточну сесію при завантаженні
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Слухаємо зміни стану (вхід/вихід)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Route path={"/"} element={<HomeLayout/>}>
            <Route index element={<HomePage/>}></Route>
          </Route>

          {/* Сторінка каталогу — ЗАХИЩЕНА */}
          <Route path={"/catalog"} element={<CatalogLayout/>}>
            {/* Якщо сесія є — показуємо каталог, якщо ні — форму входу */}
            <Route index element={session ? <CatalogPage/> : <Auth />}></Route>
          </Route>

          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;