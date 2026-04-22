import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Container from "../../layouts/Container/Container.jsx";
import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
import Button from "../../components/Button/Button.jsx";
import { useAuth } from '../../context/AuthContext.jsx';
import { useHaptics } from "../../hooks/useHaptics.js";
import styles from './CartPage.module.css';
import CheckoutSidebar from "../../components/CartPage/CheckoutSidebar/CheckoutSidebar.jsx";
import { useState } from "react";


const CartPage = () => {
  const {user} = useAuth();
  const {items, totalPriceEur} = useSelector((state) => state.cart);
  const rate = useSelector((state) => state.currency.rate);
  const {trigger} = useHaptics();

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isCartDisabled, setIsCartDisabled] = useState(false);

  // Обчислюємо гривні тут тільки для передачі в Sidebar
  const totalPriceUah = Math.round(totalPriceEur * rate);

  // Якщо кошик порожній
  if (items.length === 0 && !orderSuccess) {
    return (
      <Container>
        <div className={styles.container}>
          <div className={styles.emptyContainer}>
            <h2 className={styles.title}>Кошик порожній 🛒</h2>
            <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
            <Link to="/catalog"><Button>До каталогу</Button></Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {orderSuccess ? 'Замовлення відправлене!' : 'Моє замовлення'}
        </h1>
        <div className={styles.content}>

          {/* ЛІВА ЧАСТИНА: ТОВАРИ (Залишається тут) */}
          <ul className={styles.list}>
            {/* Якщо успіх - список товарів зникає, залишається тільки сайдбар з "Готово" */}
            {/* Список товарів */}
            <div className={`${styles.cartItems} ${isCartDisabled ? styles.disabled : ''}`}>
              {!orderSuccess && items.map((item) => (
                <CartItem key={`${item.code}-${item.supplier_id}`} item={item}/>
              ))}
            </div>
          </ul>

          {/* ПРАВА ЧАСТИНА: САЙДБАР (Вся логіка тепер там) */}
          <CheckoutSidebar
            user={user}
            items={items}
            totalPriceEur={totalPriceEur}
            totalPriceUah={totalPriceUah}
            rate={rate}
            trigger={trigger}
            onLoading={setIsCartDisabled} // Передаємо функцію керування стейтом
            onSuccess={() => setOrderSuccess(true)}
          />

        </div>
      </div>
    </Container>
  );
};

export default CartPage;