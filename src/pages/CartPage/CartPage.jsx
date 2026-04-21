// import { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import Container from "../../layouts/Container/Container.jsx";
// import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
// import Button from "../../components/Button/Button.jsx";
// import { useAuth } from '../../context/AuthContext.jsx';
// import { useHaptics } from "../../hooks/useHaptics.js";
// import toast from "react-hot-toast";
// import styles from './CartPage.module.css';
// import { clearEntireCart } from '../../redux/cart/cartOps';
// import { supabase } from '../../supabaseClient'; // Перевір правильність шляху до клієнта
// import { DELIVERY_CONFIG } from '../../utils/helpers.js';
//
// const formatPhoneToMask = (phone) => {
//   if (!phone) return '';
//
//   // Прибираємо все зайве, залишаємо тільки цифри
//   const digits = phone.replace(/\D/g, '');
//
//   // Якщо це український номер (380...), розбиваємо його по шматочках
//   if (digits.length === 12 && digits.startsWith('380')) {
//     const code = digits.slice(2, 5);    // 097
//     const part1 = digits.slice(5, 8);   // 661
//     const part2 = digits.slice(8, 10);  // 60
//     const part3 = digits.slice(10, 12); // 24
//
//     return `+38 (${code}) ${part1}-${part2}-${part3}`;
//   }
//
//   // Якщо формат інший, просто додаємо плюс на початку (про всяк випадок)
//   return digits.startsWith('+') ? digits : `+${digits}`;
// };
//
//
// const CartPage = () => {
//   const {user} = useAuth();
//   const {items, totalPriceEur} = useSelector((state) => state.cart);
//   const rate = useSelector((state) => state.currency.rate);
//   const {trigger} = useHaptics();
//   const dispatch = useDispatch();
//
//
//   const [step, setStep] = useState('summary');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDataLoaded, setIsDataLoaded] = useState(false); // Прапорець для useEffect
//
//   // Оголошуємо всі поля, для відправки в базу
//   const [firstName, setFirstName] = useState(user?.first_name || '');
//   const [lastName, setLastName] = useState(user?.last_name || '');
//   const [phone, setPhone] = useState(user?.phone || '');
//   const [city, setCity] = useState(''); // Місто окремо
//   const [deliveryMethod, setDeliveryMethod] = useState('np_branch'); // np_branch, np_courier, self
//   const [branch, setBranch] = useState(''); // Відділення
//   const [paymentMethod, setPaymentMethod] = useState('cod'); // cod (оплата при отриманні), prepay
//   const [notes, setNotes] = useState(''); // Стейт для приміток
//   const [displayOrderNumber, setDisplayOrderNumber] = useState('');
//
//   // // Додатково: якщо дані підтягуються з бази після завантаження сторінки
//   // useEffect(() => {
//   //   // // ЯКЩО МИ ВЖЕ ВІДПРАВЛЯЄМО - ВИХОДИМО, НЕ ЧІПАЄМО СТЕЙТИ!
//   //   if (isSubmitting) return;
//   //
//   //   if (user) {
//   //     if (user.first_name) setFirstName(user.first_name);
//   //     if (user.last_name) setLastName(user.last_name);
//   //     if (user.phone) setPhone(user.phone);
//   //     if (user.city) setCity(user.city);
//   //     if (user.branch) setBranch(user.branch);
//   //     if (user.delivery_method) {
//   //       setDeliveryMethod(user.delivery_method);
//   //     }
//   //
//   //     // Форматуємо телефон під маску, якщо він є в базі
//   //     if (user.phone) {
//   //       const formatted = formatPhoneToMask(user.phone);
//   //       setPhone(formatted);
//   //     }
//   //   }
//   // }, [user]);
//
//   // 1. ЗАПОВНЮЄМО ДАНІ ОДИН РАЗ ПРИ ЗАВАНТАЖЕННІ
//   useEffect(() => {
//     if (user && !isDataLoaded && !isSubmitting) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) {
//         setPhone(formatPhoneToMask(user.phone));
//       }
//       setIsDataLoaded(true); // Більше не заходимо сюди, щоб не перебивати ручне введення
//     }
//   }, [user, isDataLoaded, isSubmitting]);
//
//   // // 🔥 "ТИХИЙ ПРОГРІВ" СЕСІЇ (той самий костиль)
//   // useEffect(() => {
//   //   // Як тільки юзер перейшов до форми (step === 'checkout')
//   //   // і ми ще не почали процес відправки
//   //   if (step === 'checkout' && !isSubmitting) {
//   //     console.log("🕯️ Прогрів сесії: готуємо ґрунт для замовлення...");
//   //
//   //     // Робимо максимально легкий запит до Supabase.
//   //     // Це змушує бібліотеку заздалегідь перевірити токен і зняти всі блокування (locks)
//   //     // з пам'яті браузера, поки юзер ще заповнює поля форми.
//   //     supabase.auth.getSession()
//   //       .then(({data}) => {
//   //         if (data?.session) {
//   //           console.log("✅ Сесія розігріта. Шлях вільний.");
//   //         } else {
//   //           console.log("⚠️ Сесія відсутня, але контакт із базою встановлено.");
//   //         }
//   //       })
//   //       .catch((err) => {
//   //         console.warn("⚠️ Прогрів не вдався, але це не критично:", err.message);
//   //       });
//   //   }
//   // }, [step, isSubmitting]); // Спрацює один раз при переході на крок оформлення
//   //
//   // console.log("Дані користувача з контексту:", user);
//
//   const totalPriceUah = Math.round(totalPriceEur * rate);
//   const cleanPhone = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhone.length === 12;
//
//   // РОЗУМНА ВАЛІДАЦІЯ
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityRequired = deliveryMethod !== 'self';
//   const isCityValid = !isCityRequired || city.trim().length >= 2;
//
//   const isFormValid = isPhoneValid &&
//     firstName.trim().length >= 2 &&
//     lastName.trim().length >= 2 &&
//     isCityValid &&
//     isBranchValid;
//
//   const sendOrderEmail = (orderId, currentItems, totalPrice) => {
//     // 1. Не чекаємо Supabase! Беремо email прямо з об'єкта user, який уже є в CartPage
//     const clientEmail = user?.email || "email-not-found@test.com";
//
//     try {
//       // 2. Формуємо товари з ціною в грн (це швидко, робиться в пам'яті)
//       const itemsWithUahPrice = currentItems.map(item => ({
//         ...item,
//         price_uah: Math.round(item.price_eur * rate)
//       }));
//
//       // 3. Формуємо Payload
//       const payload = {
//         order_id: orderId,
//         user_name: `${firstName} ${lastName}`.trim() || "Unknown User",
//         user_email: clientEmail,
//         user_phone: phone,
//         delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `Нова Пошта: ${city}, відд. №${branch}`,
//         total_price: totalPrice,
//         total_price_uah: totalPriceUah,
//         items: itemsWithUahPrice,
//       };
//
//       console.log("📤 ВІДПРАВКА НА БЕКЕНД:", payload);
//
//       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//
//       // 4. ВІДПРАВКА БЕЗ AWAIT (Background)
//       fetch(`${API_URL}/api/cart/checkout`, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(payload),
//       })
//         .then(response => {
//           if (response.ok) {
//             console.log('✅ Лист успішно поставлено в чергу відправки');
//           } else {
//             console.error('⚠️ Бекенд повернув помилку:', response.status);
//           }
//         })
//         .catch(error => {
//           console.error('🌐 Помилка мережі (Render не відповідає):', error);
//         });
//
//     } catch (err) {
//       console.error("❌ Помилка при підготовці листа:", err);
//     }
//
//     // Функція завершилась, React іде далі, а fetch живе своїм життям
//   };
//
//   const handleFinalOrder = async () => {
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     setIsSubmitting(true);
//
//     try {
// // КРОК 1: СТВОРЮЄМО ЗАМОВЛЕННЯ
//       const {data: order, error: orderError} = await supabase
//         .from('orders')
//         .insert([{
//           user_id: user.id,
//           total_price_eur: totalPriceEur,
//           total_price_uah: totalPriceUah,
//           status: 'new',
//           payment_method: paymentMethod,
//           ship_first_name: firstName,
//           ship_last_name: lastName,
//           ship_phone: cleanPhone,
//           ship_city: deliveryMethod === 'self' ? 'Самбір' : city,
//           ship_method: deliveryMethod,
//           ship_branch: branch,
//           ship_notes: notes
//         }])
//         .select('id, order_number')
//         .single();
//
//       if (orderError) throw orderError;
//
// // КРОК 2: ТОВАРИ
//       const itemsToInsert = items.map(item => ({
//         order_id: order.id,
//         product_id: item.product_id,
//         supplier_id: item.supplier_id,
//         code: item.code,
//         brand: item.brand,
//         price_eur: item.price_eur,
//         quantity: item.quantity
//       }));
//
//       const {error: itemsError} = await supabase.from('order_items').insert(itemsToInsert);
//       if (itemsError) throw itemsError;
//
//       // --- МОМЕНТ УСПІХУ ---
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       setIsSubmitting(false);
//       trigger('success');
//       toast.success("Замовлення прийняте!");
//
//       dispatch(clearEntireCart(user.id));
//
//       // 3. ФОНОВІ ПРОЦЕСИ
//       sendOrderEmail(formattedOrderNumber, items, totalPriceUah);
//
// // ПИШИ ТАК:
//       supabase.from('profiles')
//         .upsert({
//           id: user.id,
//           first_name: firstName,
//           last_name: lastName,
//           phone: cleanPhone,
//           city: city,
//           branch: branch,
//           delivery_method: deliveryMethod,
//           updated_at: new Date()
//         })
//         .then(({error}) => {
//           if (error) console.error("Profile upsert error:", error);
//           else console.log("✅ Профіль оновлено");
//         });
//
//     } catch (error) {
//       console.error("🚨 Помилка:", error);
//       toast.error(error.message || "Сталася помилка");
//     } finally {
//       setIsSubmitting(false); // ЗАВЖДИ розблокуємо кнопку
//     }
//   };
//
//   // Порожній кошик показуємо тільки якщо замовлення ще не оформлене
//   if (items.length === 0 && step !== 'success' && !isSubmitting) {
//     return (
//       <Container>
//         <div className={styles.container}>
//           <div className={styles.emptyContainer}>
//             <h2 className={styles.title}>Кошик порожній 🛒</h2>
//             <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
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
//           {step === 'success' ? 'Замовлення прийняте!' : 'Моє замовлення'}
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
//             {/* КРОК 1: ПІДСУМОК */}
//             {step === 'summary' && (
//               <div className={styles.animateFade}>
//                 <h3>Разом:</h3>
//                 <div className={styles.prices}>
//                   <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//                   <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//                 </div>
//                 <button
//                   className={styles.orderBtn}
//                   onClick={() => {
//                     setStep('checkout'); // ПЕРЕМИКАЄМО НА ФОРМУ
//                     trigger('tick');
//                   }}
//                 >
//                   Оформити замовлення
//                 </button>
//               </div>
//             )}
//
//             {/* КРОК 2: ФОРМА ОФОРМЛЕННЯ */}
//             {step === 'checkout' && (
//               <div className={styles.animateFade}>
//                 <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//
//                 {/* 1. ПІБ */}
//                 <div className={styles.row}>
//                   <div className={styles.field}>
//                     <label>Прізвище *</label>
//                     <input
//                       className={styles.input}
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       placeholder="Кондратюк"
//                     />
//                   </div>
//                   <div className={styles.field}>
//                     <label>Ім'я *</label>
//                     <input
//                       className={styles.input}
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       placeholder="Юрій"
//                     />
//                   </div>
//                 </div>
//
//                 {/* 2. Телефон з маскою */}
//                 <div className={styles.field}>
//                   <label>Телефон *</label>
//                   <InputMask
//                     mask="+38 (0__) ___-__-__"
//                     replacement={{_: /\d/}}
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className={`${styles.input} ${!isPhoneValid && cleanPhone.length > 3 ? styles.error : ''}`}
//                     placeholder="+38 (0__) ___-__-__"
//                   />
//                 </div>
//
//                 {/* 3. Вибір способу доставки */}
//                 <div className={styles.field}>
//                   <label>Спосіб доставки *</label>
//                   <select
//                     className={styles.select}
//                     value={deliveryMethod}
//                     onChange={(e) => {
//                       setDeliveryMethod(e.target.value);
//                       setBranch(''); // Очищаємо поле при зміні методу
//                     }}
//                   >
//                     {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                       <option key={key} value={key}>{cfg.label}</option>
//                     ))}
//                   </select>
//                 </div>
//
//                 {/* 4. Місто */}
//                 {/* Відображаємо місто тільки якщо це НЕ самовивіз */}
//                 {deliveryMethod !== 'self' && (
//                   <div className={styles.field}>
//                     <label>Місто *</label>
//                     <input
//                       type="text"
//                       className={styles.input}
//                       value={city}
//                       onChange={(e) => setCity(e.target.value)}
//                       placeholder="Наприклад: Полтава"
//                     />
//                   </div>
//                 )}
//
//                 {/* Динамічне поле (Відділення / Адреса) — ховаємо для самовивозу */}
//                 {deliveryMethod !== 'self' && (
//                   <div className={styles.field}>
//                     <label>
//                       {currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}
//                     </label>
//                     <input
//                       type="text"
//                       className={styles.input}
//                       value={branch}
//                       onChange={(e) => setBranch(e.target.value)}
//                       placeholder={currentDelivery.placeholder}
//                     />
//                   </div>
//                 )}
//
//                 {/* 6. Спосіб оплати */}
//                 <div className={styles.field}>
//                   <label htmlFor="paymentMethod">Спосіб оплати *</label>
//                   <select
//                     id="paymentMethod"
//                     className={styles.select}
//                     value={paymentMethod}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   >
//                     <option value="cod">Оплата при отриманні</option>
//                     <option value="card">Оплата на карту</option>
//                   </select>
//                 </div>
//
//                 {/* 7. Примітки */}
//                 <div className={styles.field}>
//                   <label>Примітки</label>
//                   <textarea
//                     className={styles.textarea}
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     placeholder="Додаткова інформація..."
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
//             {/* КРОК 3: УСПІХ (ПОВЕРНУВ ЦЕЙ БЛОК) */}
//             {step === 'success' && (
//               <div className={styles.animateFade}>
//                 <div className={styles.successIcon}>✓</div>
//                 <h3 style={{color: '#2ecc71'}}>Готово!</h3>
//                 <p>Замовлення №{displayOrderNumber} успішно створене.</p>
//                 <p>Дякуємо Вам за довіру!</p>
//                 <p style={{fontSize: '0.7rem', marginTop: '20px', textAlign: 'center',}}>При потребі ми зв'яжемося з
//                   Вами за номером:<br/>
//                   <strong>{phone}</strong> для уточнення деталей.</p>
//                 <Link to="/catalog"
//                       style={{
//                         marginTop: '20px',
//                         display: 'block',
//                         textAlign: 'center',
//                         // justifyContent: 'center',
//                         // alignItems: 'center'
//                       }}>
//                   <Button>За новими покупками</Button>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Container>
//   );
// };
//
// export default CartPage;


// import { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import Container from "../../layouts/Container/Container.jsx";
// import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
// import Button from "../../components/Button/Button.jsx";
// import { useAuth } from '../../context/AuthContext.jsx';
// import { useHaptics } from "../../hooks/useHaptics.js";
// import toast from "react-hot-toast";
// import styles from './CartPage.module.css';
// import { clearEntireCart } from '../../redux/cart/cartOps';
// import { supabase } from '../../supabaseClient';
// import { DELIVERY_CONFIG } from '../../utils/helpers.js';
//
// const formatPhoneToMask = (phone) => {
//   if (!phone) return '';
//   const digits = phone.replace(/\D/g, '');
//   if (digits.length === 12 && digits.startsWith('380')) {
//     const code = digits.slice(2, 5);
//     const part1 = digits.slice(5, 8);
//     const part2 = digits.slice(8, 10);
//     const part3 = digits.slice(10, 12);
//     return `+38 (${code}) ${part1}-${part2}-${part3}`;
//   }
//   return digits.startsWith('+') ? digits : `+${digits}`;
// };
//
// const CartPage = () => {
//   const {user} = useAuth();
//   const {items, totalPriceEur} = useSelector((state) => state.cart);
//   const rate = useSelector((state) => state.currency.rate);
//   const {trigger} = useHaptics();
//   const dispatch = useDispatch();
//
//   const [step, setStep] = useState('summary');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//
//   const [firstName, setFirstName] = useState(user?.first_name || '');
//   const [lastName, setLastName] = useState(user?.last_name || '');
//   const [phone, setPhone] = useState(user?.phone || '');
//   const [city, setCity] = useState(user?.city || '');
//   const [deliveryMethod, setDeliveryMethod] = useState(user?.delivery_method || 'np_branch');
//   const [branch, setBranch] = useState(user?.branch || '');
//   const [paymentMethod, setPaymentMethod] = useState('cod');
//   const [notes, setNotes] = useState('');
//   const [displayOrderNumber, setDisplayOrderNumber] = useState('');
//
//   useEffect(() => {
//     if (user && !isDataLoaded && !isSubmitting) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) {
//         setPhone(formatPhoneToMask(user.phone));
//       }
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded, isSubmitting]);
//
//   const totalPriceUah = Math.round(totalPriceEur * rate);
//   const cleanPhone = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhone.length === 12;
//
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityRequired = deliveryMethod !== 'self';
//   const isCityValid = !isCityRequired || city.trim().length >= 2;
//
//   const isFormValid = isPhoneValid &&
//     firstName.trim().length >= 2 &&
//     lastName.trim().length >= 2 &&
//     isCityValid &&
//     isBranchValid;
//
//   // --- ВІДПРАВКА EMAIL (ФОНОВА) ---
//   const sendOrderEmail = (orderId, currentItems, totalPriceUahFinal) => {
//     const clientEmail = user?.email || "no-email@maxgear.com.ua";
//     try {
//       const itemsWithUahPrice = currentItems.map(item => ({
//         ...item,
//         price_uah: Math.round(item.price_eur * rate)
//       }));
//
//       const payload = {
//         order_id: orderId,
//         user_name: `${firstName} ${lastName}`.trim(),
//         user_email: clientEmail,
//         user_phone: phone,
//         delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
//         total_price_eur: totalPriceEur,
//         total_price_uah: totalPriceUahFinal,
//         items: itemsWithUahPrice,
//       };
//
//       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//
//       fetch(`${API_URL}/api/cart/checkout`, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(payload),
//       })
//         .then(r => console.log("📧 Email status:", r.status))
//         .catch(e => console.error("📧 Email network error:", e));
//
//     } catch (err) {
//       console.error("❌ Email preparation error:", err);
//     }
//   };
//
//   // --- ГОЛОВНА ФУНКЦІЯ ---
//   const handleFinalOrder = async () => {
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     console.log("🚀 [ORDER START]");
//     setIsSubmitting(true);
//
//     try {
//       // КРОК 0: ПРОБИВАЄМО ЗАМОК АВТОРИЗАЦІЇ (БЕЗПЕЧНИЙ ВАРІАНТ)
//       console.log("🛰️ Step 0: Refreshing session lock...");
//
//       // Створюємо "перегони": або сесія відповість, або вийде час (1 сек)
//       await Promise.race([
//         supabase.auth.getSession(),
//         new Promise((resolve) => setTimeout(resolve, 1000))
//       ]);
//
//       console.log("✅ Step 0: Moving forward (lock cleared or bypassed).");
//
//       // КРОК 1: СТВОРЮЄМО ЗАМОВЛЕННЯ
//       console.log("📦 Step 1: Inserting order...");
//
//       // КРОК 1: СТВОРЮЄМО ЗАМОВЛЕННЯ
//       console.log("📦 Step 1: Inserting order...");
//       const {data: order, error: orderError} = await supabase
//         .from('orders')
//         .insert([{
//           user_id: user.id,
//           total_price_eur: totalPriceEur,
//           total_price_uah: totalPriceUah,
//           status: 'new',
//           payment_method: paymentMethod,
//           ship_first_name: firstName,
//           ship_last_name: lastName,
//           ship_phone: cleanPhone,
//           ship_city: deliveryMethod === 'self' ? 'Самбір' : city,
//           ship_method: deliveryMethod,
//           ship_branch: branch,
//           ship_notes: notes
//         }])
//         .select('id, order_number')
//         .single();
//
//       if (orderError) throw orderError;
//       console.log("✅ Step 1: Order created ID:", order.id);
//
//       // КРОК 2: ТОВАРИ
//       console.log("🛒 Step 2: Inserting items...");
//       const itemsToInsert = items.map(item => ({
//         order_id: order.id,
//         product_id: item.product_id,
//         supplier_id: item.supplier_id,
//         code: item.code,
//         brand: item.brand,
//         price_eur: item.price_eur,
//         quantity: item.quantity
//       }));
//
//       const {error: itemsError} = await supabase.from('order_items').insert(itemsToInsert);
//       if (itemsError) throw itemsError;
//       console.log("✅ Step 2: Items inserted.");
//
//       // --- МОМЕНТ УСПІХУ (ВІЗУАЛ) ---
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       trigger('success');
//       toast.success("Замовлення прийняте!");
//
//       // КРОК 3: ОЧИЩЕННЯ КОШИКА
//       console.log("🧹 Step 3: Clearing cart...");
//       dispatch(clearEntireCart(user.id));
//
//       // КРОК 4: ФОНОВІ ОНОВЛЕННЯ (без await, щоб не чекати)
//       console.log("⚙️ Step 4: Starting background tasks (Email & Profile)...");
//       sendOrderEmail(formattedOrderNumber, items, totalPriceUah);
//
//       supabase.from('profiles')
//         .upsert({
//           id: user.id,
//           first_name: firstName,
//           last_name: lastName,
//           phone: cleanPhone,
//           city: city,
//           branch: branch,
//           delivery_method: deliveryMethod,
//           updated_at: new Date()
//         })
//         .then(() => console.log("👤 Profile updated in background"));
//
//     } catch (error) {
//       console.error("🚨 [ORDER CRITICAL ERROR]:", error);
//       toast.error(error.message || "Сталася помилка");
//     } finally {
//       console.log("🏁 [ORDER FINISHED]");
//       setIsSubmitting(false); // ЗАВЖДИ розблокуємо кнопку
//     }
//   };
//
//   // Порожній кошик показуємо тільки якщо замовлення ще не оформлене
//   if (items.length === 0 && step !== 'success' && !isSubmitting) {
//     return (
//       <Container>
//         <div className={styles.container}>
//           <div className={styles.emptyContainer}>
//             <h2 className={styles.title}>Кошик порожній 🛒</h2>
//             <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
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
//           {step === 'success' ? 'Замовлення прийняте!' : 'Моє замовлення'}
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
//             {/* КРОК 1: ПІДСУМОК */}
//             {step === 'summary' && (
//               <div className={styles.animateFade}>
//                 <h3>Разом:</h3>
//                 <div className={styles.prices}>
//                   <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//                   <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//                 </div>
//                 <button
//                   className={styles.orderBtn}
//                   onClick={() => {
//                     setStep('checkout'); // ПЕРЕМИКАЄМО НА ФОРМУ
//                     trigger('tick');
//                   }}
//                 >
//                   Оформити замовлення
//                 </button>
//               </div>
//             )}
//
//             {/* КРОК 2: ФОРМА ОФОРМЛЕННЯ */}
//             {step === 'checkout' && (
//               <div className={styles.animateFade}>
//                 <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//
//                 {/* 1. ПІБ */}
//                 <div className={styles.row}>
//                   <div className={styles.field}>
//                     <label>Прізвище *</label>
//                     <input
//                       className={styles.input}
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       placeholder="Кондратюк"
//                     />
//                   </div>
//                   <div className={styles.field}>
//                     <label>Ім'я *</label>
//                     <input
//                       className={styles.input}
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       placeholder="Юрій"
//                     />
//                   </div>
//                 </div>
//
//                 {/* 2. Телефон з маскою */}
//                 <div className={styles.field}>
//                   <label>Телефон *</label>
//                   <InputMask
//                     mask="+38 (0__) ___-__-__"
//                     replacement={{_: /\d/}}
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className={`${styles.input} ${!isPhoneValid && cleanPhone.length > 3 ? styles.error : ''}`}
//                     placeholder="+38 (0__) ___-__-__"
//                   />
//                 </div>
//
//                 {/* 3. Вибір способу доставки */}
//                 <div className={styles.field}>
//                   <label>Спосіб доставки *</label>
//                   <select
//                     className={styles.select}
//                     value={deliveryMethod}
//                     onChange={(e) => {
//                       setDeliveryMethod(e.target.value);
//                       setBranch(''); // Очищаємо поле при зміні методу
//                     }}
//                   >
//                     {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                       <option key={key} value={key}>{cfg.label}</option>
//                     ))}
//                   </select>
//                 </div>
//
//                 {/* 4. Місто */}
//                 {/* Відображаємо місто тільки якщо це НЕ самовивіз */}
//                 {deliveryMethod !== 'self' && (
//                   <div className={styles.field}>
//                     <label>Місто *</label>
//                     <input
//                       type="text"
//                       className={styles.input}
//                       value={city}
//                       onChange={(e) => setCity(e.target.value)}
//                       placeholder="Наприклад: Полтава"
//                     />
//                   </div>
//                 )}
//
//                 {/* Динамічне поле (Відділення / Адреса) — ховаємо для самовивозу */}
//                 {deliveryMethod !== 'self' && (
//                   <div className={styles.field}>
//                     <label>
//                       {currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}
//                     </label>
//                     <input
//                       type="text"
//                       className={styles.input}
//                       value={branch}
//                       onChange={(e) => setBranch(e.target.value)}
//                       placeholder={currentDelivery.placeholder}
//                     />
//                   </div>
//                 )}
//
//                 {/* 6. Спосіб оплати */}
//                 <div className={styles.field}>
//                   <label htmlFor="paymentMethod">Спосіб оплати *</label>
//                   <select
//                     id="paymentMethod"
//                     className={styles.select}
//                     value={paymentMethod}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   >
//                     <option value="cod">Оплата при отриманні</option>
//                     <option value="card">Оплата на карту</option>
//                   </select>
//                 </div>
//
//                 {/* 7. Примітки */}
//                 <div className={styles.field}>
//                   <label>Примітки</label>
//                   <textarea
//                     className={styles.textarea}
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     placeholder="Додаткова інформація..."
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
//             {/* КРОК 3: УСПІХ (ПОВЕРНУВ ЦЕЙ БЛОК) */}
//             {step === 'success' && (
//               <div className={styles.animateFade}>
//                 <div className={styles.successIcon}>✓</div>
//                 <h3 style={{color: '#2ecc71'}}>Готово!</h3>
//                 <p>Замовлення №{displayOrderNumber} успішно створене.</p>
//                 <p>Дякуємо Вам за довіру!</p>
//                 <p style={{fontSize: '0.7rem', marginTop: '20px', textAlign: 'center',}}>При потребі ми зв'яжемося з
//                   Вами за номером:<br/>
//                   <strong>{phone}</strong> для уточнення деталей.</p>
//                 <Link to="/catalog"
//                       style={{
//                         marginTop: '20px',
//                         display: 'block',
//                         textAlign: 'center',
//                         // justifyContent: 'center',
//                         // alignItems: 'center'
//                       }}>
//                   <Button>За новими покупками</Button>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Container>
//   );
// };
//
// export default CartPage;


import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputMask } from '@react-input/mask';
import Container from "../../layouts/Container/Container.jsx";
import CartItem from '../../components/CartPage/CartItem/CartItem.jsx';
import Button from "../../components/Button/Button.jsx";
import { useAuth } from '../../context/AuthContext.jsx';
import { useHaptics } from "../../hooks/useHaptics.js";
import toast from "react-hot-toast";
import styles from './CartPage.module.css';
import { clearEntireCart } from '../../redux/cart/cartOps';
import { supabase } from '../../supabaseClient';
import { DELIVERY_CONFIG } from '../../utils/helpers.js';

const formatPhoneToMask = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('380')) {
    const code = digits.slice(2, 5);
    const part1 = digits.slice(5, 8);
    const part2 = digits.slice(8, 10);
    const part3 = digits.slice(10, 12);
    return `+38 (${code}) ${part1}-${part2}-${part3}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
};

const CartPage = () => {
  const {user} = useAuth();
  const {items, totalPriceEur} = useSelector((state) => state.cart);
  const rate = useSelector((state) => state.currency.rate);
  const {trigger} = useHaptics();
  const dispatch = useDispatch();

  // Реф для запобігання подвійним натисканням (спрацьовує миттєво)
  const isProcessing = useRef(false);

  const [step, setStep] = useState('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [deliveryMethod, setDeliveryMethod] = useState(user?.delivery_method || 'np_branch');
  const [branch, setBranch] = useState(user?.branch || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [displayOrderNumber, setDisplayOrderNumber] = useState('');

  useEffect(() => {
    if (user && !isDataLoaded && !isSubmitting) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setCity(user.city || '');
      setBranch(user.branch || '');
      setDeliveryMethod(user.delivery_method || 'np_branch');
      if (user.phone) {
        setPhone(formatPhoneToMask(user.phone));
      }
      setIsDataLoaded(true);
    }
  }, [user, isDataLoaded, isSubmitting]);

  const totalPriceUah = Math.round(totalPriceEur * rate);
  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 12;

  const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
  const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
  const isCityRequired = deliveryMethod !== 'self';
  const isCityValid = !isCityRequired || city.trim().length >= 2;

  const isFormValid = isPhoneValid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    isCityValid &&
    isBranchValid;

  // --- ВІДПРАВКА EMAIL (ФОНОВА) ---
  const sendOrderEmail = (orderId, currentItems, totalPriceUahFinal) => {
    const clientEmail = user?.email || "no-email@maxgear.com.ua";
    try {
      const itemsWithUahPrice = currentItems.map(item => ({
        ...item,
        price_uah: Math.round(item.price_eur * rate)
      }));

      const payload = {
        order_id: orderId,
        user_name: `${firstName} ${lastName}`.trim(),
        user_email: clientEmail,
        user_phone: phone,
        delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
        total_price_eur: totalPriceEur, // Бекенд чекає саме таку назву
        total_price_uah: totalPriceUahFinal,
        items: itemsWithUahPrice,
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      fetch(`${API_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })
        .then(r => console.log("📧 Email status:", r.status))
        .catch(e => console.error("📧 Email network error:", e));

    } catch (err) {
      console.error("❌ Email preparation error:", err);
    }
  };

  // --- ГОЛОВНА ФУНКЦІЯ ---
  const handleFinalOrder = async () => {
    // 1. Захист від подвійного кліку
    if (isProcessing.current) return;

    if (!user?.id) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    console.log("🚀 [ORDER START]");
    isProcessing.current = true;
    setIsSubmitting(true);

    try {
      // КРОК 0: ПРОБИВАЄМО ЗАМОК АВТОРИЗАЦІЇ (2 секунди таймауту)
      console.log("🛰️ Step 0: Refreshing session lock...");
      await Promise.race([
        supabase.auth.getSession(),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
      console.log("✅ Step 0: Moving forward (lock cleared or bypassed).");

      // КРОК 1: СТВОРЮЄМО ЗАМОВЛЕННЯ
      console.log("📦 Step 1: Inserting order...");
      const {data: orderData, error: orderError} = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_price_eur: totalPriceEur,
          total_price_uah: totalPriceUah,
          status: 'new',
          payment_method: paymentMethod,
          ship_first_name: firstName,
          ship_last_name: lastName,
          ship_phone: cleanPhone,
          ship_city: deliveryMethod === 'self' ? 'Самбір' : city,
          ship_method: deliveryMethod,
          ship_branch: branch,
          ship_notes: notes
        }])
        .select('id, order_number');

      if (orderError) throw orderError;
      if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");

      const order = orderData[0];
      console.log("✅ Step 1: Order created ID:", order.id);

      // КРОК 2: ТОВАРИ
      console.log("🛒 Step 2: Inserting items...");
      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        supplier_id: item.supplier_id,
        code: item.code,
        brand: item.brand,
        price_eur: item.price_eur,
        quantity: item.quantity
      }));

      const {error: itemsError} = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      console.log("✅ Step 2: Items inserted.");

      // --- УСПІХ ---
      const formattedOrderNumber = String(order.order_number).padStart(6, '0');
      setDisplayOrderNumber(formattedOrderNumber);
      setStep('success');
      trigger('success');
      toast.success("Замовлення відправлене!");

      // КРОК 3: ОЧИЩЕННЯ КОШИКА
      console.log("🧹 Step 3: Clearing cart...");
      dispatch(clearEntireCart(user.id));

      // КРОК 4: ФОНОВІ ОНОВЛЕННЯ (Тепер робимо їх послідовними)
      console.log("⚙️ Step 4: Starting background tasks...");

      // 4.1 Відправка Email (залишаємо як є, але це окремий fetch)
      sendOrderEmail(formattedOrderNumber, items, totalPriceUah);

      // 4.2 Оновлення профілю (ДОДАЄМО AWAIT)
      console.log("👤 Step 4.2: Updating profile...");
      try {
        const {error: profileError} = await supabase.from('profiles')
          .upsert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone,
            city: city,
            branch: branch,
            delivery_method: deliveryMethod,
            updated_at: new Date()
          });

        if (profileError) console.error("⚠️ Profile update warning:", profileError);
        else console.log("✅ Profile updated successfully");
      } catch (pErr) {
        console.error("❌ Profile upsert crashed:", pErr);
      }

    } catch (error) {
      console.error("🚨 [CRITICAL ERROR]:", error);
      toast.error(error.message || "Сталася помилка");
    } finally {
      console.log("🏁 [ORDER FINISHED]");
      setIsSubmitting(false);
      isProcessing.current = false; // Розблокування кнопки
    }
  };

  if (items.length === 0 && step !== 'success' && !isSubmitting) {
    return (
      <Container>
        <div className={styles.container}>
          <div className={styles.emptyContainer}>
            <h2 className={styles.title}>Кошик порожній 🛒</h2>
            <p className={styles.subTitle}>Додайте щось із каталогу, щоб створити замовлення.</p>
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
          {step === 'success' ? 'Замовлення відправлене!' : 'Моє замовлення'}
        </h1>

        <div className={styles.content}>
          <ul className={styles.list}>
            {items.map((item) => (
              <CartItem key={`${item.code}-${item.supplier_id}`} item={item}/>
            ))}
          </ul>

          <div className={styles.summary}>
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
                    setStep('checkout');
                    trigger('tick');
                  }}
                >
                  Оформити замовлення
                </button>
              </div>
            )}

            {step === 'checkout' && (
              <div className={styles.animateFade}>
                <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Прізвище *</label>
                    <input
                      className={styles.input}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Прізвище"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Ім'я *</label>
                    <input
                      className={styles.input}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ім'я"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Телефон *</label>
                  <InputMask
                    mask="+38 (0__) ___-__-__"
                    replacement={{_: /\d/}}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${styles.input} ${!isPhoneValid && cleanPhone.length > 3 ? styles.error : ''}`}
                    placeholder="+38 (0__) ___-__-__"
                  />
                </div>

                <div className={styles.field}>
                  <label>Спосіб доставки *</label>
                  <select
                    className={styles.select}
                    value={deliveryMethod}
                    onChange={(e) => {
                      setDeliveryMethod(e.target.value);
                      setBranch('');
                    }}
                  >
                    {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                {deliveryMethod !== 'self' && (
                  <div className={styles.field}>
                    <label>Місто *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Місто"
                    />
                  </div>
                )}

                {deliveryMethod !== 'self' && (
                  <div className={styles.field}>
                    <label>
                      {currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder={currentDelivery.placeholder}
                    />
                  </div>
                )}

                <div className={styles.field}>
                  <label htmlFor="paymentMethod">Спосіб оплати *</label>
                  <select
                    id="paymentMethod"
                    className={styles.select}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cod">Оплата при отриманні</option>
                    <option value="card">Оплата на карту</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Примітки</label>
                  <textarea
                    className={styles.textarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Додаткова інформація..."
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

            {step === 'success' && (
              <div className={styles.animateFade}>
                <div className={styles.successIcon}>✓</div>
                <h3 style={{color: '#2ecc71', textAlign: 'center'}}>Готово!</h3>
                <p style={{marginTop: '10px', textAlign: 'center'}}>
                  Замовлення №{displayOrderNumber} успішно створене.</p>
                <p style={{fontSize: '0.7rem', marginTop: '10px', textAlign: 'center',}}>
                  При потребі ми зв'яжемося з Вами для уточнення деталей.</p>
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