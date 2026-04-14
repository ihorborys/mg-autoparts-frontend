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
import { DELIVERY_CONFIG, getSupplierName } from '../../utils/helpers.js';
import emailjs from '@emailjs/browser';

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

  console.log("Дані користувача з контексту:", user);

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

  const sendOrderEmail = async (orderId, currentItems) => {
    // Формуємо рядки таблиці
    const tableRows = currentItems.map(item => {
      const itemPriceUah = Math.round(item.price_eur * rate);
      const supplierName = getSupplierName(item.supplier_id);

      return `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 12px 8px; vertical-align: top;">
            <div style="font-size: 12px; color: #444444; font-family: Verdana, sans-serif; margin-bottom: 2px;">
              ${item.code}
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #000000; font-family: Verdana, sans-serif; text-transform: uppercase; margin-bottom: 2px;">
              ${item.brand}
            </div>
            <div style="font-size: 10px; color: #888888; font-family: Verdana, sans-serif; line-height: 1.4; margin-bottom: 2px;">
              ${item.name}
            </div>
            <div style="font-size: 8px; color: #444444; font-family: Verdana, sans-serif;">
              ${supplierName}
            </div>
          </td>
          <td style="padding: 12px 8px; vertical-align: top; text-align: center; width: 60px; font-family: Verdana, sans-serif; font-size: 13px; color: #333;">
            ${item.quantity} шт.
          </td>
          <td style="padding: 12px 8px; vertical-align: top; text-align: right; width: 90px; font-family: Verdana, sans-serif; font-size: 14px; font-weight: bold; color: #000; white-space: nowrap;">
            ${itemPriceUah} грн.
          </td>
        </tr>
      `;
    }).join('');

    const itemsHtmlTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background-color: #ffffff; border: 1px solid #e5e5e5;">
        <thead>
          <tr style="background-color: #f9f9f9; border-bottom: 2px solid #333333;">
            <th style="padding: 12px 8px; text-align: left; font-family: Verdana, sans-serif; font-size: 12px; text-transform: uppercase; color: #666666; letter-spacing: 0.5px;">Товар</th>
            <th style="padding: 12px 8px; text-align: center; font-family: Verdana, sans-serif; font-size: 12px; text-transform: uppercase; color: #666666; width: 60px;">К-сть</th>
            <th style="padding: 12px 8px; text-align: right; font-family: Verdana, sans-serif; font-size: 12px; text-transform: uppercase; color: #666666; width: 90px;">Ціна</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    // 2. Готуємо змінні, які ми прописали в шаблоні {{ }}
    const templateParams = {
      user_name: `${firstName} ${lastName}`,
      user_email: user?.email || 'test@test.com', // пошта клієнта
      user_phone: phone,
      order_id: orderId,
      items_list: itemsHtmlTable,
      total_price: `${totalPriceUah} грн.`,
      delivery_info: deliveryMethod === 'self' ? 'Самовивіз (Самбір)' : `Нова Пошта: ${city}, відд. №${branch}`,
      notes: notes || 'Немає'
    };

    try {
      await emailjs.send(
        'maxgear_test_mail', // Твій Service ID
        'template_bc6n5f9',   // ЗАМІНИ НА СВІЙ
        templateParams,
        'iIt13DUfNkwXlCzyl'     // ЗАМІНИ НА СВІЙ
      );
      console.log('Лист успішно відправлено!');
    } catch (error) {
      console.error('Помилка відправки листа:', error);
    }
  };

  const handleFinalOrder = async () => {
    console.log("--- СТАРТ ВІДПРАВКИ ---");

    if (!user) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    setIsSubmitting(true);
    const currentCfg = DELIVERY_CONFIG[deliveryMethod];

    try {
      // 1. СТВОРЮЄМО ЗАМОВЛЕННЯ
      console.log("Крок 1: Запис основного замовлення...");
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
          ship_branch: currentCfg.type === 'branch' ? branch : null,
          ship_address: currentCfg.type === 'address' ? branch : null,
          ship_notes: currentCfg.type === 'note'
            ? `${notes} (Самовивіз: ${branch})`.trim()
            : notes
        }])
        .select().single();

      if (orderError) throw orderError;
      console.log("✅ Замовлення створено, ID:", order.id);

      // Форматуємо номер (робимо 6 знаків)
      const formattedOrderNumber = String(order.order_number).padStart(6, '0');
      console.log("Сформовано номер замовлення:", formattedOrderNumber);

      // 2. ЗАПИСУЄМО ТОВАРИ (Це критично, робимо відразу)
      console.log("Крок 2: Запис товарів замовлення...");
      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        supplier_id: item.supplier_id,
        code: item.code,
        brand: item.brand,
        price_eur: item.price_eur,
        quantity: item.quantity
      }));

      const {error: itemsError} = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
      console.log("✅ Товари збережено");

      setDisplayOrderNumber(formattedOrderNumber);

      // --- МОМЕНТ УСПІХУ ---
      // На цьому етапі дані вже в безпеці. Показуємо успіх клієнту!
      setStep('success');
      trigger('success');
      toast.success("Замовлення прийнято!");

      // 3. ВСЕ ІНШЕ РОБИМО У ФОНІ
      console.log("Крок 3: Запуск фонових процесів...");

      // Відправка пошти (це async функція, тому .catch тут працює)
      sendOrderEmail(formattedOrderNumber, items).catch(err => console.error("Email Error:", err));

      // Оновлення профілю (використовуємо .then замість .catch)
      supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: cleanPhone,
        city: city,
        branch: branch,
        delivery_method: deliveryMethod,
        updated_at: new Date()
      }).then(({error}) => {
        if (error) console.error("Profile Update Error:", error);
        else console.log("✅ Профіль оновлено");
      });

      // Очищення кошика (без await)
      dispatch(clearEntireCart(user.id));

    } catch (error) {
      console.error("🚨 Помилка оформлення:", error);
      toast.error(`Сталася помилка: ${error.message || 'Невідома помилка'}`);
    } finally {
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