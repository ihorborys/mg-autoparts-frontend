// import { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
// // ЗВЕРНИ УВАГУ: supabase більше не імпортується тут взагалі.
// // Фронт більше не пише в БД напряму — тільки один fetch на бекенд.
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
//     // AbortController — реально скасовує fetch якщо бекенд не відповідає
//     const controller = new AbortController();
//     const abortTimer = setTimeout(() => {
//       console.warn("⏰ [ORDER] Бекенд не відповів за 15 сек — скасовуємо запит");
//       controller.abort();
//     }, 15000); // 15 сек — достатньо навіть для cold start на Render
//
//     try {
//       const cleanPhone = phone.replace(/\D/g, '');
//       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
//
//       console.log("🚀 [ORDER] Sending to backend...");
//       const fetchStart = performance.now();
//
//       // ОДИН ЗАПИТ на бекенд — він робить все:
//       // orders insert + order_items insert + profiles upsert + email + clear cart
//       const response = await fetch(`${API_URL}/api/cart/create-order`, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({
//           user_id: user.id,
//           first_name: firstName.trim(),
//           last_name: lastName.trim(),
//           user_email: user.email || "no-email@maxgear.com.ua",
//           user_phone: cleanPhone,
//           ship_city: deliveryMethod === 'self' ? 'Самбір' : city,
//           ship_method: deliveryMethod,
//           ship_branch: branch,
//           payment_method: paymentMethod,
//           total_price_eur: totalPriceEur,
//           total_price_uah: totalPriceUah,
//           notes: notes,
//           items: items.map(item => ({
//             product_id: item.product_id,
//             supplier_id: item.supplier_id,
//             code: item.code,
//             brand: item.brand,
//             price_eur: item.price_eur,
//             quantity: item.quantity,
//           })),
//         }),
//         signal: controller.signal,
//       });
//
//       clearTimeout(abortTimer);
//       const duration = Math.round(performance.now() - fetchStart);
//       console.log(`✅ [ORDER] Response in ${duration}ms. Status:`, response.status);
//
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `Помилка сервера: ${response.status}`);
//       }
//
//       const result = await response.json();
//       console.log("✅ [ORDER] Success:", result);
//
//       setDisplayOrderNumber(result.order_number);
//       setStep('success');
//       if (onSuccess) onSuccess();
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//
//       // Очищаємо Redux кошик (БД вже очищена на бекенді)
//       dispatch(clearEntireCart(user.id));
//
//     } catch (error) {
//       clearTimeout(abortTimer);
//
//       if (error.name === 'AbortError') {
//         console.error("🚨 [ORDER] Request aborted (timeout)");
//         toast.error("Сервер не відповідає. Будь ласка, спробуйте ще раз.", {duration: 8000});
//       } else {
//         console.error("🚨 [ORDER] Error:", error.message);
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
//       console.log("🏁 [ORDER] FINISHED");
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


// import { useEffect, useRef, useState, useCallback } from 'react';
// import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { InputMask } from '@react-input/mask';
// import toast from "react-hot-toast";
// import { clearEntireCart } from '../../../redux/cart/cartOps';
// import Button from "../../Button/Button.jsx";
// import { formatPhoneToMask } from '../../../utils/helpers.js';
// import styles from './CheckoutSidebar.module.css';
//
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
//   const [deliveryMethod, setDeliveryMethod] = useState('np_branch');
//
//   const [cityQuery, setCityQuery] = useState('');
//   const [cityRef, setCityRef] = useState('');
//   const [cityLabel, setCityLabel] = useState('');
//   const [citySuggestions, setCitySuggestions] = useState([]);
//   const [isCityLoading, setIsCityLoading] = useState(false);
//   const [showCitySuggestions, setShowCitySuggestions] = useState(false);
//
//   const [warehouses, setWarehouses] = useState([]);
//   const [warehouseRef, setWarehouseRef] = useState('');
//   const [warehouseLabel, setWarehouseLabel] = useState('');
//   const [isWarehousesLoading, setIsWarehousesLoading] = useState(false);
//
//   const [paymentMethod, setPaymentMethod] = useState('cod');
//   const [notes, setNotes] = useState('');
//   const [displayOrderNumber, setDisplayOrderNumber] = useState('');
//
//   const citySearchTimer = useRef(null);
//   const cityInputRef = useRef(null);
//
//   const handleCityInput = (e) => {
//     const value = e.target.value;
//     setCityQuery(value);
//
//     if (cityRef) {
//       setCityRef('');
//       setCityLabel('');
//       setWarehouses([]);
//       setWarehouseRef('');
//       setWarehouseLabel('');
//     }
//
//     clearTimeout(citySearchTimer.current);
//
//     if (value.trim().length < 2) {
//       setCitySuggestions([]);
//       setShowCitySuggestions(false);
//       return;
//     }
//
//     citySearchTimer.current = setTimeout(async () => {
//       setIsCityLoading(true);
//       try {
//         const res = await fetch(`${API_URL}/api/nova-poshta/cities?q=${encodeURIComponent(value.trim())}`);
//         if (!res.ok) throw new Error();
//         const data = await res.json();
//         setCitySuggestions(data);
//         setShowCitySuggestions(true);
//       } catch {
//         setCitySuggestions([]);
//       } finally {
//         setIsCityLoading(false);
//       }
//     }, 400);
//   };
//
//   const handleCitySelect = async (city) => {
//     setCityQuery(city.description);
//     setCityRef(city.ref);
//     setCityLabel(city.city);
//     setCitySuggestions([]);
//     setShowCitySuggestions(false);
//     setWarehouseRef('');
//     setWarehouseLabel('');
//     setWarehouses([]);
//
//     setIsWarehousesLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/nova-poshta/warehouses?city_ref=${city.ref}`);
//       if (!res.ok) throw new Error();
//       const data = await res.json();
//       setWarehouses(data);
//     } catch {
//       toast.error("Не вдалося завантажити відділення");
//     } finally {
//       setIsWarehousesLoading(false);
//     }
//   };
//
//   const handleDeliveryChange = (method) => {
//     setDeliveryMethod(method);
//     setCityQuery('');
//     setCityRef('');
//     setCityLabel('');
//     setCitySuggestions([]);
//     setWarehouses([]);
//     setWarehouseRef('');
//     setWarehouseLabel('');
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
//     const controller = new AbortController();
//     const abortTimer = setTimeout(() => {
//       controller.abort();
//     }, 15000);
//
//     try {
//       const cleanPhone = phone.replace(/\D/g, '');
//       const selectedWarehouse = warehouses.find(w => w.ref === warehouseRef);
//       const branchNumber = selectedWarehouse?.number || '';
//       const branchFull = selectedWarehouse?.description || warehouseLabel;
//
//       const response = await fetch(`${API_URL}/api/cart/create-order`, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({
//           user_id: user.id,
//           first_name: firstName.trim(),
//           last_name: lastName.trim(),
//           user_email: user.email || "no-email@maxgear.com.ua",
//           user_phone: cleanPhone,
//           ship_city: deliveryMethod === 'self' ? 'Самбір' : cityLabel,
//           ship_method: deliveryMethod,
//           ship_branch: deliveryMethod === 'self' ? '' : branchNumber,
//           ship_branch_full: deliveryMethod === 'self' ? '' : branchFull,
//           payment_method: paymentMethod,
//           total_price_eur: totalPriceEur,
//           total_price_uah: totalPriceUah,
//           notes: notes,
//           items: items.map(item => ({
//             product_id: item.product_id,
//             supplier_id: item.supplier_id,
//             code: item.code,
//             brand: item.brand,
//             price_eur: item.price_eur,
//             quantity: item.quantity,
//           })),
//         }),
//         signal: controller.signal,
//       });
//
//       clearTimeout(abortTimer);
//
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `Помилка сервера: ${response.status}`);
//       }
//
//       const result = await response.json();
//       setDisplayOrderNumber(result.order_number);
//       setStep('success');
//       if (onSuccess) onSuccess();
//       trigger('success');
//       toast.success("Замовлення відправлене!");
//       dispatch(clearEntireCart(user.id));
//
//     } catch (error) {
//       clearTimeout(abortTimer);
//       if (error.name === 'AbortError') {
//         toast.error("Сервер не відповідає. Спробуйте ще раз.", {duration: 8000});
//       } else {
//         toast.error(error.message || "Сталася помилка");
//       }
//     } finally {
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
//       setDeliveryMethod(user.delivery_method || 'np_branch');
//       if (user.phone) setPhone(formatPhoneToMask(user.phone));
//       setIsDataLoaded(true);
//     }
//   }, [user, isDataLoaded]);
//
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (cityInputRef.current && !cityInputRef.current.contains(e.target)) {
//         setShowCitySuggestions(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);
//
//   const cleanPhoneValid = phone.replace(/\D/g, '');
//   const isPhoneValid = cleanPhoneValid.length === 12;
//   const isCityValid = deliveryMethod === 'self' || cityRef !== '';
//   const isWarehouseValid = deliveryMethod === 'self' || warehouseRef !== '';
//   const isFormValid =
//     isPhoneValid &&
//     firstName.trim().length >= 2 &&
//     lastName.trim().length >= 2 &&
//     isCityValid &&
//     isWarehouseValid;
//
//   return (
//     <div className={styles.summary}>
//
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
//
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
//                 onChange={(e) => handleDeliveryChange(e.target.value)}
//               >
//                 <option value="np_branch">Нова Пошта (Відділення / Поштомат)</option>
//                 <option value="self">Самовивіз (м. Самбір)</option>
//               </select>
//             </div>
//
//             {deliveryMethod === 'np_branch' && (
//               <div className={styles.field} ref={cityInputRef}>
//                 <label>Місто *</label>
//                 <div className={styles.autocompleteWrapper}>
//                   <input
//                     className={`${styles.input} ${!isCityValid && cityQuery.length > 1 ? styles.error : ''}`}
//                     value={cityQuery}
//                     onChange={handleCityInput}
//                     onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
//                     placeholder="Введіть назву міста..."
//                     autoComplete="off"
//                   />
//                   {isCityLoading && (
//                     <div className={styles.autocompleteLoader}>Шукаємо...</div>
//                   )}
//                   {showCitySuggestions && citySuggestions.length > 0 && (
//                     <ul className={styles.suggestionsList}>
//                       {citySuggestions.map((city, i) => (
//                         <li
//                           key={i}
//                           className={styles.suggestionItem}
//                           onMouseDown={() => handleCitySelect(city)}
//                         >
//                           {city.description}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {showCitySuggestions && !isCityLoading && citySuggestions.length === 0 && cityQuery.length >= 2 && (
//                     <div className={styles.autocompleteEmpty}>Міст не знайдено</div>
//                   )}
//                 </div>
//               </div>
//             )}
//
//             {deliveryMethod === 'np_branch' && cityRef && (
//               <div className={styles.field}>
//                 <label>Відділення *</label>
//                 {isWarehousesLoading ? (
//                   <div className={styles.autocompleteLoader}>Завантажуємо відділення...</div>
//                 ) : (
//                   <select
//                     className={`${styles.select} ${!isWarehouseValid ? styles.error : ''}`}
//                     value={warehouseRef}
//                     onChange={(e) => {
//                       const selected = warehouses.find(w => w.ref === e.target.value);
//                       setWarehouseRef(e.target.value);
//                       setWarehouseLabel(selected?.description || '');
//                     }}
//                   >
//                     <option value="">— Оберіть відділення —</option>
//                     {warehouses.map(w => (
//                       <option key={w.ref} value={w.ref}>
//                         №{w.number} — {w.short_address}
//                       </option>
//                     ))}
//                   </select>
//                 )}
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
//             За необхідності ми зв'яжемося з Вами для уточнення деталей.
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
import { formatPhoneToMask } from '../../../utils/helpers.js';
import styles from './CheckoutSidebar.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Хелпер: autocomplete інпут з підказками — використовується і для міста і для відділення
const AutocompleteInput = ({
                             value,
                             onChange,
                             onSelect,
                             suggestions,
                             isLoading,
                             placeholder,
                             disabled,
                             hasError,
                             renderItem,        // як відобразити кожен елемент у списку
                             emptyText = "Нічого не знайдено",
                           }) => {
  const [showList, setShowList] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Показуємо список коли є результати
  useEffect(() => {
    if (suggestions.length > 0) setShowList(true);
  }, [suggestions]);

  return (
    <div className={styles.autocompleteWrapper} ref={wrapperRef}>
      <input
        className={`${styles.input} ${hasError ? styles.error : ''}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setShowList(true)}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
      />

      {isLoading && (
        <div className={styles.autocompleteLoader}>Шукаємо...</div>
      )}

      {showList && !isLoading && suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((item, i) => (
            <li
              key={i}
              className={styles.suggestionItem}
              onMouseDown={() => {
                onSelect(item);
                setShowList(false);
              }}
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}

      {showList && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className={styles.autocompleteEmpty}>{emptyText}</div>
      )}
    </div>
  );
};


const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
  const dispatch = useDispatch();
  const isProcessing = useRef(false);

  const [step, setStep] = useState('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Дані юзера
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Доставка
  const [deliveryMethod, setDeliveryMethod] = useState('np_branch');

  // Місто
  const [cityQuery, setCityQuery] = useState('');
  const [cityRef, setCityRef] = useState('');
  const [cityLabel, setCityLabel] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isCityLoading, setIsCityLoading] = useState(false);

  // Відділення
  const [warehouseQuery, setWarehouseQuery] = useState('');
  const [warehouseRef, setWarehouseRef] = useState('');
  const [warehouseLabel, setWarehouseLabel] = useState('');
  const [warehouseSuggestions, setWarehouseSuggestions] = useState([]);
  const [isWarehouseLoading, setIsWarehouseLoading] = useState(false);

  // Оплата і примітки
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [displayOrderNumber, setDisplayOrderNumber] = useState('');

  const cityTimer = useRef(null);
  const warehouseTimer = useRef(null);

  // ─────────────────────────────────────────────
  // ПОШУК МІСТ з дебаунсом
  // ─────────────────────────────────────────────
  const handleCityChange = (value) => {
    setCityQuery(value);

    // Скидаємо вибране місто і відділення якщо юзер почав редагувати
    if (cityRef) {
      setCityRef('');
      setCityLabel('');
      setWarehouseQuery('');
      setWarehouseRef('');
      setWarehouseLabel('');
      setWarehouseSuggestions([]);
    }

    clearTimeout(cityTimer.current);
    if (value.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    cityTimer.current = setTimeout(async () => {
      setIsCityLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/nova-poshta/cities?q=${encodeURIComponent(value.trim())}`);
        if (!res.ok) throw new Error();
        setCitySuggestions(await res.json());
      } catch {
        setCitySuggestions([]);
      } finally {
        setIsCityLoading(false);
      }
    }, 400);
  };

  const handleCitySelect = (city) => {
    setCityQuery(city.description);
    setCityRef(city.ref);
    setCityLabel(city.city);
    setCitySuggestions([]);
    // Скидаємо відділення при зміні міста
    setWarehouseQuery('');
    setWarehouseRef('');
    setWarehouseLabel('');
    setWarehouseSuggestions([]);
  };

  // ─────────────────────────────────────────────
  // ПОШУК ВІДДІЛЕНЬ з дебаунсом
  // Шукає по номеру (14) або вулиці (Шевченка)
  // ─────────────────────────────────────────────
  const handleWarehouseChange = (value) => {
    setWarehouseQuery(value);

    // Скидаємо вибране відділення якщо юзер редагує
    if (warehouseRef) {
      setWarehouseRef('');
      setWarehouseLabel('');
    }

    clearTimeout(warehouseTimer.current);
    if (value.trim().length < 1) {
      setWarehouseSuggestions([]);
      return;
    }

    warehouseTimer.current = setTimeout(async () => {
      setIsWarehouseLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/nova-poshta/warehouses/search?city_ref=${cityRef}&q=${encodeURIComponent(value.trim())}`
        );
        if (!res.ok) throw new Error();
        setWarehouseSuggestions(await res.json());
      } catch {
        setWarehouseSuggestions([]);
      } finally {
        setIsWarehouseLoading(false);
      }
    }, 400);
  };

  const handleWarehouseSelect = (warehouse) => {
    setWarehouseQuery(`№${warehouse.number} — ${warehouse.short_address}`);
    setWarehouseRef(warehouse.ref);
    setWarehouseLabel(warehouse.description);
    setWarehouseSuggestions([]);
  };

  // ─────────────────────────────────────────────
  // ЗМІНА МЕТОДУ ДОСТАВКИ
  // ─────────────────────────────────────────────
  const handleDeliveryChange = (method) => {
    setDeliveryMethod(method);
    setCityQuery('');
    setCityRef('');
    setCityLabel('');
    setCitySuggestions([]);
    setWarehouseQuery('');
    setWarehouseRef('');
    setWarehouseLabel('');
    setWarehouseSuggestions([]);
  };

  // ─────────────────────────────────────────────
  // ВІДПРАВКА ЗАМОВЛЕННЯ
  // ─────────────────────────────────────────────
  const handleFinalOrder = async () => {
    if (isProcessing.current) return;
    if (!user?.id) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    isProcessing.current = true;
    setIsSubmitting(true);
    if (onLoading) onLoading(true);

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 15000);

    try {
      const cleanPhone = phone.replace(/\D/g, '');

      const response = await fetch(`${API_URL}/api/cart/create-order`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          user_email: user.email || "no-email@maxgear.com.ua",
          user_phone: cleanPhone,
          ship_city: deliveryMethod === 'self' ? 'Самбір' : cityLabel,
          ship_method: deliveryMethod,
          ship_branch: deliveryMethod === 'self' ? '' : warehouseQuery,
          ship_branch_full: deliveryMethod === 'self' ? '' : warehouseLabel,
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Помилка сервера: ${response.status}`);
      }

      const result = await response.json();
      setDisplayOrderNumber(result.order_number);
      setStep('success');
      if (onSuccess) onSuccess();
      trigger('success');
      toast.success("Замовлення відправлене!");
      dispatch(clearEntireCart(user.id));

    } catch (error) {
      clearTimeout(abortTimer);
      if (error.name === 'AbortError') {
        toast.error("Сервер не відповідає. Спробуйте ще раз.", {duration: 8000});
      } else {
        toast.error(error.message || "Сталася помилка");
      }
    } finally {
      setIsSubmitting(false);
      if (onLoading) onLoading(false);
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    if (user && !isDataLoaded) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setDeliveryMethod(user.delivery_method || 'np_branch');
      if (user.phone) setPhone(formatPhoneToMask(user.phone));
      setIsDataLoaded(true);
    }
  }, [user, isDataLoaded]);

  // ─────────────────────────────────────────────
  // ВАЛІДАЦІЯ
  // ─────────────────────────────────────────────
  const cleanPhoneValid = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhoneValid.length === 12;
  const isCityValid = deliveryMethod === 'self' || cityRef !== '';
  const isWarehouseValid = deliveryMethod === 'self' || warehouseRef !== '';
  const isFormValid =
    isPhoneValid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    isCityValid &&
    isWarehouseValid;

  return (
    <div className={styles.summary}>

      {/* ─── КРОК 1: ПІДСУМОК ─── */}
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

      {/* ─── КРОК 2: ФОРМА ─── */}
      {step === 'checkout' && (
        <div className={styles.animateFade}>
          <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>
          <fieldset disabled={isSubmitting} className={styles.fieldset}>

            {/* Прізвище + Ім'я */}
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

            {/* Телефон */}
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

            {/* Спосіб доставки */}
            <div className={styles.field}>
              <label>Спосіб доставки *</label>
              <select
                className={styles.select}
                value={deliveryMethod}
                onChange={(e) => handleDeliveryChange(e.target.value)}
              >
                <option value="np_branch">Нова Пошта (Відділення)</option>
                <option value="self">Самовивіз (м. Самбір)</option>
              </select>
            </div>

            {/* НП: Пошук міста */}
            {deliveryMethod === 'np_branch' && (
              <div className={styles.field}>
                <label>Місто *</label>
                <AutocompleteInput
                  value={cityQuery}
                  onChange={handleCityChange}
                  onSelect={handleCitySelect}
                  suggestions={citySuggestions}
                  isLoading={isCityLoading}
                  placeholder="Введіть назву міста..."
                  disabled={isSubmitting}
                  hasError={!isCityValid && cityQuery.length > 1}
                  renderItem={(city) => city.description}
                  emptyText="Місто не знайдено"
                />
              </div>
            )}

            {/* НП: Пошук відділення — з'являється тільки після вибору міста */}
            {deliveryMethod === 'np_branch' && cityRef && (
              <div className={styles.field}>
                <label>Відділення *</label>
                <AutocompleteInput
                  value={warehouseQuery}
                  onChange={handleWarehouseChange}
                  onSelect={handleWarehouseSelect}
                  suggestions={warehouseSuggestions}
                  isLoading={isWarehouseLoading}
                  placeholder="Введіть номер або вулицю..."
                  disabled={isSubmitting}
                  hasError={!isWarehouseValid && warehouseQuery.length > 0}
                  renderItem={(w) => `№${w.number} — ${w.short_address}`}
                  emptyText="Відділень не знайдено"
                />
              </div>
            )}

            {/* Спосіб оплати */}
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

            {/* Примітки */}
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

      {/* ─── КРОК 3: УСПІХ ─── */}
      {step === 'success' && (
        <div className={styles.animateFade}>
          <div className={styles.successIcon}>✓</div>
          <h3 style={{color: '#2ecc71', textAlign: 'center', marginBottom: '10px'}}>Готово!</h3>
          <p style={{textAlign: 'center', marginBottom: '10px'}}>Замовлення №{displayOrderNumber} успішно створене.</p>
          <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>
            За необхідності ми зв'яжемось з Вами для уточнення деталей.
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

