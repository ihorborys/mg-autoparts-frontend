// import Container from "../../layouts/Container/Container.jsx";
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
// import styles from './CartPage.module.css';
// import Button from "../../components/Button/Button.jsx";
//
// const CartPage = () => {
//   // Беремо товари та суму з Redux
//   const {items, totalPriceEur} = useSelector((state) => state.cart);
//   // Беремо курс із нашого нового "банку"
//   const rate = useSelector((state) => state.currency.rate);
//
//   const totalPriceUah = Math.round(totalPriceEur * rate);
//
//   if (items.length === 0) {
//     return (
//       // 2. Огортаємо порожній стан
//       <Container>
//         <div className={styles.container}>
//           <div className={styles.emptyContainer}>
//             <h2 className={styles.title}>Кошик порожній 🛒</h2>
//             <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
//             <Link to="/catalog" className={styles.backBtn}>
//               <Button>До каталогу</Button>
//             </Link>
//           </div>
//         </div>
//       </Container>
//     );
//   }
//
//   return (
//     <Container>
//       <div className={styles.container}>
//         <h1 className={styles.title}>Моє замовлення</h1>
//
//         <div className={styles.content}>
//           {/* Список товарів */}
//           <ul className={styles.list}>
//             {items.map((item) => (
//               <CartItem key={`${item.code}-${item.supplier_id}-${item.brand}`} item={item}/>
//             ))}
//           </ul>
//
//           {/* Панель підсумку (можна зробити Sticky) */}
//           <div className={styles.summary}>
//             <h3>Разом:</h3>
//             <div className={styles.prices}>
//               <span className={styles.eur}>{totalPriceEur.toLocaleString('uk-UA', {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2
//               })} €
//               </span>
//               <span className={styles.uah}>{totalPriceUah.toLocaleString('uk-UA')} ₴</span>
//             </div>
//             <button className={styles.orderBtn}>Оформити замовлення</button>
//           </div>
//         </div>
//       </div>
//     </Container>
//   );
// };
//
// export default CartPage;

// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import InputMask from 'react-input-mask'; // 1. Імпортуємо маску
// import Container from "../../layouts/Container/Container.jsx";
// import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
// import Button from "../../components/Button/Button.jsx";
// import { useAuth } from '../../context/AuthContext.jsx';
// import { useHaptics } from "../../hooks/useHaptics.js";
// import toast from "react-hot-toast";
// import styles from './CartPage.module.css';
//
// const CartPage = () => {
//   const {user} = useAuth();
//   // Беремо товари та суму з Redux
//   const {items, totalPriceEur} = useSelector((state) => state.cart);
//   // Беремо курс із нашого нового "банку"
//   const rate = useSelector((state) => state.currency.rate);
//   const {trigger} = useHaptics();
//
//   const [step, setStep] = useState('summary');
//   const [phone, setPhone] = useState(user?.phone || ''); // Маска сама додасть префікс
//   const [address, setAddress] = useState(user?.address || '');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//
//   const totalPriceUah = Math.round(totalPriceEur * rate);
//
//   if (items.length === 0) {
//     return (
//       // 2. Огортаємо порожній стан
//       <Container>
//         <div className={styles.container}>
//           <div className={styles.emptyContainer}>
//             <h2 className={styles.title}>Кошик порожній 🛒</h2>
//             <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
//             <Link to="/catalog" className={styles.backBtn}>
//               <Button>До каталогу</Button>
//             </Link>
//           </div>
//         </div>
//       </Container>
//     );
//   }
//
//   return (
//     <Container>
//       <div className={styles.container}>
//         <h1 className={styles.title}>Моє замовлення</h1>
//
//         <div className={styles.content}>
//           {/* Список товарів */}
//           <ul className={styles.list}>
//             {items.map((item) => (
//               <CartItem key={`${item.code}-${item.supplier_id}-${item.brand}`} item={item}/>
//             ))}
//           </ul>
//
//           {/* Панель підсумку (можна зробити Sticky) */}
//           <div className={styles.summary}>
//             <h3>Разом:</h3>
//             <div className={styles.prices}>
//               <span className={styles.eur}>{totalPriceEur.toLocaleString('uk-UA', {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2
//               })} €
//               </span>
//               <span className={styles.uah}>{totalPriceUah.toLocaleString('uk-UA')} ₴</span>
//             </div>
//             <button className={styles.orderBtn}>Оформити замовлення</button>
//           </div>
//         </div>
//       </div>
//     </Container>
//   );
// };
//
// export default CartPage;


// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import InputMask from 'react-input-mask'; // 1. Імпортуємо маску
// import Container from "../../layouts/Container/Container.jsx";
// import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
// import Button from "../../components/Button/Button.jsx";
// import { useAuth } from '../../context/AuthContext.jsx';
// import { useHaptics } from "../../hooks/useHaptics.js";
// import toast from "react-hot-toast";
// import styles from './CartPage.module.css';
//
// const CartPage = () => {
//   const {user} = useAuth();
//   const {items, totalPriceEur} = useSelector((state) => state.cart);
//   const rate = useSelector((state) => state.currency.rate);
//   const {trigger} = useHaptics();
//
//   const [step, setStep] = useState('summary');
//   const [phone, setPhone] = useState(user?.phone || ''); // Маска сама додасть префікс
//   const [address, setAddress] = useState(user?.address || '');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//
//   const totalPriceUah = Math.round(totalPriceEur * rate);
//
//   // 2. ВАЛІДАЦІЯ: тепер ми перевіряємо "чистий" номер (тільки цифри)
//   // Нам потрібно 12 цифр для формату 380XXXXXXXXX
//   const cleanPhone = phone.replace(/\D/g, ''); // Видаляємо все, крім цифр
//   const isPhoneValid = cleanPhone.length === 12;
//   const isFormValid = isPhoneValid && address.trim().length > 5;
//
//   const handleFinalOrder = async () => {
//     setIsSubmitting(true);
//     try {
//       // Відправляємо на сервер "чистий" номер без дужок
//       console.log("Order Data:", {phone: cleanPhone, address});
//
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       setStep('success');
//       trigger('success');
//     } catch (error) {
//       toast.error("Помилка оформлення");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   if (items.length === 0 && step !== 'success') {
//     return (
//       <Container>
//         <div className={styles.container}>
//           <div className={styles.emptyContainer}>
//             <h2 className={styles.title}>Кошик порожній 🛒</h2>
//             <Link to="/catalog"><Button>До каталогу</Button></Link>
//           </div>
//         </div>
//       </Container>
//     );
//   }
//
//   return (
//     <Container>
//       <div className={styles.container}>
//         <h1 className={styles.title}>
//           {step === 'success' ? 'Замовлення прийнято' : 'Моє замовлення'}
//         </h1>
//
//         <div className={styles.content}>
//           <ul className={styles.list}>
//             {items.map((item) => (
//               <CartItem key={`${item.code}-${item.supplier_id}`} item={item}/>
//             ))}
//           </ul>
//
//           <div className={styles.summary}>
//             {step === 'summary' && (
//               <div className={styles.animateFade}>
//                 <h3>Разом:</h3>
//                 <div className={styles.prices}>
//                   <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//                   <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//                 </div>
//                 <button className={styles.orderBtn} onClick={() => setStep('checkout')}>
//                   Оформити замовлення
//                 </button>
//               </div>
//             )}
//
//             {step === 'checkout' && (
//               <div className={styles.animateFade}>
//                 <h3 className={styles.checkoutTitle}>Контакти</h3>
//
//                 <div className={styles.field}>
//                   <label>Телефон *</label>
//                   {/* 3. ВИКОРИСТАННЯ МАСКИ */}
//                   <InputMask
//                     mask="+38 (099) 999-99-99"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                   >
//                     {(inputProps) => (
//                       <input
//                         {...inputProps}
//                         type="tel"
//                         className={`${styles.input} ${!isPhoneValid && cleanPhone.length > 3 ? styles.error : ''}`}
//                         placeholder="+38 (0__) ___-__-__"
//                       />
//                     )}
//                   </InputMask>
//                 </div>
//
//                 <div className={styles.field}>
//                   <label>Адреса доставки *</label>
//                   <textarea
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     className={styles.textarea}
//                     placeholder="Місто, № відділення або адреса"
//                   />
//                 </div>
//
//                 <button
//                   className={styles.confirmBtn}
//                   onClick={handleFinalOrder}
//                   disabled={!isFormValid || isSubmitting}
//                 >
//                   {isSubmitting ? 'Відправка...' : 'Підтвердити'}
//                 </button>
//                 <button className={styles.backLink} onClick={() => setStep('summary')}>
//                   Назад
//                 </button>
//               </div>
//             )}
//
//             {/* ... блок успіху success аналогічний минулому ... */}
//           </div>
//         </div>
//       </div>
//     </Container>
//   );
// };
//
// export default CartPage;


import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputMask } from '@react-input/mask';
import Container from "../../layouts/Container/Container.jsx";
import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
import Button from "../../components/Button/Button.jsx";
import { useAuth } from '../../context/AuthContext.jsx';
import { useHaptics } from "../../hooks/useHaptics.js";
import toast from "react-hot-toast";
import styles from './CartPage.module.css';

const CartPage = () => {
  const {user} = useAuth();
  const {items, totalPriceEur} = useSelector((state) => state.cart);
  const rate = useSelector((state) => state.currency.rate);
  const {trigger} = useHaptics();

  const [step, setStep] = useState('summary');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPriceUah = Math.round(totalPriceEur * rate);

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 12;
  const isFormValid = isPhoneValid && address.trim().length > 5;

  const handleFinalOrder = async () => {
    setIsSubmitting(true);
    try {
      console.log("Відправка замовлення:", {phone: cleanPhone, address, items});

      await new Promise(resolve => setTimeout(resolve, 1500));

      setStep('success'); // ОСЬ ТУТ ПЕРЕМИКАЄМО НА УСПІХ
      trigger('success');
      toast.success("Замовлення оформлено!");
    } catch (error) {
      toast.error("Помилка оформлення");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Порожній кошик показуємо тільки якщо замовлення ще не оформлене
  if (items.length === 0 && step !== 'success') {
    return (
      <Container>
        <div className={styles.container}>
          <div className={styles.emptyContainer}>
            <h2 className={styles.title}>Кошик порожній 🛒</h2>
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
          {step === 'success' ? 'Замовлення прийнято!' : 'Моє замовлення'}
        </h1>

        <div className={styles.content}>
          <ul className={styles.list}>
            {items.map((item) => (
              <CartItem key={`${item.code}-${item.supplier_id}`} item={item}/>
            ))}
          </ul>

          <div className={styles.summary}>
            {/* КРОК 1: ПІДСУМОК */}
            {step === 'summary' && (
              <div className={styles.animateFade}>
                <h3>Разом:</h3>
                <div className={styles.prices}>
                  <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
                  <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
                </div>
                <button
                  className={styles.orderBtn}
                  onClick={() => {
                    setStep('checkout'); // ПЕРЕМИКАЄМО НА ФОРМУ
                    trigger('tick');
                  }}
                >
                  Оформити замовлення
                </button>
              </div>
            )}

            {/* КРОК 2: ФОРМА ОФОРМЛЕННЯ */}
            {step === 'checkout' && (
              <div className={styles.animateFade}>
                <h3 className={styles.checkoutTitle}>Контакти</h3>

                <div className={styles.field}>
                  <label>Телефон *</label>
                  <InputMask
                    mask="+38 (0__) ___-__-__"
                    replacement={{_: /\d/}} // Кажемо, що символ "_" замінюється на цифру
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${styles.input} ${!isPhoneValid && cleanPhone.length > 3 ? styles.error : ''}`}
                    placeholder="+38 (0__) ___-__-__"
                  />
                </div>

                <div className={styles.field}>
                  <label>Адреса доставки *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.textarea}
                    placeholder="Місто, служба доставки, № відділення або адреса доставки"
                  />
                </div>

                <button
                  className={styles.confirmBtn}
                  onClick={handleFinalOrder}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? 'Відправка...' : 'Підтвердити'}
                </button>
                <button className={styles.backLink} onClick={() => setStep('summary')}>
                  Назад
                </button>
              </div>
            )}

            {/* КРОК 3: УСПІХ (ПОВЕРНУВ ЦЕЙ БЛОК) */}
            {step === 'success' && (
              <div className={styles.animateFade}>
                <div className={styles.successIcon}>✓</div>
                <h3 style={{color: '#2ecc71'}}>Готово!</h3>
                <p>Замовлення успішно створене.</p>
                <p>Дякуємо Вам за довіру!</p>
                <p style={{fontSize: '0.7rem', marginTop: '20px', textAlign: 'center',}}>При потребі ми зв'яжемося з
                  Вами за номером:<br/>
                  <strong>{phone}</strong> для уточнення деталей.</p>
                <Link to="/catalog"
                      style={{
                        marginTop: '20px',
                        display: 'block',
                        textAlign: 'center',
                        // justifyContent: 'center',
                        // alignItems: 'center'
                      }}>
                  <Button>За новими покупками</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CartPage;