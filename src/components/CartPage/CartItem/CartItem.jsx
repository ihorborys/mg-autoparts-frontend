import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus } from 'lucide-react';
import { updateCartQuantity, removeFromCart } from '../../../redux/cart/cartOps.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import styles from './CartItem.module.css';

const CartItem = ({item}) => {
  const dispatch = useDispatch();
  const {user} = useAuth();
  console.log("Поточний юзер:", user?.id); // Перевір, чи тут не null
  const rate = useSelector((state) => state.currency.rate);

  // Функція зміни кількості
  const changeQty = (newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartQuantity({
      user_id: user.id,
      supplier_id: item.supplier_id,
      code: item.code,
      quantity: newQty
    }));
  };

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <p className={styles.brand}>{item.brand}</p>
        <p className={styles.code}>{item.code}</p>
        <p className={styles.name}>{item.name}</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.qtySelectors}>
          <button onClick={() => changeQty(item.quantity - 1)}><Minus size={14}/></button>
          <span>{item.quantity}</span>
          <button onClick={() => changeQty(item.quantity + 1)}><Plus size={14}/></button>
        </div>

        <div className={styles.itemTotal}>
          <p>{(item.price_eur * item.quantity).toFixed(2)} €</p>
          <p className={styles.uahSub}>{(item.price_eur * item.quantity * rate).toFixed(0)} ₴</p>
        </div>

        <button
          className={styles.remove}
          onClick={() => dispatch(removeFromCart({user_id: user.id, supplier_id: item.supplier_id, code: item.code}))}
        >
          <Trash2 size={18}/>
        </button>
      </div>
    </li>
  );
};

export default CartItem;