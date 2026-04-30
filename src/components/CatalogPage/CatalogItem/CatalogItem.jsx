import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Додаємо Redux хуки
import styles from './CatalogItem.module.css';
import { Plus, Minus } from 'lucide-react';
import { getDeliveryTime, getSupplierName } from "../../../utils/helpers.js";
import CopyAction from '../../CopyAction/CopyAction.jsx';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useHaptics } from '../../../hooks/useHaptics';
import { addToCart, fetchCart } from '../../../redux/cart/cartOps';


const CatalogItem = ({product}) => {
  const {user} = useAuth();
  const {trigger} = useHaptics();
  const dispatch = useDispatch();

  // 1. БЕРЕМО КУРС ПРЯМО З REDUX
  const exchangeRate = useSelector((state) => state.currency.rate);

  // Отримуємо список товарів з Redux стору кошика
  const cartItems = useSelector((state) => state.cart.items);
  // Знаходимо саме цей товар у кошику
  const itemInCart = cartItems.find(item =>
    item.code === product.code && item.brand === product.brand
  );
  // Скільки вже додано (якщо немає — 0)
  const alreadyInCartQty = itemInCart ? itemInCart.quantity : 0;
// Скільки ще МОЖНА додати (залишок - те що в кошику)
  const availableToAdd = product.stock - alreadyInCartQty;

  const deliveryTerm = getDeliveryTime(product.supplier_id);
  const supplierName = getSupplierName(product.supplier_id);

  // Розрахунки цін
  const priceEuro27 = (product.price_eur / 1.33 * 1.27).toFixed(2);
  const priceUah27 = (product.price_eur / 1.33 * 1.27 * exchangeRate).toFixed(0);

  // 1. Стан для вибору кількості (мінімум 1)
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Стан завантаження для кнопки

  const increment = () => {
    // Тепер ліміт — це не весь склад, а те, що залишилося вільним
    if (quantity < availableToAdd) {
      setQuantity(prev => prev + 1);
      trigger('tick');
    } else {
      toast.error(`Можна додати максимум (${product.stock} шт.) у кошик`, {id: 'limit-reach'});
    }
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
    trigger('tick'); // Вібруємо при кожному натисканні -
  };


// --- ОНОВЛЕНА ФУНКЦІЯ ДОДАВАННЯ ЧЕРЕЗ REDUX ---
  const handleAddToCart = async () => {

    // console.log("DEBUG Product object:", product);
    if (!user) {
      toast.error("Будь ласка, увійдіть в акаунт, щоб додати товар у кошик", {
        icon: '🔐',
        duration: 5000
      });
      return;
    }

    setIsAdding(true);

    // Формуємо об'єкт товару згідно з моделлю CartItemIn на бекенді
    const cartData = {
      user_id: user.id,
      product_id: product.id,
      supplier_id: product.supplier_id,
      code: product.code,
      brand: product.brand,
      name: product.name,
      quantity: quantity,
      price_eur: parseFloat(priceEuro27) // Відправляємо ціну з твоєю націнкою
    };

    try {
// 2. ВИКЛИКАЄМО ОПЕРАЦІЮ REDUX
      // .unwrap() дозволяє нам обробити успіх/помилку прямо тут для тостів
      const result = await dispatch(addToCart(cartData)).unwrap();

      // --- ОСЬ ЦЕЙ ВАЖЛИВИЙ РЯДОК (ВАРІАНТ Б) ---
      // Після успішного додавання ми заново тягнемо весь кошик.
      // Наш новий SQL-запит на бекенді відразу підтягне актуальний stock
      // через оптимізований JOIN з індексом.
      dispatch(fetchCart(user.id));

      // --- ДОДАЄМО ВІБРАЦІЮ ТУТ ---
      trigger('success'); // Вібруємо, коли товар успішно в базі!
      toast.success(
        <div>
          <b>{product.brand} {product.code}</b> додано!<br/>
          Тепер у кошику: <b>{result.quantity} шт.</b>
        </div>,
        {
          duration: 4000,
          icon: '🛒',
          style: {border: '1px solid #4caf50', padding: '16px'},
          position: 'bottom-center',
        }
      );
    } catch (error) {
      trigger('error'); // Вібруємо, якщо щось зламалося
      console.error("Помилка кошика:", error);
      toast.error("Не вдалося додати товар. Перевірте з'єднання.");
    } finally {
      setIsAdding(false);
    }
  };


  const stockColorClass = product.stock === 0
    ? styles.outOfStock
    : product.stock < 5
      ? styles.lowStock
      : styles.goodStock;


  return (
    <li className={styles.wrapper}>
      <div className={styles.container}>

        {/* Секція 1: Бренд, Код, Unicode, Фото, Назва товару */}
        <section className={styles.info}>
          <div className={styles.infoContainer}>
            <img className={styles.image} src="/img/catalog/no_item.png" alt="No picture available"/>

            <div className={styles.brandCodeContainer}>
              <h4 className={styles.brand}>{product.brand}</h4>
              <CopyAction text={product.code} label="артикул">
                <p className={styles.code}>{product.code}</p>
              </CopyAction>
              <p className={styles.unicode}>{product.unicode}</p>
              <p className={styles.supplier}><span>{supplierName}</span></p>
            </div>

          </div>
          <p className={styles.name}>{product.name}</p>
        </section>

        {/* Секція 2: Склад, Ціна, Кнопки вибору та Кошик */}
        <section className={styles.actions}>
          <div className={styles.stockPrice}>
            <p className={`${styles.stock} ${stockColorClass}`}>
              {product.stock === 0 ? 'Немає' : `${product.stock} шт.`}
            </p>
            <p className={styles.delivery}><span>{deliveryTerm} днів</span></p>
          </div>

          <div className={styles.stockPrice}>
            <p className={styles.price}>
              {priceEuro27} €
            </p>
            <p className={styles.price}>
              {priceUah27} ₴
            </p>
          </div>

          <div className={styles.controlsBasket}>
            <div className={styles.quantityControls}>

              <button
                onClick={decrement}
                disabled={product.stock === 0 || quantity <= 1 || availableToAdd <= 0}
                className={styles.qtyBtn}
              >
                <Minus size={12} strokeWidth={2}/>
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={availableToAdd <= 0 ? alreadyInCartQty : quantity}
                readOnly
                className={styles.qtyInput}
                // Додамо трохи прозорості, якщо поле неактивне
                style={availableToAdd <= 0 ? {opacity: 0.5} : {}}
              />

              <button
                onClick={increment}
                disabled={product.stock === 0 || quantity >= availableToAdd || availableToAdd <= 0}
                className={styles.qtyBtn}
              >
                <Plus size={12} strokeWidth={2}/>
              </button>

            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding || availableToAdd <= 0}
            >
              {isAdding ? 'Додаю...' : availableToAdd <= 0 ? 'У кошику' : 'У кошик'}
            </button>

          </div>

        </section>

      </div>
    </li>
  );
};

export default CatalogItem;