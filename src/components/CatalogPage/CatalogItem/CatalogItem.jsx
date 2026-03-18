import { useState } from 'react';
import styles from './CatalogItem.module.css';
import { Plus, Minus } from 'lucide-react';
import { getDeliveryTime, getSupplierName } from "../../../utils/helpers.js";
import CopyAction from '../../CopyAction/CopyAction.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.jsx';
import Loader from '../../Loader/Loader.jsx';


const CatalogItem = ({product, exchangeRate}) => {
  const {user} = useAuth();

  const deliveryTerm = getDeliveryTime(product.supplier_id);
  const supplierName = getSupplierName(product.supplier_id);

  // Розрахунки цін
  const priceEuro27 = (product.price_eur / 1.33 * 1.27).toFixed(2);
  const priceUah27 = (product.price_eur / 1.33 * 1.27 * exchangeRate).toFixed(0);

  // 1. Стан для вибору кількості (мінімум 1)
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Стан завантаження для кнопки

  console.log(product);

  // Функції для зміни кількості
  const increment = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };
  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };


// --- ГОЛОВНА ФУНКЦІЯ ДОДАВАННЯ ---
  const handleAddToCart = async () => {
    // 2. ДОДАНО: Перевірка авторизації
    if (!user) {
      toast.error("Будь ласка, увійдіть в акаунт, щоб додати товар у кошик", {
        icon: '🔐',
        duration: 5000
      });
      return;
    }

    setIsAdding(true);

    // Визначаємо URL бекенду
    const baseUrl = import.meta.env.VITE_API_URL || 'https://mg-autoparts-backend.onrender.com';

    // Формуємо об'єкт товару згідно з моделлю CartItemIn на бекенді
    const cartData = {
      user_id: user.id, // Поки що статика, потім візьмемо з Auth
      supplier_id: product.supplier_id,
      code: product.code,
      brand: product.brand,
      name: product.name,
      quantity: quantity,
      price_eur: parseFloat(priceEuro27) // Відправляємо ціну з твоєю націнкою
    };

    try {
      const response = await axios.post(`${baseUrl}/api/cart/`, cartData);

      // Отримуємо ту саму "кричущу" кількість з RETURNING quantity
      const {new_quantity} = response.data;

      // Замість alert використовуємо професійний toast
      toast.success(
        <div>
          <b>{product.brand} {product.code}</b> додано!<br/>
          Тепер у кошику: <b>{new_quantity} шт.</b>
        </div>,
        {
          duration: 4000,
          icon: '🛒',
          style: {border: '1px solid #4caf50', padding: '16px'}
        }
      );
    } catch (error) {
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
                disabled={product.stock === 0 || quantity <= 1}
                className={styles.qtyBtn}
              >
                <Minus size={12} strokeWidth={2}/>
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                readOnly
                className={styles.qtyInput}
              />

              <button
                onClick={increment}
                disabled={product.stock === 0 || quantity >= product.stock}
                className={styles.qtyBtn}
              >
                <Plus size={12} strokeWidth={2}/>
              </button>

            </div>

            {/* Оновлена кнопка */}
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding} // Блокуємо при завантаженні
            >
              {isAdding ? (
                'Додаю...'
              ) : product.stock === 0 ? (
                'Немає'
              ) : (
                'У кошик'
              )}
            </button>

          </div>

        </section>

      </div>
    </li>
  );
};

export default CatalogItem;