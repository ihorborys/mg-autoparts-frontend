import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './CatalogItem.module.css';
import { Plus, Minus } from 'lucide-react';
import { getDeliveryTime, getSupplierName } from "../../../utils/helpers.js";
import CopyAction from '../../CopyAction/CopyAction.jsx';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useHaptics } from '../../../hooks/useHaptics';
import { addToCart } from '../../../redux/cart/cartOps';

const CatalogItem = ({product}) => {
  const {user} = useAuth();
  const {trigger} = useHaptics();
  const dispatch = useDispatch();

  const exchangeRate = useSelector((state) => state.currency.rate);

  // 1. ОТРИМУЄМО ДАНІ З КОШИКА ДЛЯ ПЕРЕВІРКИ ЛІМІТІВ
  const cartItems = useSelector((state) => state.cart.items);
  const itemInCart = cartItems.find(
    (item) =>
      item.code === product.code &&
      item.supplier_id === product.supplier_id &&
      item.brand === product.brand
  );

  const alreadyInCart = itemInCart ? itemInCart.quantity : 0;
  const maxCanAdd = product.stock - alreadyInCart;

  const deliveryTerm = getDeliveryTime(product.supplier_id);
  const supplierName = getSupplierName(product.supplier_id);

  const priceEuro27 = (product.price_eur / 1.33 * 1.27).toFixed(2);
  const priceUah27 = (product.price_eur / 1.33 * 1.27 * exchangeRate).toFixed(0);

  // Стан для вибору кількості (якщо maxCanAdd 0, то і вибір 0)
  const [quantity, setQuantity] = useState(maxCanAdd > 0 ? 1 : 0);
  const [isAdding, setIsAdding] = useState(false);

  // Скидаємо кількість до 1, якщо місце в кошику звільнилося, або до 0, якщо заповнилося
  useEffect(() => {
    if (maxCanAdd > 0 && quantity === 0) setQuantity(1);
    if (maxCanAdd <= 0 && quantity > 0) setQuantity(0);
    if (quantity > maxCanAdd && maxCanAdd > 0) setQuantity(maxCanAdd);
  }, [maxCanAdd]);

  const increment = () => {
    if (quantity < maxCanAdd) {
      setQuantity(prev => prev + 1);
      trigger('tick');
    } else {
      toast.error(`Більше немає на складі (${product.stock} шт. макс)`, {id: 'limit'});
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      trigger('tick');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Будь ласка, увійдіть в акаунт", {icon: '🔐'});
      return;
    }

    setIsAdding(true);

    const cartData = {
      user_id: user.id,
      supplier_id: product.supplier_id,
      code: product.code,
      brand: product.brand,
      name: product.name,
      quantity: quantity,
      price_eur: parseFloat(priceEuro27)
    };

    try {
      const result = await dispatch(addToCart(cartData)).unwrap();

      const updatedQty = result.quantity;

      trigger('success');

      // ПЕРЕВІРКА: чи реально додалося щось (порівнюємо з тим, що було в Redux)
      if (updatedQty === alreadyInCart) {
        toast.error(`Вже додано максимум (${updatedQty} шт.)`, {icon: '⚠️'});
      } else {
        toast.success(
          <div>
            <b>{product.brand} {product.code}</b> оновлено!<br/>
            У кошику: <b>{updatedQty} шт.</b>
          </div>,
          {icon: '🛒', position: 'bottom-center'}
        );
      }
    } catch (error) {
      trigger('error');
      toast.error("Помилка при додаванні");
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
        <section className={styles.info}>
          <div className={styles.infoContainer}>
            <img className={styles.image} src="/img/catalog/no_item.png" alt="No item"/>
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

        <section className={styles.actions}>
          <div className={styles.stockPrice}>
            <p className={`${styles.stock} ${stockColorClass}`}>
              {product.stock === 0 ? 'Немає' : `${product.stock} шт.`}
            </p>
            <p className={styles.delivery}><span>{deliveryTerm} днів</span></p>
          </div>

          <div className={styles.stockPrice}>
            <p className={styles.price}>{priceEuro27} €</p>
            <p className={styles.price}>{priceUah27} ₴</p>
          </div>

          <div className={styles.controlsBasket}>
            <div className={styles.quantityControls}>
              <button
                onClick={decrement}
                disabled={quantity <= 1 || maxCanAdd <= 0}
                className={styles.qtyBtn}
              >
                <Minus size={12} strokeWidth={2}/>
              </button>

              <input
                type="text"
                value={quantity}
                readOnly
                className={styles.qtyInput}
              />

              <button
                onClick={increment}
                disabled={quantity >= maxCanAdd || maxCanAdd <= 0}
                className={styles.qtyBtn}
              >
                <Plus size={12} strokeWidth={2}/>
              </button>
            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              // Кнопка стає сірою, якщо: товару 0 в базі АБО вже набрали весь сток у кошик
              disabled={product.stock === 0 || isAdding || maxCanAdd <= 0}
            >
              {isAdding ? (
                'Додаю...'
              ) : product.stock === 0 ? (
                'Немає'
              ) : maxCanAdd <= 0 ? (
                'У кошику'
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