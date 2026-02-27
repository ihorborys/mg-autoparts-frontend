import { useState } from 'react';
import styles from './CatalogItem.module.css';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { getDeliveryTime } from "../../../utils/helpers.js";


const CatalogItem = ({product, exchangeRate}) => {
  const deliveryTerm = getDeliveryTime(product.supplier_id);
  const priceEuro27 = (product.price_eur / 1.33 * 1.27).toFixed(2);
  const priceUah27 = (product.price_eur / 1.33 * 1.27 * exchangeRate).toFixed(0);

  // 1. Стан для вибору кількості (мінімум 1)
  const [quantity, setQuantity] = useState(1);

  console.log(product);

  // Функції для зміни кількості
  const increment = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };
  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    // Тут ми будемо викликати функцію з Context
    console.log(`Додано в кошик: ${product.name}, кількість: ${quantity}`);
    alert(`Додано ${quantity} шт. товару ${product.code}`);
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
          <div className={styles.brandCodeImg}>
            <h4 className={styles.brand}>{product.brand}</h4>
            <p className={styles.code}>{product.code}</p>
            <p className={styles.unicode}>{product.unicode}</p>
            <img className={styles.image} src="/img/catalog/no_item.png" alt="No picture available"/>
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

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Немає' : 'У кошик'}
            </button>
          </div>

        </section>

      </div>
    </li>
  );
};

export default CatalogItem;