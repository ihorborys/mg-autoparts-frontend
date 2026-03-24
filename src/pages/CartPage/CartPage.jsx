import Container from "../../layouts/Container/Container.jsx";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
import styles from './CartPage.module.css';
import Button from "../../components/Button/Button.jsx";

const CartPage = () => {
  // Беремо товари та суму з Redux
  const {items, totalPriceEur} = useSelector((state) => state.cart);
  // Беремо курс із нашого нового "банку"
  const rate = useSelector((state) => state.currency.rate);

  const totalPriceUah = Math.round(totalPriceEur * rate);

  if (items.length === 0) {
    return (
      // 2. Огортаємо порожній стан
      <Container>
        <div className={styles.emptyContainer}>
          <h2 className={styles.emptyTitle}>У кошику порожньо 🛒</h2>
          <p className={styles.emptySubtitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
          <Link to="/catalog" className={styles.backBtn}>
            <Button>До каталогу</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={styles.container}>
        <h1 className={styles.title}>Моє замовлення</h1>

        <div className={styles.content}>
          {/* Список товарів */}
          <ul className={styles.list}>
            {items.map((item) => (
              <CartItem key={`${item.code}-${item.supplier_id}`} item={item}/>
            ))}
          </ul>

          {/* Панель підсумку (можна зробити Sticky) */}
          <div className={styles.summary}>
            <h3>Разом:</h3>
            <div className={styles.prices}>
              <span className={styles.eur}>{totalPriceEur.toLocaleString('uk-UA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
              </span>
              <span className={styles.uah}>{totalPriceUah.toLocaleString('uk-UA')} ₴</span>
            </div>
            <button className={styles.orderBtn}>Оформити замовлення</button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CartPage;