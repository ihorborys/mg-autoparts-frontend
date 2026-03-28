import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus } from 'lucide-react';
import { updateCartQuantity, removeFromCart } from '../../../redux/cart/cartOps.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import styles from './CartItem.module.css';
import { getSupplierName } from "../../../utils/helpers.js";
import toast from "react-hot-toast";
import { useHaptics } from "../../../hooks/useHaptics.js";

const CartItem = ({item}) => {
  const dispatch = useDispatch();
  const {user} = useAuth();
  const rate = useSelector((state) => state.currency.rate);
  const supplierName = getSupplierName(item.supplier_id);
// Запобіжник: якщо стоку немає в об'єкті, вважаємо його нульовим
  const maxStock = item.stock ?? 0;
  const {trigger} = useHaptics();

  // const {items} = useSelector((state) => state.products);

  // console.log(item);

  // console.log(item);

  // Функція зміни кількості
  const changeQty = (newQty) => {
    if (newQty < 1) return;

    // 2. Верхня межа (Перевірка по стоку)
    if (newQty > item.stock) {
      toast.error(`На складі лише ${item.stock} шт.`, {
        id: `cart-limit-${item.code}`, // Унікальний ID, щоб не спамити
      });
      return;
    }

    // console.log(newQty);

    dispatch(updateCartQuantity({
      user_id: user.id,
      supplier_id: item.supplier_id,
      code: item.code,
      quantity: newQty
    }));

    trigger('tick');
  };


  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <p className={styles.brand}>{item.brand}</p>
        <p className={styles.code}>{item.code}</p>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.supplier}>{supplierName}</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.qtyStockInfo}>
          <div className={styles.qtySelectors}>

            {/*<button onClick={() => changeQty(item.quantity - 1)}><Minus size={14}/></button>*/}
            {/*<span>{item.quantity}</span>*/}
            {/*<button onClick={() => changeQty(item.quantity + 1)}><Plus size={14}/></button>*/}

            {/*<button*/}
            {/*  onClick={() => changeQty(item.quantity - 1)}*/}
            {/*  disabled={item.quantity <= 1}*/}
            {/*>*/}
            {/*  <Minus size={14}/>*/}
            {/*</button>*/}

            {/*<span className={styles.qtyValue}>{item.quantity}</span>*/}

            {/*<button*/}
            {/*  onClick={() => changeQty(item.quantity + 1)}*/}
            {/*  // Блокуємо кнопку, якщо вже досягли ліміту складу*/}
            {/*  disabled={item.quantity >= item.stock}*/}
            {/*>*/}
            {/*  <Plus size={14}/>*/}
            {/*</button>*/}

            {/* Кнопка МІНУС: блокуємо, якщо кількість вже 1 */}
            <button
              onClick={() => changeQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={styles.qtyBtn}
            >
              <Minus size={14}/>
            </button>

            <span className={styles.qtyValue}>{item.quantity}</span>

            {/* Кнопка ПЛЮС: блокуємо, якщо досягли ліміту складу */}
            <button
              onClick={() => changeQty(item.quantity + 1)}
              disabled={item.quantity >= maxStock}
              className={styles.qtyBtn}
            >
              <Plus size={14}/>
            </button>

          </div>
          {/* Можна додати інфо про залишок для зручності */}
          <small className={styles.stockInfo}>Залишок: {item.stock} шт.</small>
        </div>


        <div className={styles.itemTotal}>
          <p>{(item.price_eur * item.quantity).toLocaleString('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} €
          </p>
          <p
            className={styles.uahSub}>
            {Math.round(item.price_eur * item.quantity * rate).toLocaleString('uk-UA')} ₴
          </p>
        </div>

        <button
          className={styles.remove}
          onClick={() =>
            dispatch(removeFromCart({user_id: user.id, supplier_id: item.supplier_id, code: item.code}))
          }
        >
          <Trash2 size={18}/>
        </button>
      </div>
    </li>
  );
};

export default CartItem;