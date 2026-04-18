import { useEffect, useState } from 'react';
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
import { supabase } from '../../supabaseClient'; // Перевір правильність шляху до клієнта
import { DELIVERY_CONFIG } from '../../utils/helpers.js';

const formatPhoneToMask = (phone) => {
  if (!phone) return '';

  // Прибираємо все зайве, залишаємо тільки цифри
  const digits = phone.replace(/\D/g, '');

  // Якщо це український номер (380...), розбиваємо його по шматочках
  if (digits.length === 12 && digits.startsWith('380')) {
    const code = digits.slice(2, 5);    // 097
    const part1 = digits.slice(5, 8);   // 661
    const part2 = digits.slice(8, 10);  // 60
    const part3 = digits.slice(10, 12); // 24

    return `+38 (${code}) ${part1}-${part2}-${part3}`;
  }

  // Якщо формат інший, просто додаємо плюс на початку (про всяк випадок)
  return digits.startsWith('+') ? digits : `+${digits}`;
};


const CartPage = () => {
  const {user} = useAuth();
  const {items, totalPriceEur} = useSelector((state) => state.cart);
  const rate = useSelector((state) => state.currency.rate);
  const {trigger} = useHaptics();
  const dispatch = useDispatch();


  const [step, setStep] = useState('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Оголошуємо всі поля, для відправки в базу
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(''); // Місто окремо
  const [deliveryMethod, setDeliveryMethod] = useState('np_branch'); // np_branch, np_courier, self
  const [branch, setBranch] = useState(''); // Відділення
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod (оплата при отриманні), prepay
  const [notes, setNotes] = useState(''); // Стейт для приміток
  const [displayOrderNumber, setDisplayOrderNumber] = useState('');

  // Додатково: якщо дані підтягуються з бази після завантаження сторінки
  useEffect(() => {
    // // ЯКЩО МИ ВЖЕ ВІДПРАВЛЯЄМО - ВИХОДИМО, НЕ ЧІПАЄМО СТЕЙТИ!
    if (isSubmitting) return;

    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.branch) setBranch(user.branch);
      if (user.delivery_method) {
        setDeliveryMethod(user.delivery_method);
      }

      // Форматуємо телефон під маску, якщо він є в базі
      if (user.phone) {
        const formatted = formatPhoneToMask(user.phone);
        setPhone(formatted);
      }
    }
  }, [user]);


  // // 🔥 "ТИХИЙ ПРОГРІВ" СЕСІЇ (той самий костиль)
  // useEffect(() => {
  //   // Як тільки юзер перейшов до форми (step === 'checkout')
  //   // і ми ще не почали процес відправки
  //   if (step === 'checkout' && !isSubmitting) {
  //     console.log("🕯️ Прогрів сесії: готуємо ґрунт для замовлення...");
  //
  //     // Робимо максимально легкий запит до Supabase.
  //     // Це змушує бібліотеку заздалегідь перевірити токен і зняти всі блокування (locks)
  //     // з пам'яті браузера, поки юзер ще заповнює поля форми.
  //     supabase.auth.getSession()
  //       .then(({data}) => {
  //         if (data?.session) {
  //           console.log("✅ Сесія розігріта. Шлях вільний.");
  //         } else {
  //           console.log("⚠️ Сесія відсутня, але контакт із базою встановлено.");
  //         }
  //       })
  //       .catch((err) => {
  //         console.warn("⚠️ Прогрів не вдався, але це не критично:", err.message);
  //       });
  //   }
  // }, [step, isSubmitting]); // Спрацює один раз при переході на крок оформлення
  //
  // console.log("Дані користувача з контексту:", user);

  const totalPriceUah = Math.round(totalPriceEur * rate);

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 12;

  // РОЗУМНА ВАЛІДАЦІЯ
  const currentDelivery = DELIVERY_CONFIG[deliveryMethod];
  const isBranchValid = !currentDelivery.required || branch.trim().length > 0;
  const isCityRequired = deliveryMethod !== 'self';
  const isCityValid = !isCityRequired || city.trim().length >= 2;

  const isFormValid = isPhoneValid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    isCityValid &&
    isBranchValid;


  const sendOrderEmail = async (orderId, currentItems, totalPrice) => {
    try {
      // 1. Отримуємо пошту ПРЯМО ТУТ
      const {data: {user: authUser}} = await supabase.auth.getUser();
      const clientEmail = authUser?.email;

      // 2. Формуємо об'єкт (Payload)
      // Якщо значення порожнє, ми примусово ставимо текст, щоб побачити його в дампі
      const payload = {
        order_id: orderId,
        user_name: `${firstName} ${lastName}` || "Unknown User",
        user_email: clientEmail || "email-not-found@test.com",
        user_phone: phone || "phone-not-found",
        delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `Нова Пошта: ${city}, відд. №${branch}`,
        total_price: totalPrice,
        items: currentItems,
      };

      console.log("📤 REACT ПЕРЕДАЄ ЦЕЙ ОБ'ЄКТ:", payload);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const response = await fetch(`${API_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Server error");
      console.log('✅ Бекенд отримав дані');

    } catch (error) {
      console.error('🌐 Помилка відправки:', error);
    }
  };

  const handleFinalOrder = async () => {
    console.log("--- 🔍 СТАРТ ДІАГНОСТИКИ ЗАМОВЛЕННЯ ---");

    if (!user || !user.id) {
      console.error("❌ Помилка: Юзер відсутній в контексті");
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    setIsSubmitting(true);

    try {
      // ПЕРЕВІРКА СЕСІЇ (Додаємо цей блок)
      console.log("1. Перевірка сесії Supabase...");
      const {data: sessionData, error: sessionError} = await supabase.auth.getSession();
      console.log("   Результат сесії:", {sessionData, sessionError});

      if (sessionError) throw new Error(`Auth Error: ${sessionError.message}`);
      if (!sessionData.session) throw new Error("Сесія протухла. Спробуйте вийти і зайти знову.");

      // 1. СТВОРЮЄМО ЗАМОВЛЕННЯ
      console.log("2. Спроба запису в таблицю 'orders'...");

      const {data: order, error: orderError} = await supabase
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
        .select('id, order_number')
        .single();

      console.log("3. Результат запису 'orders':", {order, orderError});

      if (orderError) {
        console.error("❌ РЕАЛЬНА ПОМИЛКА SUPABASE (Крок 1):", orderError);
        throw orderError;
      }

      // 2. ЗАПИСУЄМО ТОВАРИ
      console.log("4. Підготовка товарів для запису...");
      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        supplier_id: item.supplier_id,
        code: item.code,
        brand: item.brand,
        price_eur: item.price_eur,
        quantity: item.quantity
      }));

      console.log("5. Спроба запису товарів...");
      const {error: itemsError} = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("❌ ПОМИЛКА ЗАПИСУ ТОВАРІВ (Крок 2):", itemsError);
        throw itemsError;
      }
      console.log("✅ Товари збережено успішно");

      // --- МОМЕНТ УСПІХУ ---
      const formattedOrderNumber = String(order.order_number).padStart(6, '0');
      setDisplayOrderNumber(formattedOrderNumber);
      setStep('success');
      setIsSubmitting(false);
      trigger('success');
      toast.success("Замовлення прийняте!");

      dispatch(clearEntireCart(user.id));

      // 3. ФОНОВІ ПРОЦЕСИ
      console.log("6. Запуск фонових процесів (Email & Profile)...");
      sendOrderEmail(formattedOrderNumber, items, totalPriceUah);

      supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: cleanPhone,
        city: city,
        branch: branch,
        delivery_method: deliveryMethod,
        updated_at: new Date()
      }).then(({error: profileError}) => {
        if (profileError) console.error("Profile Update Error:", profileError);
        else console.log("✅ Профіль оновлено");
      });

    } catch (error) {
      console.error("🚨 КРИТИЧНА ПОМИЛКА:", error);
      toast.error(error.message || "Сталася помилка");
      setIsSubmitting(false);
    }
  };

  // Порожній кошик показуємо тільки якщо замовлення ще не оформлене
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
          {step === 'success' ? 'Замовлення прийняте!' : 'Моє замовлення'}
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
                <h3 className={styles.checkoutTitle}>Оформлення замовлення</h3>

                {/* 1. ПІБ */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Прізвище *</label>
                    <input
                      className={styles.input}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Кондратюк"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Ім'я *</label>
                    <input
                      className={styles.input}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Юрій"
                    />
                  </div>
                </div>

                {/* 2. Телефон з маскою */}
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

                {/* 3. Вибір способу доставки */}
                <div className={styles.field}>
                  <label>Спосіб доставки *</label>
                  <select
                    className={styles.select}
                    value={deliveryMethod}
                    onChange={(e) => {
                      setDeliveryMethod(e.target.value);
                      setBranch(''); // Очищаємо поле при зміні методу
                    }}
                  >
                    {Object.entries(DELIVERY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Місто */}
                {/* Відображаємо місто тільки якщо це НЕ самовивіз */}
                {deliveryMethod !== 'self' && (
                  <div className={styles.field}>
                    <label>Місто *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Наприклад: Полтава"
                    />
                  </div>
                )}

                {/* Динамічне поле (Відділення / Адреса) — ховаємо для самовивозу */}
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

                {/* 6. Спосіб оплати */}
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

                {/* 7. Примітки */}
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

            {/* КРОК 3: УСПІХ (ПОВЕРНУВ ЦЕЙ БЛОК) */}
            {step === 'success' && (
              <div className={styles.animateFade}>
                <div className={styles.successIcon}>✓</div>
                <h3 style={{color: '#2ecc71'}}>Готово!</h3>
                <p>Замовлення №{displayOrderNumber} успішно створене.</p>
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
