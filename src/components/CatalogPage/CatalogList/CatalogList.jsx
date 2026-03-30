import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem";
import { fetchProductsByQuery } from "../../../redux/products/productsOps.js";
import { fetchExchangeRate } from "../../../redux/currency/currencyOps.js"; // Імпортуємо нову операцію
import LoadMoreBtn from "../../LoadMoreBtn/LoadMoreBtn.jsx";
import styles from "./CatalogList.module.css";
import { useHaptics } from "../../../hooks/useHaptics.js";

const CatalogList = () => {
  const dispatch = useDispatch();
  const {trigger} = useHaptics();

  // Отримуємо дані про товари
  const {items, isLoading, error, searchPerformed, lastQuery, offset, hasMore} =
    useSelector((state) => state.products);

  // Отримуємо КУРС із нашого нового Redux-модуля
  const {rate, isLoading: isRateLoading} = useSelector((state) => state.currency);

  // 1. Завантажуємо курс при першому рендері
  useEffect(() => {
    dispatch(fetchExchangeRate());
  }, [dispatch]);

  // ФУНКЦІЯ ДЛЯ ПАГІНАЦІЇ
  const handleLoadMore = () => {
    trigger('vibrateOnly');
    dispatch(fetchProductsByQuery({
      query: lastQuery,
      limit: 20,
      offset: offset + 20
    }));
  };

  // 2. Логіка відображення лоадера
  if (isLoading && items.length === 0) {
    return (
      <div className={styles.loadInfoContainer}>
        <Loader/>
        <p className={styles.loadInfo}>
          {`Шукаємо: "${lastQuery}"...`}
        </p>
      </div>
    );
  }

  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

  if (!searchPerformed) return null;

  if (searchPerformed && items.length === 0) {
    return (
      <div style={{textAlign: 'center', marginTop: '50px'}}>
        <h3>Нічого не знайдено за запитом <span style={{color: 'red'}}>"{lastQuery}"</span></h3>
      </div>
    );
  }

  return (
    <div style={{paddingBottom: '50px'}}>
      <ul style={{listStyle: "none", padding: 0}}>
        {items.map((product) => (
          <CatalogItem
            key={`${product.code}-${product.supplier_id}-${product.brand}`}
            product={product}
            exchangeRate={rate} // Передаємо курс із Redux
          />
        ))}
      </ul>

      {hasMore && items.length > 0 && (
        <LoadMoreBtn onClick={handleLoadMore} isLoading={isLoading}/>
      )}
    </div>
  );
};

export default CatalogList;