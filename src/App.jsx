import "./App.css";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "./redux/cart/cartOps";
import { Auth } from "./components/Auth/Auth.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Loader from "./components/Loader/Loader.jsx";
import { Toaster } from 'react-hot-toast';

// Ледаче завантаження
const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage/CatalogPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage/CartPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));
const HomeLayout = lazy(() => import("./layouts/HomeLayout/HomeLayout.jsx"));
const CatalogLayout = lazy(() => import("./layouts/CatalogLayout/CatalogLayout.jsx"));

function App() {
  const {user, loading} = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user?.id, dispatch]);

  return (
    <div>
      {/* 1. ВАЖЛИВО: Тостер тепер завжди змонтований.
          Це дозволяє йому показувати повідомлення навіть під час перемикання Loader -> Content */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '16px',
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      {loading ? (
        <Loader/>
      ) : (
        <Suspense fallback={<Loader/>}>
          <Routes>
            {/* 2. Чисті маршрути: лейаути самі беруть дані через useAuth() */}
            <Route path="/" element={<HomeLayout/>}>
              <Route index element={<HomePage/>}/>
            </Route>

            <Route element={<CatalogLayout/>}>
              <Route path="/catalog" element={user ? <CatalogPage/> : <Auth/>}/>
              <Route path="/cart" element={user ? <CartPage/> : <Auth/>}/>
            </Route>

            <Route path="*" element={<NotFoundPage/>}/>
          </Routes>
        </Suspense>
      )}
    </div>
  );
}

export default App;