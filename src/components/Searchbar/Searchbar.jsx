import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProductsByQuery } from "../../redux/productsOps";
import styles from "./Searchbar.module.css";
import toast from 'react-hot-toast';


const Searchbar = () => {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Початкова перевірка
  const dispatch = useDispatch();

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
      toast.error("Введіть дані для пошуку");
      return;
    }

    if (trimmedQuery.length === 1) {
      toast.error("Введіть мінімум 2 символи");
      return;
    }

    // При сабміті форми ми завжди шукаємо першу порцію (offset: 0)
    // Ми передаємо об'єкт з параметрами
    dispatch(fetchProductsByQuery({
      query: trimmedQuery,
      limit: 20,
      offset: 0,
      isNewSearch: true // Прапорець, щоб Redux знав: треба стерти старі результати
    }));

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