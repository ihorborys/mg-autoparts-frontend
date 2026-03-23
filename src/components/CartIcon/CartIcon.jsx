import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import styles from './CartIcon.module.css';
import { useAuth } from "../../context/AuthContext.jsx";

const CartIcon = () => {
  const {user} = useAuth(); // <--- Перевіряємо, чи є юзер
  // Дістаємо масив товарів із нашого Redux-сховища
  const {items} = useSelector((state) => state.cart);

  // Якщо юзера немає — компонент просто нічого не малює (іконка зникає)
  if (!user) return null;

  // Рахуємо загальну кількість одиниць товару
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className={styles.cartBtn} title="Перейти до кошика">
      <div className={styles.iconWrapper}>
        <ShoppingCart size={24} strokeWidth={2}/>

        {/* Показуємо бабл тільки якщо кількість > 0 */}
        {totalCount > 0 && (
          <span className={styles.badge}>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;