// import { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { supabase } from '../../../supabaseClient.js';
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
//
// const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
//   const dispatch = useDispatch();
//
//   // 1. Усі хуки та рефи на самому початку
//   const isProcessing = useRef(false);
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
//   // Допоміжна функція
//   const timeout = (ms) => new Promise((_, reject) =>
//     setTimeout(() => reject(new Error("Час очікування вичерпано")), ms)
//   );
//
//   const sendOrderEmail = async (orderId, currentItems, totalPriceUahFinal) => {
//     const clientEmail = user?.email || "no-email@maxgear.com.ua";
//     try {
//       const itemsWithUahPrice = currentItems.map(item => ({
//         ...item,
//         price_uah: Math.round(item.price_eur * rate)
//       }));
//
//
//       const payload = {
//         order_id: orderId,
//         full_user_name: `${lastName} ${firstName}`.trim(),
//         first_name: firstName.trim(),
//         last_name: lastName.trim(),
//         user_email: clientEmail,
//         user_phone: phone,
//         delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
//         payment_method: paymentMethod,
//         total_price_eur: totalPriceEur,
//         total_price_uah: totalPriceUahFinal,
//         notes: notes,
//         items: itemsWithUahPrice,
//       };
//
//       console.log(payload);
//
//       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//       return await fetch(`${API_URL}/api/cart/checkout`, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(payload),
//       });
//     } catch (err) {
//       console.error("❌ Email error:", err);
//     }
//   };
//
//   const handleFinalOrder = async () => {
//     if (isProcessing.current) return;
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     isProcessing.current = true;
//     setIsSubmitting(true);
//     if (onLoading) onLoading(true); // <--- Повідомляємо, що почали
//
//     try {
//       // КРОК 0: ПРОБИВАЄМО ЗАМОК АВТОРИЗАЦІЇ (2 секунди)
//       console.log("🛰️ Step 0: Refreshing session lock...");
//
//       // ЗМІНА: тепер таймаут викидає помилку SESSION_TIMEOUT
//       await Promise.race([
//         supabase.auth.getSession(),
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error("SESSION_TIMEOUT")), 2000)
//         )
//       ]);
//
//       console.log("✅ Step 0: Session OK.");
//
//       const cleanPhone = phone.replace(/\D/g, '');
//
//       const {data: orderData, error: orderError} = await Promise.race([
//         supabase.from('orders').insert([{
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
//         }]).select('id, order_number'),
//         timeout(4000)
//       ]);
//
//       if (orderError) throw orderError;
//       if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");
//
//       const order = orderData[0];
//
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
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       if (onSuccess) onSuccess(); // Кажемо батьку (CartPage): "Тримайся, ми перемогли!"
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//
//       dispatch(clearEntireCart(user.id));
//       await sendOrderEmail(formattedOrderNumber, items, totalPriceUah);
//
//       await supabase.from('profiles').upsert({
//         id: user.id,
//         first_name: firstName,
//         last_name: lastName,
//         phone: cleanPhone,
//         city: city,
//         branch: branch,
//         delivery_method: deliveryMethod,
//         updated_at: new Date()
//       }).then(() => console.log("👤 Profile updated"));
//
//     } catch (error) {
//       console.error("🚨 [CRITICAL ERROR]:", error);
//
//       // ПЕРЕВІРКА НА ТАЙМАУТИ (Крок 0 або Крок 1)
//       if (error.message === "SESSION_TIMEOUT" || error.message === "Час очікування вичерпано") {
//         toast.error("Упсссс... Помилка відправлення. Будь ласка, перезавантажте сторінку та спробуйте ще раз.", {
//           duration: 8000,
//         });
//       } else {
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
//       console.log("🏁 [ORDER FINISHED]");
//       setIsSubmitting(false);
//       if (onLoading) onLoading(false); // <--- Повідомляємо, що закінчили
//       isProcessing.current = false;
//     }
//   };
//
//   useEffect(() => {
//     if (user && !isDataLoaded) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) setPhone(formatPhoneToMask(user.phone));
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded]);
//
//   // Валідація (чистимо телефон для перевірки)
//   const cleanPhoneValid = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhoneValid.length === 12;
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityValid = deliveryMethod === 'self' || city.trim().length >= 2;
//   const isFormValid = isPhoneValid && firstName.trim().length >= 2 && lastName.trim().length >= 2 && isCityValid && isBranchValid;
//
//   return (
//     <div className={styles.summary}>
//       {step === 'summary' && (
//         <div className={styles.animateFade}>
//           <h3>Разом:</h3>
//           <div className={styles.prices}>
//             <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//             <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//           </div>
//           <button className={styles.orderBtn} onClick={() => {
//             setStep('checkout');
//             trigger('tick');
//           }}>
//             Оформити замовлення
//           </button>
//         </div>
//       )}
//
//       {step === 'checkout' && (
//         <div className={styles.animateFade}>
//           <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//           {/* Обгортаємо все в fieldset і прив'язуємо до isSubmitting */}
//           <fieldset disabled={isSubmitting} className={styles.fieldset}>
//             <div className={styles.row}>
//               <div className={styles.field}>
//                 <label>Прізвище *</label>
//                 <input
//                   className={styles.input}
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   placeholder="Прізвище"
//                 />
//               </div>
//               <div className={styles.field}>
//                 <label>Ім'я *</label>
//                 <input
//                   className={styles.input}
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   placeholder="Ім'я"
//                 />
//               </div>
//             </div>
//
//             <div className={styles.field}>
//               <label>Телефон *</label>
//               <InputMask
//                 mask="+38 (0__) ___-__-__"
//                 replacement={{_: /\d/}}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${styles.input} ${!isPhoneValid && cleanPhoneValid.length > 3 ? styles.error : ''}`}
//                 placeholder="+38 (0__) ___-__-__"
//               />
//             </div>
//
//             <div className={styles.field}>
//               <label>Спосіб доставки *</label>
//               <select
//                 className={styles.select}
//                 value={deliveryMethod}
//                 onChange={(e) => {
//                   setDeliveryMethod(e.target.value);
//                   setBranch('');
//                 }}
//               >
//                 {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                   <option key={key} value={key}>{cfg.label}</option>
//                 ))}
//               </select>
//             </div>
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>Місто *</label>
//                 <input
//                   className={styles.input}
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   placeholder="Місто"
//                 />
//               </div>
//             )}
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>{currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}</label>
//                 <input
//                   className={styles.input}
//                   value={branch}
//                   onChange={(e) => setBranch(e.target.value)}
//                   placeholder={currentDelivery.placeholder}
//                 />
//               </div>
//             )}
//
//             <div className={styles.field}>
//               <label>Спосіб оплати *</label>
//               <select
//                 className={styles.select}
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="cod">Оплата при отриманні</option>
//                 <option value="card">Оплата на карту</option>
//               </select>
//             </div>
//
//             <div className={styles.field}>
//               <label>Примітки</label>
//               <textarea
//                 className={styles.textarea}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Додаткова інформація..."
//               />
//             </div>
//
//             <button
//               className={styles.confirmBtn}
//               onClick={handleFinalOrder}
//               disabled={!isFormValid || isSubmitting}
//             >
//               {isSubmitting ? 'Відправка...' : 'Підтвердити'}
//             </button>
//             <button className={styles.backLink} onClick={() => setStep('summary')}>Назад</button>
//           </fieldset>
//         </div>
//       )}
//
//       {step === 'success' && (
//         <div className={styles.animateFade}>
//           <div className={styles.successIcon}>✓</div>
//           <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
//
//           <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>За необхідності ми зв’яжемося з
//             Вами за номером:<br/>
//             <strong>{phone}</strong> для уточнення деталей.</p>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
//           <Link to="/catalog"
//                 style={{
//                   marginTop: '20px',
//                   display: 'block',
//                   textAlign: 'center',
//                 }}>
//             <Button>За новими покупками</Button>
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default CheckoutSidebar;


// import { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { supabase } from '../../../supabaseClient.js';
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
//
// const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
//   const dispatch = useDispatch();
//
//   const isProcessing = useRef(false);
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
//   // Хелпер: відхиляє проміс через ms мілісекунд
//   // Використовуємо скрізь де є await на Supabase або fetch
//   const timeout = (ms) => new Promise((_, reject) =>
//     setTimeout(() => reject(new Error("Час очікування вичерпано")), ms)
//   );
//
//   // ВИПРАВЛЕННЯ 1: sendOrderEmail більше не async-блокуючий для головного флоу.
//   // AbortController дозволяє реально скасувати fetch (на відміну від Promise.race,
//   // який тільки "перестає чекати", але з'єднання залишається відкритим і займає слот).
//   const sendOrderEmail = (orderId, currentItems, totalPriceUahFinal) => {
//     const clientEmail = user?.email || "no-email@maxgear.com.ua";
//
//     const itemsWithUahPrice = currentItems.map(item => ({
//       ...item,
//       price_uah: Math.round(item.price_eur * rate)
//     }));
//
//     const payload = {
//       order_id: orderId,
//       full_user_name: `${lastName} ${firstName}`.trim(),
//       first_name: firstName.trim(),
//       last_name: lastName.trim(),
//       user_email: clientEmail,
//       user_phone: phone,
//       delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
//       payment_method: paymentMethod,
//       total_price_eur: totalPriceEur,
//       total_price_uah: totalPriceUahFinal,
//       notes: notes,
//       items: itemsWithUahPrice,
//     };
//
//     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//
//     // AbortController реально закриває TCP-з'єднання після таймауту.
//     // Без нього fetch може висіти нескінченно і займати один із ~6 браузерних слотів
//     // до одного хоста — через це наступні замовлення зависали.
//     const controller = new AbortController();
//     const abortTimer = setTimeout(() => controller.abort(), 8000);
//
//     // Повертаємо Promise, але НЕ await-имо його в handleFinalOrder —
//     // він виконується у фоні і не блокує UI
//     return fetch(`${API_URL}/api/cart/checkout`, {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify(payload),
//       signal: controller.signal,
//     })
//       .then(res => {
//         clearTimeout(abortTimer);
//         if (!res.ok) console.error("❌ Email API error:", res.status);
//       })
//       .catch(err => {
//         // AbortError — це наш таймаут, не критична помилка
//         if (err.name !== 'AbortError') console.error("❌ Email fetch error:", err);
//       });
//   };
//
//   const handleFinalOrder = async () => {
//     if (isProcessing.current) return;
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     isProcessing.current = true;
//     setIsSubmitting(true);
//     if (onLoading) onLoading(true);
//
//     try {
//       // ВИПРАВЛЕННЯ 2: refreshSession замість getSession.
//       // getSession() просто читає токен із localStorage — навіть протухлий.
//       // refreshSession() примусово отримує новий токен від сервера.
//       // Це вирішує зависання коли сесія "є", але вже не валідна для запитів до БД.
//       console.log("🛰️ Step 0: Refreshing session...");
//       const {error: sessionError} = await Promise.race([
//         supabase.auth.refreshSession(),
//         timeout(5000)
//       ]);
//
//       if (sessionError) throw new Error("SESSION_TIMEOUT");
//       console.log("✅ Step 0: Session refreshed OK.");
//
//       const cleanPhone = phone.replace(/\D/g, '');
//
//       // ВИПРАВЛЕННЯ 3: timeout на orders.insert залишаємо — це критично важливий запит
//       const {data: orderData, error: orderError} = await Promise.race([
//         supabase.from('orders').insert([{
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
//         }]).select('id, order_number'),
//         timeout(6000)
//       ]);
//
//       if (orderError) throw orderError;
//       if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");
//
//       const order = orderData[0];
//
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
//       // ВИПРАВЛЕННЯ 4: timeout на order_items.insert — раніше його не було взагалі,
//       // міг зависнути нескінченно
//       const {error: itemsError} = await Promise.race([
//         supabase.from('order_items').insert(itemsToInsert),
//         timeout(6000)
//       ]);
//
//       if (itemsError) throw itemsError;
//
//       // --- Все критичне виконано. Показуємо успіх. ---
//
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       if (onSuccess) onSuccess();
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//
//       // Очищаємо кошик — теж не критично для UX, але нехай буде в основному флоу
//       dispatch(clearEntireCart(user.id));
//
//       // ВИПРАВЛЕННЯ 5: sendOrderEmail і profiles.upsert — fire-and-forget.
//       // Раніше вони були await — тобто finally (і onLoading(false)) не викликався
//       // поки ці запити не завершаться. Якщо вони зависали — кошик залишався
//       // заблокованим для юзера навіть після успішного замовлення.
//       // Тепер вони виконуються у фоні, не займають await і не блокують з'єднання.
//       sendOrderEmail(formattedOrderNumber, items, totalPriceUah); // навмисно без await
//
//       supabase.from('profiles').upsert({   // навмисно без await
//         id: user.id,
//         first_name: firstName,
//         last_name: lastName,
//         phone: cleanPhone,
//         city: city,
//         branch: branch,
//         delivery_method: deliveryMethod,
//         updated_at: new Date()
//       })
//         .then(() => console.log("👤 Profile updated"))
//         .catch(err => console.error("❌ Profile upsert error:", err));
//
//     } catch (error) {
//       console.error("🚨 [CRITICAL ERROR]:", error);
//
//       if (error.message === "SESSION_TIMEOUT" || error.message === "Час очікування вичерпано") {
//         toast.error("Помилка відправлення. Будь ласка, перезавантажте сторінку та спробуйте ще раз.", {
//           duration: 8000,
//         });
//       } else {
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
//       console.log("🏁 [ORDER FINISHED]");
//       setIsSubmitting(false);
//       if (onLoading) onLoading(false);
//       isProcessing.current = false;
//     }
//   };
//
//   useEffect(() => {
//     if (user && !isDataLoaded) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) setPhone(formatPhoneToMask(user.phone));
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded]);
//
//   const cleanPhoneValid = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhoneValid.length === 12;
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityValid = deliveryMethod === 'self' || city.trim().length >= 2;
//   const isFormValid = isPhoneValid && firstName.trim().length >= 2 && lastName.trim().length >= 2 && isCityValid && isBranchValid;
//
//   return (
//     <div className={styles.summary}>
//       {step === 'summary' && (
//         <div className={styles.animateFade}>
//           <h3>Разом:</h3>
//           <div className={styles.prices}>
//             <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//             <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//           </div>
//           <button className={styles.orderBtn} onClick={() => {
//             setStep('checkout');
//             trigger('tick');
//           }}>
//             Оформити замовлення
//           </button>
//         </div>
//       )}
//
//       {step === 'checkout' && (
//         <div className={styles.animateFade}>
//           <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//           <fieldset disabled={isSubmitting} className={styles.fieldset}>
//             <div className={styles.row}>
//               <div className={styles.field}>
//                 <label>Прізвище *</label>
//                 <input
//                   className={styles.input}
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   placeholder="Прізвище"
//                 />
//               </div>
//               <div className={styles.field}>
//                 <label>Ім'я *</label>
//                 <input
//                   className={styles.input}
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   placeholder="Ім'я"
//                 />
//               </div>
//             </div>
//
//             <div className={styles.field}>
//               <label>Телефон *</label>
//               <InputMask
//                 mask="+38 (0__) ___-__-__"
//                 replacement={{_: /\d/}}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${styles.input} ${!isPhoneValid && cleanPhoneValid.length > 3 ? styles.error : ''}`}
//                 placeholder="+38 (0__) ___-__-__"
//               />
//             </div>
//
//             <div className={styles.field}>
//               <label>Спосіб доставки *</label>
//               <select
//                 className={styles.select}
//                 value={deliveryMethod}
//                 onChange={(e) => {
//                   setDeliveryMethod(e.target.value);
//                   setBranch('');
//                 }}
//               >
//                 {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                   <option key={key} value={key}>{cfg.label}</option>
//                 ))}
//               </select>
//             </div>
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>Місто *</label>
//                 <input
//                   className={styles.input}
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   placeholder="Місто"
//                 />
//               </div>
//             )}
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>{currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}</label>
//                 <input
//                   className={styles.input}
//                   value={branch}
//                   onChange={(e) => setBranch(e.target.value)}
//                   placeholder={currentDelivery.placeholder}
//                 />
//               </div>
//             )}
//
//             <div className={styles.field}>
//               <label>Спосіб оплати *</label>
//               <select
//                 className={styles.select}
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="cod">Оплата при отриманні</option>
//                 <option value="card">Оплата на карту</option>
//               </select>
//             </div>
//
//             <div className={styles.field}>
//               <label>Примітки</label>
//               <textarea
//                 className={styles.textarea}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Додаткова інформація..."
//               />
//             </div>
//
//             <button
//               className={styles.confirmBtn}
//               onClick={handleFinalOrder}
//               disabled={!isFormValid || isSubmitting}
//             >
//               {isSubmitting ? 'Відправка...' : 'Підтвердити'}
//             </button>
//             <button className={styles.backLink} onClick={() => setStep('summary')}>Назад</button>
//           </fieldset>
//         </div>
//       )}
//
//       {step === 'success' && (
//         <div className={styles.animateFade}>
//           <div className={styles.successIcon}>✓</div>
//           <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
//           <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>
//             За необхідності ми зв'яжемося з Вами за номером:<br/>
//             <strong>{phone}</strong> для уточнення деталей.
//           </p>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
//           <Link to="/catalog" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>
//             <Button>За новими покупками</Button>
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default CheckoutSidebar;

//
// import { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { supabase } from '../../../supabaseClient.js';
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
//
// const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
//   const dispatch = useDispatch();
//
//   const isProcessing = useRef(false);
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
//   // Хелпер: відхиляє проміс через ms мілісекунд
//   // Використовуємо скрізь де є await на Supabase або fetch
//   const timeout = (ms) => new Promise((_, reject) =>
//     setTimeout(() => reject(new Error("Час очікування вичерпано")), ms)
//   );
//
//   // ВИПРАВЛЕННЯ 1: sendOrderEmail більше не async-блокуючий для головного флоу.
//   // AbortController дозволяє реально скасувати fetch (на відміну від Promise.race,
//   // який тільки "перестає чекати", але з'єднання залишається відкритим і займає слот).
//   const sendOrderEmail = (orderId, currentItems, totalPriceUahFinal) => {
//     const clientEmail = user?.email || "no-email@maxgear.com.ua";
//
//     const itemsWithUahPrice = currentItems.map(item => ({
//       ...item,
//       price_uah: Math.round(item.price_eur * rate)
//     }));
//
//     const payload = {
//       order_id: orderId,
//       full_user_name: `${lastName} ${firstName}`.trim(),
//       first_name: firstName.trim(),
//       last_name: lastName.trim(),
//       user_email: clientEmail,
//       user_phone: phone,
//       delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
//       payment_method: paymentMethod,
//       total_price_eur: totalPriceEur,
//       total_price_uah: totalPriceUahFinal,
//       notes: notes,
//       items: itemsWithUahPrice,
//     };
//
//     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//
//     // AbortController реально закриває TCP-з'єднання після таймауту.
//     // Без нього fetch може висіти нескінченно і займати один із ~6 браузерних слотів
//     // до одного хоста — через це наступні замовлення зависали.
//     const controller = new AbortController();
//     const abortTimer = setTimeout(() => controller.abort(), 8000);
//
//     // Повертаємо Promise, але НЕ await-имо його в handleFinalOrder —
//     // він виконується у фоні і не блокує UI
//     return fetch(`${API_URL}/api/cart/checkout`, {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify(payload),
//       signal: controller.signal,
//     })
//       .then(res => {
//         clearTimeout(abortTimer);
//         if (!res.ok) console.error("❌ Email API error:", res.status);
//       })
//       .catch(err => {
//         // AbortError — це наш таймаут, не критична помилка
//         if (err.name !== 'AbortError') console.error("❌ Email fetch error:", err);
//       });
//   };
//
//   const handleFinalOrder = async () => {
//     if (isProcessing.current) return;
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     isProcessing.current = true;
//     setIsSubmitting(true);
//     if (onLoading) onLoading(true);
//
//     try {
//       // ВИПРАВЛЕННЯ 2: прибираємо ручний refreshSession.
//       // refreshSession() сам робить мережевий запит до Supabase Auth і може зависнути.
//       // Supabase JS клієнт автоматично оновлює токен при кожному запиті до БД —
//       // тобто orders.insert нижче сам зробить refresh якщо треба.
//       // getSession() — лише локальна перевірка (без мережі), швидко і безпечно.
//       console.log("🛰️ Step 0: Checking session...");
//       const {data: sessionData} = await supabase.auth.getSession();
//       if (!sessionData?.session) throw new Error("Сесія недійсна, будь ласка, перезайдіть");
//       console.log("✅ Step 0: Session OK.");
//
//       const cleanPhone = phone.replace(/\D/g, '');
//
//       // ВИПРАВЛЕННЯ 3: timeout на orders.insert залишаємо — це критично важливий запит
//       const {data: orderData, error: orderError} = await Promise.race([
//         supabase.from('orders').insert([{
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
//         }]).select('id, order_number'),
//         timeout(6000)
//       ]);
//
//       if (orderError) throw orderError;
//       if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");
//
//       const order = orderData[0];
//
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
//       // ВИПРАВЛЕННЯ 4: timeout на order_items.insert — раніше його не було взагалі,
//       // міг зависнути нескінченно
//       const {error: itemsError} = await Promise.race([
//         supabase.from('order_items').insert(itemsToInsert),
//         timeout(6000)
//       ]);
//
//       if (itemsError) throw itemsError;
//
//       // --- Все критичне виконано. Показуємо успіх. ---
//
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       if (onSuccess) onSuccess();
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//
//       // Очищаємо кошик — теж не критично для UX, але нехай буде в основному флоу
//       dispatch(clearEntireCart(user.id));
//
//       // ВИПРАВЛЕННЯ 5: sendOrderEmail і profiles.upsert — fire-and-forget.
//       // Раніше вони були await — тобто finally (і onLoading(false)) не викликався
//       // поки ці запити не завершаться. Якщо вони зависали — кошик залишався
//       // заблокованим для юзера навіть після успішного замовлення.
//       // Тепер вони виконуються у фоні, не займають await і не блокують з'єднання.
//       sendOrderEmail(formattedOrderNumber, items, totalPriceUah); // навмисно без await
//
//       supabase.from('profiles').upsert({   // навмисно без await
//         id: user.id,
//         first_name: firstName,
//         last_name: lastName,
//         phone: cleanPhone,
//         city: city,
//         branch: branch,
//         delivery_method: deliveryMethod,
//         updated_at: new Date()
//       })
//         .then(() => console.log("👤 Profile updated"))
//         .catch(err => console.error("❌ Profile upsert error:", err));
//
//     } catch (error) {
//       console.error("🚨 [CRITICAL ERROR]:", error);
//
//       if (error.message === "SESSION_TIMEOUT" || error.message === "Час очікування вичерпано") {
//         toast.error("Помилка відправлення. Будь ласка, перезавантажте сторінку та спробуйте ще раз.", {
//           duration: 8000,
//         });
//       } else {
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
//       console.log("🏁 [ORDER FINISHED]");
//       setIsSubmitting(false);
//       if (onLoading) onLoading(false);
//       isProcessing.current = false;
//     }
//   };
//
//   useEffect(() => {
//     if (user && !isDataLoaded) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) setPhone(formatPhoneToMask(user.phone));
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded]);
//
//   const cleanPhoneValid = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhoneValid.length === 12;
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityValid = deliveryMethod === 'self' || city.trim().length >= 2;
//   const isFormValid = isPhoneValid && firstName.trim().length >= 2 && lastName.trim().length >= 2 && isCityValid && isBranchValid;
//
//   return (
//     <div className={styles.summary}>
//       {step === 'summary' && (
//         <div className={styles.animateFade}>
//           <h3>Разом:</h3>
//           <div className={styles.prices}>
//             <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//             <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//           </div>
//           <button className={styles.orderBtn} onClick={() => {
//             setStep('checkout');
//             trigger('tick');
//           }}>
//             Оформити замовлення
//           </button>
//         </div>
//       )}
//
//       {step === 'checkout' && (
//         <div className={styles.animateFade}>
//           <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//           <fieldset disabled={isSubmitting} className={styles.fieldset}>
//             <div className={styles.row}>
//               <div className={styles.field}>
//                 <label>Прізвище *</label>
//                 <input
//                   className={styles.input}
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   placeholder="Прізвище"
//                 />
//               </div>
//               <div className={styles.field}>
//                 <label>Ім'я *</label>
//                 <input
//                   className={styles.input}
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   placeholder="Ім'я"
//                 />
//               </div>
//             </div>
//
//             <div className={styles.field}>
//               <label>Телефон *</label>
//               <InputMask
//                 mask="+38 (0__) ___-__-__"
//                 replacement={{_: /\d/}}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${styles.input} ${!isPhoneValid && cleanPhoneValid.length > 3 ? styles.error : ''}`}
//                 placeholder="+38 (0__) ___-__-__"
//               />
//             </div>
//
//             <div className={styles.field}>
//               <label>Спосіб доставки *</label>
//               <select
//                 className={styles.select}
//                 value={deliveryMethod}
//                 onChange={(e) => {
//                   setDeliveryMethod(e.target.value);
//                   setBranch('');
//                 }}
//               >
//                 {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                   <option key={key} value={key}>{cfg.label}</option>
//                 ))}
//               </select>
//             </div>
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>Місто *</label>
//                 <input
//                   className={styles.input}
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   placeholder="Місто"
//                 />
//               </div>
//             )}
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>{currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}</label>
//                 <input
//                   className={styles.input}
//                   value={branch}
//                   onChange={(e) => setBranch(e.target.value)}
//                   placeholder={currentDelivery.placeholder}
//                 />
//               </div>
//             )}
//
//             <div className={styles.field}>
//               <label>Спосіб оплати *</label>
//               <select
//                 className={styles.select}
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="cod">Оплата при отриманні</option>
//                 <option value="card">Оплата на карту</option>
//               </select>
//             </div>
//
//             <div className={styles.field}>
//               <label>Примітки</label>
//               <textarea
//                 className={styles.textarea}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Додаткова інформація..."
//               />
//             </div>
//
//             <button
//               className={styles.confirmBtn}
//               onClick={handleFinalOrder}
//               disabled={!isFormValid || isSubmitting}
//             >
//               {isSubmitting ? 'Відправка...' : 'Підтвердити'}
//             </button>
//             <button className={styles.backLink} onClick={() => setStep('summary')}>Назад</button>
//           </fieldset>
//         </div>
//       )}
//
//       {step === 'success' && (
//         <div className={styles.animateFade}>
//           <div className={styles.successIcon}>✓</div>
//           <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
//           <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>
//             За необхідності ми зв'яжемося з Вами за номером:<br/>
//             <strong>{phone}</strong> для уточнення деталей.
//           </p>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
//           <Link to="/catalog" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>
//             <Button>За новими покупками</Button>
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default CheckoutSidebar;


// import { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { supabase } from '../../../supabaseClient.js';
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
//
// const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
//   const dispatch = useDispatch();
//   const isProcessing = useRef(false);
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
//   const timeout = (ms) => new Promise((_, reject) =>
//     setTimeout(() => reject(new Error("Час очікування вичерпано")), ms)
//   );
//
//   const sendOrderEmail = (orderId, currentItems, totalPriceUahFinal) => {
//     const clientEmail = user?.email || "no-email@maxgear.com.ua";
//
//     // ЛОГ 1: Перевіряємо що реально йде в email — чи items не порожні після clearCart
//     console.log("📧 [EMAIL] Starting. Order:", orderId);
//     console.log("📧 [EMAIL] Items count:", currentItems.length);
//     console.log("📧 [EMAIL] Items:", currentItems);
//     console.log("📧 [EMAIL] totalPriceUah:", totalPriceUahFinal);
//     console.log("📧 [EMAIL] User email:", clientEmail);
//
//     const itemsWithUahPrice = currentItems.map(item => ({
//       ...item,
//       price_uah: Math.round(item.price_eur * rate)
//     }));
//
//     const payload = {
//       order_id: orderId,
//       full_user_name: `${lastName} ${firstName}`.trim(),
//       first_name: firstName.trim(),
//       last_name: lastName.trim(),
//       user_email: clientEmail,
//       user_phone: phone,
//       delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
//       payment_method: paymentMethod,
//       total_price_eur: totalPriceEur,
//       total_price_uah: totalPriceUahFinal,
//       notes: notes,
//       items: itemsWithUahPrice,
//     };
//
//     // ЛОГ 2: Повний payload який відправляємо на бекенд
//     console.log("📧 [EMAIL] Full payload:", JSON.stringify(payload, null, 2));
//
//     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//     console.log("📧 [EMAIL] API URL:", API_URL);
//
//     const controller = new AbortController();
//     const abortTimer = setTimeout(() => {
//       // ЛОГ 3: якщо спрацював — значить бекенд не відповів за 8 сек
//       console.warn("📧 [EMAIL] ⏰ AbortController спрацював — бекенд не відповів за 8 сек!");
//       controller.abort();
//     }, 8000);
//
//     // ЛОГ 4: Фіксуємо час початку fetch
//     const fetchStart = performance.now();
//     console.log("📧 [EMAIL] Fetch started at:", new Date().toISOString());
//
//     return fetch(`${API_URL}/api/cart/checkout`, {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify(payload),
//       signal: controller.signal,
//     })
//       .then(res => {
//         clearTimeout(abortTimer);
//         const fetchDuration = Math.round(performance.now() - fetchStart);
//         // ЛОГ 5: Бекенд відповів — бачимо статус і час відповіді
//         console.log(`📧 [EMAIL] Response received in ${fetchDuration}ms. Status:`, res.status, res.statusText);
//         if (!res.ok) {
//           // ЛОГ 6: Бекенд повернув помилку — читаємо тіло щоб зрозуміти причину
//           return res.text().then(text => {
//             console.error("📧 [EMAIL] ❌ Server error body:", text);
//           });
//         } else {
//           console.log("📧 [EMAIL] ✅ Email sent successfully!");
//         }
//       })
//       .catch(err => {
//         const fetchDuration = Math.round(performance.now() - fetchStart);
//         if (err.name === 'AbortError') {
//           // ЛОГ 7: AbortError — це наш таймаут
//           console.warn(`📧 [EMAIL] ⏰ Fetch aborted after ${fetchDuration}ms (timeout)`);
//         } else {
//           // ЛОГ 8: Інша мережева помилка — CORS, DNS, з'єднання відхилено тощо
//           console.error(`📧 [EMAIL] ❌ Fetch error after ${fetchDuration}ms:`, err.name, err.message);
//         }
//       });
//   };
//
//   const handleFinalOrder = async () => {
//     // ЛОГ 9: Початок — бачимо чи не блокує isProcessing повторний виклик
//     console.log("🚀 [ORDER] handleFinalOrder called. isProcessing:", isProcessing.current);
//
//     if (isProcessing.current) {
//       console.warn("🚀 [ORDER] Blocked — already processing!");
//       return;
//     }
//     if (!user?.id) {
//       toast.error("Будь ласка, увійдіть в акаунт");
//       return;
//     }
//
//     isProcessing.current = true;
//     setIsSubmitting(true);
//     if (onLoading) onLoading(true);
//
//     // ЛОГ 10: Загальний таймер всього флоу замовлення
//     console.time("⏱️ [ORDER] Total order time");
//
//     try {
//       const cleanPhone = phone.replace(/\D/g, '');
//
//       // --- КРОК 1: orders.insert ---
//       console.log("📝 [ORDER] Step 1: Inserting order...");
//       console.time("⏱️ [ORDER] Step 1: orders.insert");
//
//       const {data: orderData, error: orderError} = await Promise.race([
//         supabase.from('orders').insert([{
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
//         }]).select('id, order_number'),
//         timeout(6000)
//       ]);
//
//       console.timeEnd("⏱️ [ORDER] Step 1: orders.insert");
//
//       if (orderError) {
//         // ЛОГ 12: Помилка Supabase — бачимо код і повідомлення
//         console.error("❌ [ORDER] orders.insert error:", orderError.code, orderError.message, orderError.details);
//         throw orderError;
//       }
//       if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");
//
//       const order = orderData[0];
//       // ЛОГ 13: Замовлення успішно створено
//       console.log("✅ [ORDER] Order created. ID:", order.id, "| Number:", order.order_number);
//
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
//       // --- КРОК 2: order_items.insert ---
//       console.log("📦 [ORDER] Step 2: Inserting", itemsToInsert.length, "order_items...");
//       console.time("⏱️ [ORDER] Step 2: order_items.insert");
//
//       const {error: itemsError} = await Promise.race([
//         supabase.from('order_items').insert(itemsToInsert),
//         timeout(6000)
//       ]);
//
//       console.timeEnd("⏱️ [ORDER] Step 2: order_items.insert");
//
//       if (itemsError) {
//         // ЛОГ 14: Помилка вставки items
//         console.error("❌ [ORDER] order_items.insert error:", itemsError.code, itemsError.message);
//         throw itemsError;
//       }
//
//       console.log("✅ [ORDER] order_items inserted successfully.");
//
//       // --- Все критичне виконано ---
//       const formattedOrderNumber = String(order.order_number).padStart(6, '0');
//       setDisplayOrderNumber(formattedOrderNumber);
//       setStep('success');
//       if (onSuccess) onSuccess();
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//
//       // ЛОГ 15: Фіксуємо items ДО clearCart
//       // ВАЖЛИВО: sendOrderEmail запускаємо ДО clearEntireCart
//       // щоб items ще були живі в момент відправки
//       console.log("🛒 [ORDER] items.length before clearCart:", items.length);
//       sendOrderEmail(formattedOrderNumber, items, totalPriceUah); // fire-and-forget, але items ще живі
//
//       dispatch(clearEntireCart(user.id));
//       console.log("🛒 [ORDER] Cart cleared.");
//
//       // profiles.upsert — fire-and-forget
//       console.log("👤 [ORDER] Updating profile in background...");
//       supabase.from('profiles').upsert({
//         id: user.id,
//         first_name: firstName,
//         last_name: lastName,
//         phone: cleanPhone,
//         city: city,
//         branch: branch,
//         delivery_method: deliveryMethod,
//         updated_at: new Date()
//       })
//         .then(() => console.log("👤 [ORDER] ✅ Profile updated"))
//         .catch(err => console.error("👤 [ORDER] ❌ Profile upsert error:", err.message));
//
//     } catch (error) {
//       // ЛОГ 16: Детальна інформація про помилку
//       console.error("🚨 [ORDER] CRITICAL ERROR:", error.name, error.message);
//       console.error("🚨 [ORDER] Full error:", error);
//
//       if (error.message === "SESSION_TIMEOUT" || error.message === "Час очікування вичерпано") {
//         toast.error("Помилка відправлення. Будь ласка, перезавантажте сторінку та спробуйте ще раз.", {
//           duration: 8000,
//         });
//       } else {
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
//       console.timeEnd("⏱️ [ORDER] Total order time");
//       console.log("🏁 [ORDER] FINISHED. isSubmitting → false, isProcessing → false");
//       setIsSubmitting(false);
//       if (onLoading) onLoading(false);
//       isProcessing.current = false;
//     }
//   };
//
//   useEffect(() => {
//     if (user && !isDataLoaded) {
//       setFirstName(user.first_name || '');
//       setLastName(user.last_name || '');
//       setCity(user.city || '');
//       setBranch(user.branch || '');
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) setPhone(formatPhoneToMask(user.phone));
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded]);
//
//   const cleanPhoneValid = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhoneValid.length === 12;
//   const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
//   const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
//   const isCityValid = deliveryMethod === 'self' || city.trim().length >= 2;
//   const isFormValid = isPhoneValid && firstName.trim().length >= 2 && lastName.trim().length >= 2 && isCityValid && isBranchValid;
//
//   return (
//     <div className={styles.summary}>
//       {step === 'summary' && (
//         <div className={styles.animateFade}>
//           <h3>Разом:</h3>
//           <div className={styles.prices}>
//             <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
//             <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
//           </div>
//           <button className={styles.orderBtn} onClick={() => {
//             setStep('checkout');
//             trigger('tick');
//           }}>
//             Оформити замовлення
//           </button>
//         </div>
//       )}
//
//       {step === 'checkout' && (
//         <div className={styles.animateFade}>
//           <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
//           <fieldset disabled={isSubmitting} className={styles.fieldset}>
//             <div className={styles.row}>
//               <div className={styles.field}>
//                 <label>Прізвище *</label>
//                 <input
//                   className={styles.input}
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   placeholder="Прізвище"
//                 />
//               </div>
//               <div className={styles.field}>
//                 <label>Ім'я *</label>
//                 <input
//                   className={styles.input}
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   placeholder="Ім'я"
//                 />
//               </div>
//             </div>
//
//             <div className={styles.field}>
//               <label>Телефон *</label>
//               <InputMask
//                 mask="+38 (0__) ___-__-__"
//                 replacement={{_: /\d/}}
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${styles.input} ${!isPhoneValid && cleanPhoneValid.length > 3 ? styles.error : ''}`}
//                 placeholder="+38 (0__) ___-__-__"
//               />
//             </div>
//
//             <div className={styles.field}>
//               <label>Спосіб доставки *</label>
//               <select
//                 className={styles.select}
//                 value={deliveryMethod}
//                 onChange={(e) => {
//                   setDeliveryMethod(e.target.value);
//                   setBranch('');
//                 }}
//               >
//                 {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
//                   <option key={key} value={key}>{cfg.label}</option>
//                 ))}
//               </select>
//             </div>
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>Місто *</label>
//                 <input
//                   className={styles.input}
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   placeholder="Місто"
//                 />
//               </div>
//             )}
//
//             {deliveryMethod !== 'self' && (
//               <div className={styles.field}>
//                 <label>{currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}</label>
//                 <input
//                   className={styles.input}
//                   value={branch}
//                   onChange={(e) => setBranch(e.target.value)}
//                   placeholder={currentDelivery.placeholder}
//                 />
//               </div>
//             )}
//
//             <div className={styles.field}>
//               <label>Спосіб оплати *</label>
//               <select
//                 className={styles.select}
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="cod">Оплата при отриманні</option>
//                 <option value="card">Оплата на карту</option>
//               </select>
//             </div>
//
//             <div className={styles.field}>
//               <label>Примітки</label>
//               <textarea
//                 className={styles.textarea}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Додаткова інформація..."
//               />
//             </div>
//
//             <button
//               className={styles.confirmBtn}
//               onClick={handleFinalOrder}
//               disabled={!isFormValid || isSubmitting}
//             >
//               {isSubmitting ? 'Відправка...' : 'Підтвердити'}
//             </button>
//             <button className={styles.backLink} onClick={() => setStep('summary')}>Назад</button>
//           </fieldset>
//         </div>
//       )}
//
//       {step === 'success' && (
//         <div className={styles.animateFade}>
//           <div className={styles.successIcon}>✓</div>
//           <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
//           <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>
//             За необхідності ми зв'яжемося з Вами за номером:<br/>
//             <strong>{phone}</strong> для уточнення деталей.
//           </p>
//           <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
//           <Link to="/catalog" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>
//             <Button>За новими покупками</Button>
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default CheckoutSidebar;


import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputMask } from '@react-input/mask';
import toast from "react-hot-toast";
import { clearEntireCart } from '../../../redux/cart/cartOps';
import Button from "../../Button/Button.jsx";
import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
import styles from './CheckoutSidebar.module.css';

// ЗВЕРНИ УВАГУ: supabase більше не імпортується тут взагалі.
// Фронт більше не пише в БД напряму — тільки один fetch на бекенд.


const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
  const dispatch = useDispatch();
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

  const handleFinalOrder = async () => {
    if (isProcessing.current) return;
    if (!user?.id) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    isProcessing.current = true;
    setIsSubmitting(true);
    if (onLoading) onLoading(true);

    // AbortController — реально скасовує fetch якщо бекенд не відповідає
    const controller = new AbortController();
    const abortTimer = setTimeout(() => {
      console.warn("⏰ [ORDER] Бекенд не відповів за 15 сек — скасовуємо запит");
      controller.abort();
    }, 15000); // 15 сек — достатньо навіть для cold start на Render

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      console.log("🚀 [ORDER] Sending to backend...");
      const fetchStart = performance.now();

      // ОДИН ЗАПИТ на бекенд — він робить все:
      // orders insert + order_items insert + profiles upsert + email + clear cart
      const response = await fetch(`${API_URL}/api/cart/create-order`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          user_email: user.email || "no-email@maxgear.com.ua",
          user_phone: cleanPhone,
          ship_city: deliveryMethod === 'self' ? 'Самбір' : city,
          ship_method: deliveryMethod,
          ship_branch: branch,
          payment_method: paymentMethod,
          total_price_eur: totalPriceEur,
          total_price_uah: totalPriceUah,
          notes: notes,
          items: items.map(item => ({
            product_id: item.product_id,
            supplier_id: item.supplier_id,
            code: item.code,
            brand: item.brand,
            price_eur: item.price_eur,
            quantity: item.quantity,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(abortTimer);
      const duration = Math.round(performance.now() - fetchStart);
      console.log(`✅ [ORDER] Response in ${duration}ms. Status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Помилка сервера: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [ORDER] Success:", result);

      setDisplayOrderNumber(result.order_number);
      setStep('success');
      if (onSuccess) onSuccess();
      trigger('success');
      toast.success("Замовлення відправлене!");

      // Очищаємо Redux кошик (БД вже очищена на бекенді)
      dispatch(clearEntireCart(user.id));

    } catch (error) {
      clearTimeout(abortTimer);

      if (error.name === 'AbortError') {
        console.error("🚨 [ORDER] Request aborted (timeout)");
        toast.error("Сервер не відповідає. Будь ласка, спробуйте ще раз.", {duration: 8000});
      } else {
        console.error("🚨 [ORDER] Error:", error.message);
        toast.error(error.message || "Сталася помилка");
      }
    } finally {
      console.log("🏁 [ORDER] FINISHED");
      setIsSubmitting(false);
      if (onLoading) onLoading(false);
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    if (user && !isDataLoaded) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setCity(user.city || '');
      setBranch(user.branch || '');
      setDeliveryMethod(user.delivery_method || 'np_branch');
      if (user.phone) setPhone(formatPhoneToMask(user.phone));
      setIsDataLoaded(true);
    }
  }, [user, isDataLoaded]);

  const cleanPhoneValid = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhoneValid.length === 12;
  const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
  const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
  const isCityValid = deliveryMethod === 'self' || city.trim().length >= 2;
  const isFormValid = isPhoneValid && firstName.trim().length >= 2 && lastName.trim().length >= 2 && isCityValid && isBranchValid;

  return (
    <div className={styles.summary}>
      {step === 'summary' && (
        <div className={styles.animateFade}>
          <h3>Разом:</h3>
          <div className={styles.prices}>
            <span className={styles.eur}>{totalPriceEur.toLocaleString()} €</span>
            <span className={styles.uah}>{totalPriceUah.toLocaleString()} ₴</span>
          </div>
          <button className={styles.orderBtn} onClick={() => {
            setStep('checkout');
            trigger('tick');
          }}>
            Оформити замовлення
          </button>
        </div>
      )}

      {step === 'checkout' && (
        <div className={styles.animateFade}>
          <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
          <fieldset disabled={isSubmitting} className={styles.fieldset}>
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
                className={`${styles.input} ${!isPhoneValid && cleanPhoneValid.length > 3 ? styles.error : ''}`}
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
                  className={styles.input}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Місто"
                />
              </div>
            )}

            {deliveryMethod !== 'self' && (
              <div className={styles.field}>
                <label>{currentDelivery.fieldLabel} {currentDelivery.required ? '*' : ''}</label>
                <input
                  className={styles.input}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder={currentDelivery.placeholder}
                />
              </div>
            )}

            <div className={styles.field}>
              <label>Спосіб оплати *</label>
              <select
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
            <button className={styles.backLink} onClick={() => setStep('summary')}>Назад</button>
          </fieldset>
        </div>
      )}

      {step === 'success' && (
        <div className={styles.animateFade}>
          <div className={styles.successIcon}>✓</div>
          <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
          <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
          <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>
            За необхідності ми зв'яжемося з Вами за номером:<br/>
            <strong>{phone}</strong> для уточнення деталей.
          </p>
          <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
          <Link to="/catalog" style={{marginTop: '20px', display: 'block', textAlign: 'center'}}>
            <Button>За новими покупками</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CheckoutSidebar;
