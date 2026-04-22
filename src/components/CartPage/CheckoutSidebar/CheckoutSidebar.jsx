import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputMask } from '@react-input/mask';
import toast from "react-hot-toast";
import { supabase } from '../../../supabaseClient.js';
import { clearEntireCart } from '../../../redux/cart/cartOps';
import Button from "../../Button/Button.jsx";
import { DELIVERY_CONFIG, formatPhoneToMask } from '../../../utils/helpers.js';
import styles from './CheckoutSidebar.module.css';


const CheckoutSidebar = ({user, items, totalPriceEur, totalPriceUah, rate, trigger, onSuccess, onLoading}) => {
  const dispatch = useDispatch();

  // 1. Усі хуки та рефи на самому початку
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

  // Допоміжна функція
  const timeout = (ms) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Час очікування вичерпано")), ms)
  );

  const sendOrderEmail = async (orderId, currentItems, totalPriceUahFinal) => {
    const clientEmail = user?.email || "no-email@maxgear.com.ua";
    try {
      const itemsWithUahPrice = currentItems.map(item => ({
        ...item,
        price_uah: Math.round(item.price_eur * rate)
      }));


      const payload = {
        order_id: orderId,
        full_user_name: `${lastName} ${firstName}`.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        user_email: clientEmail,
        user_phone: phone,
        delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `НП: ${city}, №${branch}`,
        payment_method: paymentMethod,
        total_price_eur: totalPriceEur,
        total_price_uah: totalPriceUahFinal,
        notes: notes,
        items: itemsWithUahPrice,
      };

      console.log(payload);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      return await fetch(`${API_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("❌ Email error:", err);
    }
  };

  const handleFinalOrder = async () => {
    if (isProcessing.current) return;
    if (!user?.id) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    isProcessing.current = true;
    setIsSubmitting(true);
    if (onLoading) onLoading(true); // <--- Повідомляємо, що почали

    try {
      // КРОК 0: ПРОБИВАЄМО ЗАМОК АВТОРИЗАЦІЇ (2 секунди)
      console.log("🛰️ Step 0: Refreshing session lock...");

      // ЗМІНА: тепер таймаут викидає помилку SESSION_TIMEOUT
      await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SESSION_TIMEOUT")), 2000)
        )
      ]);

      console.log("✅ Step 0: Session OK.");

      const cleanPhone = phone.replace(/\D/g, '');

      const {data: orderData, error: orderError} = await Promise.race([
        supabase.from('orders').insert([{
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
        }]).select('id, order_number'),
        timeout(4000)
      ]);

      if (orderError) throw orderError;
      if (!orderData || orderData.length === 0) throw new Error("Помилка отримання даних замовлення");

      const order = orderData[0];

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

      const formattedOrderNumber = String(order.order_number).padStart(6, '0');
      setDisplayOrderNumber(formattedOrderNumber);
      setStep('success');
      if (onSuccess) onSuccess(); // Кажемо батьку (CartPage): "Тримайся, ми перемогли!"
      trigger('success');
      toast.success("Замовлення відправлене!");

      dispatch(clearEntireCart(user.id));
      await sendOrderEmail(formattedOrderNumber, items, totalPriceUah);

      await supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: cleanPhone,
        city: city,
        branch: branch,
        delivery_method: deliveryMethod,
        updated_at: new Date()
      }).then(() => console.log("👤 Profile updated"));

    } catch (error) {
      console.error("🚨 [CRITICAL ERROR]:", error);

      // ПЕРЕВІРКА НА ТАЙМАУТИ (Крок 0 або Крок 1)
      if (error.message === "SESSION_TIMEOUT" || error.message === "Час очікування вичерпано") {
        toast.error("Непередбачувана помилка. Будь ласка, перезавантажте сторінку та спробуйте ще раз.", {
          duration: 6000,
        });
      } else {
        toast.error(error.message || "Сталася помилка");
      }
    } finally {
      console.log("🏁 [ORDER FINISHED]");
      setIsSubmitting(false);
      if (onLoading) onLoading(false); // <--- Повідомляємо, що закінчили
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

  // Валідація (чистимо телефон для перевірки)
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
          {/* Обгортаємо все в fieldset і прив'язуємо до isSubmitting */}
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

          <p style={{fontSize: '0.7rem', textAlign: 'center', marginBottom: '10px'}}>За необхідності ми зв’яжемося з
            Вами за номером:<br/>
            <strong>{phone}</strong> для уточнення деталей.</p>
          <p style={{textAlign: 'center', marginBottom: '10px'}}>Дякуємо за довіру!</p>
          <Link to="/catalog"
                style={{
                  marginTop: '20px',
                  display: 'block',
                  textAlign: 'center',
                }}>
            <Button>За новими покупками</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CheckoutSidebar;