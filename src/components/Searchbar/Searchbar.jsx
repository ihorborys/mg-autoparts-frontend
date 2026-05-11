import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom"; // 1. Імпортуємо хук для URL
import { fetchProductsByQuery } from "../../redux/products/productsOps.js";
import styles from "./Searchbar.module.css";
import toast from 'react-hot-toast';
import { useHaptics } from '../../hooks/useHaptics.js';
import { clearProducts } from "../../redux/products/productsSlice.js";


const Searchbar = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // 2. Ініціалізуємо роботу з URL
  const urlQuery = searchParams.get("q") || ""; // Беремо значення параметра 'q' з URL
  const [query, setQuery] = useState(urlQuery); // 3. Початковий стан беремо з URL

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Початкова перевірка
  const dispatch = useDispatch();
  const {trigger} = useHaptics(); // Підключаємо "пульт керування"

  // Синхронізація інпуту з URL (наприклад, при натисканні кнопок "Назад/Вперед" у браузері)
  useEffect(() => {
    setQuery(urlQuery);

    // Якщо в URL вже є запит (наприклад, повернулися на сторінку) - автоматично запускаємо пошук у Redux
    if (urlQuery.trim().length >= 2) {
      dispatch(fetchProductsByQuery({
        query: urlQuery.trim(),
        limit: 20,
        offset: 0,
        isNewSearch: true
      }));

    } else if (urlQuery === "") {
      // 3. МАГІЯ: Якщо ми в каталозі, але URL чистий — Скидаємо стан до початкового
      dispatch(clearProducts());
    }

  }, [urlQuery, dispatch]); // Спрацьовує при зміні "q" в адресному рядку

  // Відстежуємо зміну розміру вікна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Визначаємо текст плейсхолдера
  const placeholderText = isMobile
    ? "Введіть артикул або бренд"
    : "Введіть артикул, бренд або разом (наприклад: 602000700, Luk або Luk 602000700)";

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery === "") {
      dispatch(clearProducts());
      trigger('error'); // Додай це сюди для тактильного відгуку
      toast.error("Введіть дані для пошуку");
      return;
    }

    if (trimmedQuery.length === 1) {
      dispatch(clearProducts());
      trigger('error'); // Додай це сюди для тактильного відгуку
      toast.error("Введіть мінімум 2 символи");
      return;
    }

    trigger('vibrateOnly'); // Вібруємо, коли натиснули пошук!

    // 4. ОНОВЛЮЄМО URL.
    // Це автоматично викличе useEffect вище, який зробить dispatch у Redux.
    setSearchParams({q: trimmedQuery});
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholderText} // ВИКОРИСТОВУЄМО ЗМІННУ
      />
      <button type="submit" className={styles.button}>
        Пошук
      </button>
    </form>
  );
};

export default Searchbar;