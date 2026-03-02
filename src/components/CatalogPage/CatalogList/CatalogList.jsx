import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem";
import { fetchProductsByQuery } from "../../../redux/productsOps.js";
import LoadMoreBtn from "../../LoadMoreBtn/LoadMoreBtn.jsx";
import styles from "./CatalogList.module.css";


const CatalogList = () => {
  const dispatch = useDispatch(); // 2. ПЕРЕВІР ІНІЦІАЛІЗАЦІЮ

  const {items, isLoading, error, searchPerformed, lastQuery, offset, hasMore} = useSelector((state) => state.products);

  // 1. Додаємо стан для курсу
  const [exchangeRate, setExchangeRate] = useState(52); // Fallback 52 за замовчуванням
  const [isRateLoading, setIsRateLoading] = useState(true);

  // 2. Отримуємо курс з твого нового роута на бекенді
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://mg-autoparts-backend.onrender.com/api/get-rate');
        const data = await response.json();
        setExchangeRate(data.rate);
      } catch (err) {
        console.error("Не вдалося отримати курс, використовуємо запасний:", err);
      } finally {
        setIsRateLoading(false);
      }
    };

    fetchRate();
  }, []);

  // ФУНКЦІЯ ДЛЯ ЗАВАНТАЖЕННЯ НАСТУПНОЇ ПОРЦІЇ
  const handleLoadMore = () => {
    dispatch(fetchProductsByQuery({
      query: lastQuery,
      limit: 20,
      offset: offset + 20 // Збільшуємо відступ
    }));
  };

// 1. Головний лоадер показуємо ТІЛЬКИ якщо товарів ще немає взагалі
  if ((isLoading && items.length === 0) || isRateLoading) {
    return (
      <div className={styles.loadInfoContainer}>
        <Loader></Loader>
        <p className={styles.loadInfo}>
          {isLoading ? `Шукаємо: "${lastQuery}"...` : "Оновлюємо курс валют..."}
        </p>
      </div>
    );
  }

  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

  if (!searchPerformed) {
    return <div style={{textAlign: 'center', marginTop: '40px', color: '#888'}}></div>;
  }

  if (searchPerformed && items.length === 0) {
    return (
      <div style={{textAlign: 'center', marginTop: '50px'}}>
        <h3>На жаль, за запитом <span style={{color: 'red'}}>"{lastQuery}"</span> нічого не знайдено</h3>
        <p style={{fontStyle: 'italic', marginTop: '10px'}}>Спробуйте інший артикул або перевірте розкладку
          клавіатури.</p>
      </div>
    );
  }

  return (
    <div style={{paddingBottom: '50px'}}>
      <ul style={{listStyle: "none", padding: 0}}>
        {items.map((product) => {
          // 1. Створюємо ключ у змінній
          const itemKey = `${product.code}-${product.supplier_id}-${product.price_eur}`;

          // 2. Виводимо в консоль
          console.log("Генерую ключ для товару:", itemKey);

          // 3. Повертаємо компонент
          return (
            <CatalogItem
              key={itemKey}
              product={product}
              exchangeRate={exchangeRate}
            />
          );
        })}
      </ul>

      {/* 2. КНОПКА ПАГІНАЦІЇ: з'являється тільки якщо є що вантажити */}
      {hasMore && items.length > 0 && (
        <LoadMoreBtn
          onClick={handleLoadMore}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CatalogList;