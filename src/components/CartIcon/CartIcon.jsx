import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react'; // Додаємо хуки
import styles from './CartIcon.module.css';
import { useAuth } from "../../context/AuthContext.jsx";


const CartIcon = () => {
  const {user} = useAuth();
  const {items} = useSelector((state) => state.cart);

  // Рахуємо загальну кількість
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Стан для контролю анімації
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Референс для зберігання попереднього значення (щоб порівняти)
  const prevCountRef = useRef(totalCount);

  useEffect(() => {
    // Якщо поточна кількість не дорівнює попередній — значить, щось додали або видалили
    if (totalCount !== prevCountRef.current) {
      setShouldAnimate(true);
      prevCountRef.current = totalCount;

      // Прибираємо клас анімації через 300мс (час твоєї анімації в CSS)
      const timer = setTimeout(() => setShouldAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalCount]);

  if (!user) return null;


  return (
    <Link to="/cart" className={styles.cartBtn} title="Перейти до кошика">
      <div className={styles.iconWrapper}>
        <ShoppingCart size={24} strokeWidth={2}/>

        {totalCount > 0 && (
          <span
            key={totalCount} // Ключ змушує React перерендерити саме цей спан при зміні цифри
            className={`${styles.badge} ${shouldAnimate ? styles.pop : ''}`}
          >
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;