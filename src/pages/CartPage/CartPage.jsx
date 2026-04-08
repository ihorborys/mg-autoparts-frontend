import { useState } from 'react';
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

  const totalPriceUah = Math.round(totalPriceEur * rate);

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhone.length === 12;

  // Валідація: тепер все крім приміток — обов'язкове
  const isFormValid = isPhoneValid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    city.trim().length >= 2 &&
    branch.trim().length > 0;

  const handleFinalOrder = async () => {
    console.log("Мій кошик з Redux:", items); // <--- ДОДАЙ ЦЕ
    if (!user) {
      toast.error("Будь ласка, увійдіть в акаунт");
      return;
    }

    setIsSubmitting(true);
    try {
      const {data: order, error: orderError} = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_price_eur: totalPriceEur,
          total_price_uah: totalPriceUah,
          status: 'new',
          payment_method: paymentMethod, // 'cod' або 'card'
          ship_first_name: firstName,
          ship_last_name: lastName,
          ship_phone: cleanPhone,
          ship_city: city,
          ship_method: deliveryMethod, // Завжди НП
          ship_branch: branch, // Номер відділення
          ship_notes: notes, // Всі побажання тут
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. СТВОРЮЄМО РЯДКИ ЗАМОВЛЕННЯ (order_items)
      // Ми беремо items з Redux і готуємо їх для Supabase
      const itemsToInsert = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id, // Якщо у тебе в Redux це product_id
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

      // 3. ОНОВЛЮЄМО ПРОФІЛЬ (profiles)
      // Зберігаємо телефон та адресу як "дефолтні" для наступного разу
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName, // Оновлюємо ім'я
          last_name: lastName,   // Оновлюємо прізвище
          phone: cleanPhone,
          city: city,
          branch: branch,
          delivery_method: 'np_branch', // або deliveryMethod, якщо він у тебе в стейті
          updated_at: new Date()
        });

      // 4. ОЧИЩАЄМО КОШИК НА СЕРВЕРІ ТА В REDUX
      await dispatch(clearEntireCart(user.id)).unwrap();

      // 5. УСПІХ
      setStep('success');
      trigger('success');
      toast.success("Замовлення прийнято!");

    } catch (error) {
      console.error("Помилка оформлення:", error);
      toast.error(`Сталася помилка: ${error.message || 'Невідома помилка'}`);
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

                {/* 3. Місто */}
                <div className={styles.field}>
                  <label>Нова Пошта (Місто)*</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Полтава"
                  />
                </div>

                {/* 4. Відділення*/}
                <div className={styles.field}>
                  <label>Номер відділення *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="3"
                  />
                </div>

                {/* 5. Спосіб оплати */}
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

                {/*<div className={styles.field}>*/}
                {/*  <label>Спосіб оплати *</label>*/}
                {/*  <div className={styles.radioGroup}>*/}
                {/*    <label className={`${styles.radioLabel} ${paymentMethod === 'cod' ? styles.activeRadio : ''}`}>*/}
                {/*      <input*/}
                {/*        type="radio"*/}
                {/*        name="payment"*/}
                {/*        value="cod"*/}
                {/*        checked={paymentMethod === 'cod'}*/}
                {/*        onChange={(e) => setPaymentMethod(e.target.value)}*/}
                {/*      />*/}
                {/*      <span>Оплата при отриманні</span>*/}
                {/*    </label>*/}
                {/*    <label className={`${styles.radioLabel} ${paymentMethod === 'card' ? styles.activeRadio : ''}`}>*/}
                {/*      <input*/}
                {/*        type="radio"*/}
                {/*        name="payment"*/}
                {/*        value="card"*/}
                {/*        checked={paymentMethod === 'card'}*/}
                {/*        onChange={(e) => setPaymentMethod(e.target.value)}*/}
                {/*      />*/}
                {/*      <span>Оплата на карту</span>*/}
                {/*    </label>*/}
                {/*  </div>*/}
                {/*</div>*/}

                {/* 6. Примітки */}
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