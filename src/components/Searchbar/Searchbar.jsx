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
    : "Введіть артикул або бренд (наприклад: 602000700 або Luk)";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim() === "") {
      toast.error("Введіть артикул або бренд!", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      return; // Зупиняємо функцію, щоб dispatch не спрацював
    }

    if (query.trim().length === 1) {
      toast.error("Введіть мінімум 2 символи для пошуку", {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      return; // Зупиняємо функцію, щоб dispatch не спрацював
    }

    dispatch(fetchProductsByQuery(query));
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